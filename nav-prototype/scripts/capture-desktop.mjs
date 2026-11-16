import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const project = resolve(import.meta.dirname, "..");
const output = resolve(project, ".impeccable/review");
const pageUrl = `file://${resolve(project, "desktop.html")}`;

await mkdir(output, { recursive: true });

const browser = spawn(chrome, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
  "--remote-debugging-pipe", "about:blank"
], { stdio: ["ignore", "ignore", "inherit", "pipe", "pipe"] });

let nextId = 0;
const pending = new Map();
let buffer = "";

browser.stdio[4].setEncoding("utf8");
browser.stdio[4].on("data", (chunk) => {
  buffer += chunk;
  const messages = buffer.split("\0");
  buffer = messages.pop();
  for (const raw of messages) {
    if (!raw) continue;
    const message = JSON.parse(raw);
    if (!message.id || !pending.has(message.id)) continue;
    const { finish, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : finish(message.result);
  }
});

function send(method, params = {}, sessionId) {
  const id = ++nextId;
  const message = { id, method, params };
  if (sessionId) message.sessionId = sessionId;
  return new Promise((finish, reject) => {
    pending.set(id, { finish, reject });
    browser.stdio[3].write(`${JSON.stringify(message)}\0`);
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params = {}) => send(method, params, sessionId);
const settle = () => new Promise((finish) => setTimeout(finish, 400));

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function screenshot(name) {
  const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
  await writeFile(resolve(output, name), Buffer.from(data, "base64"));
}

await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call("Page.navigate", { url: pageUrl });
await settle();

const initial = await evaluate(`({
  width: document.documentElement.scrollWidth,
  viewport: innerWidth,
  mapVisible: !document.querySelector('#map-tools').hidden,
  layers: document.querySelectorAll('.layer-link').length,
  openPanels: document.querySelectorAll('.mega-panel.is-visible').length
})`);
assert.deepEqual(initial, { width: 1440, viewport: 1440, mapVisible: true, layers: 26, openPanels: 0 });
await screenshot("desktop-nav-map.png");

const drawerInitial = await evaluate(`(() => {
  const drawer = document.querySelector('#information-drawer');
  const toggle = document.querySelector('[data-drawer-toggle]');
  return {
    width: drawer.getBoundingClientRect().width,
    expanded: toggle.getAttribute('aria-expanded'),
    label: toggle.getAttribute('aria-label')
  };
})()`);
assert.deepEqual(drawerInitial, { width: 320, expanded: "false", label: "Expand side panel" });
assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-drawer-toggle]')).color`), "rgb(201, 209, 211)");
assert.equal(await evaluate(`document.querySelector('.drawer-remove').textContent`), "Remove layer");

const removeLayerPoint = await evaluate(`(() => {
  const rect = document.querySelector('.drawer-remove').getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
})()`);
await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...removeLayerPoint });
await settle();
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.drawer-remove')).color`), "rgb(244, 248, 251)");

const collapsedTogglePoint = await evaluate(`(() => {
  const rect = document.querySelector('[data-drawer-toggle]').getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
})()`);
await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...collapsedTogglePoint });
await settle();
assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-drawer-toggle]')).color`), "rgb(201, 235, 19)");
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.drawer-tooltip')).opacity`), "0");
await evaluate(`new Promise((resolve) => setTimeout(resolve, 300))`);
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.drawer-tooltip')).opacity`), "1");
await screenshot("desktop-drawer-expand-tooltip.png");

const drawerExpanded = await evaluate(`(async () => {
  const drawer = document.querySelector('#information-drawer');
  const toggle = document.querySelector('[data-drawer-toggle]');
  toggle.click();
  await new Promise((resolve) => setTimeout(resolve, 360));
  return {
    width: drawer.getBoundingClientRect().width,
    expanded: toggle.getAttribute('aria-expanded'),
    label: toggle.getAttribute('aria-label'),
    tooltip: toggle.querySelector('.drawer-tooltip').textContent,
    chevronTurned: getComputedStyle(toggle.querySelector('svg')).transform !== 'none'
  };
})()`);
assert.deepEqual(drawerExpanded, {
  width: 720,
  expanded: "true",
  label: "Reduce side panel",
  tooltip: "Reduce side panel",
  chevronTurned: true
});
const expandedTogglePoint = await evaluate(`(() => {
  const rect = document.querySelector('[data-drawer-toggle]').getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
})()`);
await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...expandedTogglePoint });
await settle();
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.drawer-tooltip')).opacity`), "0");
await evaluate(`new Promise((resolve) => setTimeout(resolve, 300))`);
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.drawer-tooltip')).opacity`), "1");
await screenshot("desktop-drawer-reduce-tooltip.png");
await evaluate(`document.querySelector('[data-drawer-toggle]').click()`);
await settle();

