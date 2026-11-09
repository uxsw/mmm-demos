import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const project = resolve(import.meta.dirname, "..");
const output = resolve(project, ".impeccable/review");
const pageUrl = `file://${resolve(project, "screen.html")}`;

await mkdir(output, { recursive: true });

const browser = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-sandbox",
  "--remote-debugging-pipe",
  "about:blank"
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
    if (message.id && pending.has(message.id)) {
      const { resolve: finish, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : finish(message.result);
    }
  }
});

function send(method, params = {}, sessionId) {
  const id = ++nextId;
  const message = { id, method, params };
  if (sessionId) message.sessionId = sessionId;
  return new Promise((finish, reject) => {
    pending.set(id, { resolve: finish, reject });
    browser.stdio[3].write(`${JSON.stringify(message)}\0`);
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params = {}) => send(method, params, sessionId);

await call("Page.enable");
await call("Runtime.enable");

async function settle() {
  await new Promise((finish) => setTimeout(finish, 350));
}

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function viewport(width, height) {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 820 });
}

async function screenshot(name) {
  const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
  await writeFile(resolve(output, name), Buffer.from(data, "base64"));
}

await viewport(390, 844);
await call("Page.navigate", { url: pageUrl });
await settle();
await screenshot("screen-root.png");

const rootAudit = await evaluate(`({
  innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  rootButtons: document.querySelectorAll('.screen-root-button').length,
  surroundingControls: document.querySelectorAll('.test-controls, .comparison').length
})`);
assert.deepEqual(rootAudit, { innerWidth: 390, documentWidth: 390, rootButtons: 6, surroundingControls: 0 });

await evaluate(`document.querySelector('[data-section="map"]').click()`);
await settle();
await screenshot("screen-map.png");

const mapAudit = await evaluate(`({
  hash: location.hash,
  links: document.querySelectorAll('.screen-content .nav-link').length,
  title: document.querySelector('#screen-title')?.textContent,
  focused: document.activeElement.className,
  sticky: getComputedStyle(document.querySelector('.screen-view-header')).position
})`);
assert.deepEqual(mapAudit, { hash: "#map", links: 26, title: "Map", focused: "screen-back-button", sticky: "sticky" });

await evaluate(`document.querySelector('#screen-container').scrollTop = 620`);
await settle();
await screenshot("screen-map-scrolled.png");
const stickyAudit = await evaluate(`(() => {
  const container = document.querySelector('#screen-container').getBoundingClientRect();
  const header = document.querySelector('.screen-view-header').getBoundingClientRect();
  return { scrollTop: document.querySelector('#screen-container').scrollTop, containerTop: Math.round(container.top), headerTop: Math.round(header.top) };
})()`);
assert.ok(stickyAudit.scrollTop > 300);
assert.equal(stickyAudit.headerTop, stickyAudit.containerTop);

await evaluate(`document.querySelector('.screen-back-button').click()`);
await settle();
const backAudit = await evaluate(`({
  hash: location.hash,
  rootVisible: Boolean(document.querySelector('.screen-root')),
  focusedSection: document.activeElement.dataset.section
})`);
assert.deepEqual(backAudit, { hash: "", rootVisible: true, focusedSection: "map" });

await evaluate(`document.querySelector('[data-section="help"]').click()`);
await settle();
await screenshot("screen-help.png");
await evaluate(`history.back()`);
await settle();
assert.equal(await evaluate(`document.activeElement.dataset.section`), "help");

const searchAudit = await evaluate(`(() => {
  const search = document.querySelector('#nav-search');
  search.value = 'wind fletches';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  return {
    buttons: document.querySelectorAll('.screen-root-button').length,
    firstButton: document.querySelector('.screen-root-button')?.dataset.section,
    summary: document.querySelector('.search-summary').textContent,
    focused: document.activeElement.id
  };
})()`);
assert.deepEqual(searchAudit, { buttons: 1, firstButton: "map", summary: "5 results", focused: "nav-search" });

const closeAudit = await evaluate(`(() => {
  document.querySelector('#close-menu').click();
  return true;
})()`);
assert.equal(closeAudit, true);
await settle();
assert.deepEqual(await evaluate(`({ page: location.pathname.split('/').pop(), choices: [...document.querySelectorAll('.launcher-options a')].map(link => link.textContent.trim()) })`), { page: "index.html", choices: ["Accordion", "Drilling"] });
await screenshot("launcher-mobile.png");
await call("Page.navigate", { url: pageUrl });
await settle();

await viewport(790, 900);
await settle();
assert.deepEqual(await evaluate(`({ innerWidth, documentWidth: document.documentElement.scrollWidth })`), { innerWidth: 790, documentWidth: 790 });

await viewport(390, 844);
await call("Page.navigate", { url: "about:blank" });
await settle();
await call("Page.navigate", { url: `${pageUrl}#map` });
await settle();
assert.equal(await evaluate(`location.hash`), "#map");
await evaluate(`document.querySelector('.screen-back-button').click()`);
await settle();
assert.deepEqual(await evaluate(`({ hash: location.hash, rootVisible: Boolean(document.querySelector('.screen-root')), focusedSection: document.activeElement.dataset.section })`), { hash: "", rootVisible: true, focusedSection: "map" });

await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await evaluate(`document.querySelector('[data-section="map"]').click()`);
await settle();
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.screen-view')).animationName`), "none");
await call("Emulation.setEmulatedMedia", { features: [] });

await viewport(1440, 1000);
await evaluate(`location.href = ${JSON.stringify(pageUrl)}`);
await settle();
await screenshot("screen-desktop.png");
assert.equal(await evaluate(`document.querySelectorAll('.test-controls, .comparison').length`), 0);

const accessibilityAudit = await call("Accessibility.getFullAXTree");
const roles = accessibilityAudit.nodes.reduce((counts, node) => {
  const role = node.role?.value;
  if (role) counts[role] = (counts[role] || 0) + 1;
  return counts;
}, {});
assert.ok((roles.navigation || 0) >= 1);
assert.ok((roles.button || 0) >= 8);
assert.ok((roles.searchbox || 0) >= 1);

await call("Page.navigate", { url: `file://${resolve(project, "index.html")}` });
await settle();
await screenshot("launcher-desktop.png");
assert.deepEqual(await evaluate(`({ frameWidth: Math.round(document.querySelector('.phone-stage').getBoundingClientRect().width), choices: document.querySelectorAll('.launcher-options a').length })`), { frameWidth: 390, choices: 2 });

console.log(JSON.stringify({ rootAudit, mapAudit, stickyAudit, searchAudit, roles: { navigation: roles.navigation || 0, button: roles.button || 0, searchbox: roles.searchbox || 0 } }, null, 2));
browser.kill();