const hover = await evaluate(`(async () => {
  const trigger = document.querySelector('[data-menu-trigger="briefing"]');
  trigger.dispatchEvent(new PointerEvent('pointerenter'));
  await new Promise((resolve) => setTimeout(resolve, 150));
  const opened = document.querySelector('#briefing-panel').classList.contains('is-visible');
  document.querySelector('[data-navigation]').dispatchEvent(new PointerEvent('pointerleave'));
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    opened,
    returnedToMap: document.querySelectorAll('.mega-panel.is-visible').length === 0 &&
      document.querySelector('[data-menu-trigger="map"]').getAttribute('aria-expanded') === 'true'
  };
})()`);
assert.deepEqual(hover, { opened: true, returnedToMap: true });

await evaluate(`document.querySelector('[data-menu-trigger="layers"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('[data-menu-trigger="layers"]').getAttribute('aria-expanded')`), "true");
assert.equal(await evaluate(`document.querySelector('#layers-panel').getBoundingClientRect().width`), 1440);
await screenshot("desktop-nav-layers.png");

await evaluate(`document.querySelector('[data-menu-trigger="briefing"]').click()`);
await settle();
const briefing = await evaluate(`({
  visible: document.querySelector('#briefing-panel').classList.contains('is-visible'),
  links: document.querySelectorAll('#briefing-panel a').length,
  columns: document.querySelectorAll('#briefing-panel .link-columns > div').length,
  width: document.querySelector('#briefing-panel').getBoundingClientRect().width,
  labelsUnwrapped: Array.from(document.querySelectorAll('#briefing-panel a')).every((link) =>
    getComputedStyle(link).whiteSpace === 'nowrap' && link.scrollWidth <= link.clientWidth
  ),
  keyline: getComputedStyle(document.querySelector('#briefing-panel')).borderTopWidth,
  hasShadow: getComputedStyle(document.querySelector('#briefing-panel')).boxShadow !== 'none',
  alignedToTrigger: Math.abs(
    document.querySelector('#briefing-panel').getBoundingClientRect().right -
    document.querySelector('[data-menu-trigger="briefing"]').getBoundingClientRect().right
  ) < 1,
  expanded: document.querySelector('[data-menu-trigger="briefing"]').getAttribute('aria-expanded'),
  chevronTransform: getComputedStyle(document.querySelector('[data-menu-trigger="briefing"] svg')).transform,
  transitionDuration: getComputedStyle(document.querySelector('#briefing-panel')).transitionDuration
})`);
assert.equal(briefing.visible, true);
assert.equal(briefing.links, 5);
assert.equal(briefing.columns, 2);
assert.equal(briefing.width < 1440, true);
assert.equal(briefing.labelsUnwrapped, true);
assert.equal(briefing.keyline, "1px");
assert.equal(briefing.hasShadow, true);
assert.equal(briefing.alignedToTrigger, true);
assert.equal(briefing.expanded, "true");
assert.equal(briefing.chevronTransform, "none");
assert.notEqual(briefing.transitionDuration, "0s");
await screenshot("desktop-nav-briefing.png");

await evaluate(`document.querySelector('[data-menu-trigger="regional"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelectorAll('#regional-panel a').length`), 4);
assert.equal(await evaluate(`document.querySelectorAll('#regional-panel .link-columns > div').length`), 2);
assert.equal(await evaluate(`document.querySelector('#regional-panel').getBoundingClientRect().width < innerWidth`), true);
assert.equal(await evaluate(`Array.from(document.querySelectorAll('#regional-panel a')).every((link) =>
  getComputedStyle(link).whiteSpace === 'nowrap' && link.scrollWidth <= link.clientWidth
)`), true);
assert.equal(await evaluate(`Math.abs(
  document.querySelector('#regional-panel').getBoundingClientRect().right -
  document.querySelector('[data-menu-trigger="regional"]').getBoundingClientRect().right
) < 1`), true);
await screenshot("desktop-nav-regional.png");

const keyboard = await evaluate(`(() => {
  const trigger = document.querySelector('[data-menu-trigger="regional"]');
  trigger.focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return {
    active: document.activeElement === trigger,
    mapVisible: !document.querySelector('#map-tools').hidden,
    regionalExpanded: trigger.getAttribute('aria-expanded')
  };
})()`);
assert.deepEqual(keyboard, { active: true, mapVisible: true, regionalExpanded: "false" });

const keyboardEntry = await evaluate(`(() => {
  const trigger = document.querySelector('[data-menu-trigger="briefing"]');
  trigger.focus();
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  const enteredPanel = document.activeElement.closest('#briefing-panel')?.id || null;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return { enteredPanel, focusReturned: document.activeElement === trigger };
})()`);
assert.deepEqual(keyboardEntry, { enteredPanel: "briefing-panel", focusReturned: true });

const repeatedHover = await evaluate(`(async () => {
  const briefingTrigger = document.querySelector('[data-menu-trigger="briefing"]');
  const regionalTrigger = document.querySelector('[data-menu-trigger="regional"]');
  const highlight = document.querySelector('.nav-highlight');
  briefingTrigger.dispatchEvent(new PointerEvent('pointerenter'));
  await new Promise((resolve) => setTimeout(resolve, 140));
  const briefingTransform = getComputedStyle(highlight).transform;
  regionalTrigger.dispatchEvent(new PointerEvent('pointerenter'));
  await new Promise((resolve) => setTimeout(resolve, 300));
  const regionalTransform = getComputedStyle(highlight).transform;
  const regionalOnly = document.querySelectorAll('.mega-panel.is-visible').length === 1 &&
    document.querySelector('#regional-panel').classList.contains('is-visible');
  const sharedHighlightMoved = briefingTransform !== regionalTransform &&
    getComputedStyle(highlight).opacity === '1';
  document.querySelector('.primary-link').dispatchEvent(new PointerEvent('pointerenter'));
  const directLinkStartedSmoothly = !highlight.classList.contains('is-instant') &&
    getComputedStyle(highlight).opacity === '1';
  await new Promise((resolve) => setTimeout(resolve, 300));
  const directLinkTransform = getComputedStyle(highlight).transform;
  const directLinkAligned = document.querySelectorAll('.mega-panel.is-visible').length === 0 &&
    getComputedStyle(highlight).opacity === '1' && directLinkTransform !== regionalTransform;
  document.querySelector('[data-navigation]').dispatchEvent(new PointerEvent('pointerleave'));
  await new Promise((resolve) => setTimeout(resolve, 440));
  return {
    regionalOnly,
    sharedHighlightMoved,
    directLinkStartedSmoothly,
    directLinkAligned,
    highlightHidden: getComputedStyle(highlight).opacity === '0',
    closed: document.querySelectorAll('.mega-panel.is-visible').length === 0
  };
})()`);
assert.deepEqual(repeatedHover, { regionalOnly: true, sharedHighlightMoved: true, directLinkStartedSmoothly: true, directLinkAligned: true, highlightHidden: true, closed: true });

await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
const reducedMotionDuration = await evaluate(`getComputedStyle(document.querySelector('#briefing-panel')).transitionDuration`);
assert.match(reducedMotionDuration, /(?:0\.00001|1e-05)s/);
const drawerReducedMotionDuration = await evaluate(`getComputedStyle(document.querySelector('#information-drawer')).transitionDuration`);
assert.match(drawerReducedMotionDuration, /(?:0\.00001|1e-05)s/);
await call("Emulation.setEmulatedMedia", { features: [] });

await call("Emulation.setDeviceMetricsOverride", { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
await settle();
assert.equal(await evaluate(`document.documentElement.scrollWidth`), 1024);
await evaluate(`document.querySelector('[data-menu-trigger="briefing"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('#briefing-panel').getBoundingClientRect().width < innerWidth`), true);
assert.equal(await evaluate(`Math.abs(
  document.querySelector('#briefing-panel').getBoundingClientRect().right -
  document.querySelector('[data-menu-trigger="briefing"]').getBoundingClientRect().right
) < 1`), true);
await evaluate(`document.querySelector('[data-drawer-toggle]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('#information-drawer').getBoundingClientRect().width`), 512);

const accessibility = await call("Accessibility.getFullAXTree");
const roles = accessibility.nodes.reduce((counts, node) => {
  const role = node.role?.value;
  if (role) counts[role] = (counts[role] || 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({ initial, drawerInitial, drawerExpanded, hover, briefing, keyboard, keyboardEntry, repeatedHover, reducedMotionDuration, drawerReducedMotionDuration, roles: { navigation: roles.navigation || 0, button: roles.button || 0, link: roles.link || 0 } }, null, 2));
browser.kill();
