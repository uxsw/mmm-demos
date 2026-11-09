import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const project = resolve(import.meta.dirname, "..");
const output = resolve(project, ".impeccable/review");
const pageUrl = `file://${resolve(project, "accordion.html")}`;

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
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 760 });
}

async function screenshot(name) {
  const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
  await writeFile(resolve(output, name), Buffer.from(data, "base64"));
}

await viewport(390, 844);
await call("Page.navigate", { url: pageUrl });
await settle();
await screenshot("mobile.png");

await evaluate(`document.querySelector('[data-section="map"] .nav-summary').click()`);
await settle();
await screenshot("mobile-map.png");

const nativeAudit = await evaluate(`(() => {
  document.querySelector('[data-section="briefing"] .nav-summary').click();
  return {
    openSections: document.querySelectorAll('details[open]').length,
    openId: document.querySelector('details[open]')?.dataset.section
  };
})()`);
assert.deepEqual(nativeAudit, { openSections: 1, openId: "briefing" });

await call("Page.navigate", { url: `${pageUrl}?method=custom` });
await settle();
await evaluate(`document.querySelector('[data-section="map"] .nav-trigger').click()`);
await settle();
await screenshot("mobile-custom.png");

const mobileAudit = await evaluate(`(() => ({
  innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  sections: document.querySelectorAll('[data-section]').length,
  openSections: document.querySelectorAll('.nav-section.is-open, details[open]').length,
  mapLinks: [...document.querySelectorAll('[data-section="map"] .nav-link')].length,
  triggerExpanded: document.querySelector('[data-section="map"] .nav-trigger')?.getAttribute('aria-expanded')
}))()`);
assert.equal(mobileAudit.innerWidth, 390);
assert.equal(mobileAudit.documentWidth, 390);
assert.equal(mobileAudit.sections, 6);
assert.equal(mobileAudit.openSections, 1);
assert.equal(mobileAudit.mapLinks, 26);
assert.equal(mobileAudit.triggerExpanded, "true");

const searchAudit = await evaluate(`(() => {
  const search = document.querySelector('#nav-search');
  search.value = 'wind fletches';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  return {
    visibleSections: document.querySelectorAll('[data-section]').length,
    visibleLinks: document.querySelectorAll('.nav-link').length,
    summary: document.querySelector('#search-summary').textContent
  };
})()`);
assert.deepEqual(searchAudit, { visibleSections: 1, visibleLinks: 5, summary: "5 results" });

await evaluate(`(() => {
  const search = document.querySelector('#nav-search');
  search.value = '';
  search.dispatchEvent(new Event('input', { bubbles: true }));
})()`);

const selectionAudit = await evaluate(`(() => {
  document.querySelector('[href="#map-surface-pressure"]').click();
  document.querySelector('[data-section="briefing"] .nav-trigger').click();
  const briefingCurrentCount = document.querySelectorAll('[aria-current="page"]').length;
  document.querySelector('[data-section="map"] .nav-trigger').click();
  return {
    briefingCurrentCount,
    mapCurrentCount: document.querySelectorAll('[aria-current="page"]').length,
    currentHref: document.querySelector('[aria-current="page"]')?.getAttribute('href')
  };
})()`);
assert.deepEqual(selectionAudit, { briefingCurrentCount: 1, mapCurrentCount: 1, currentHref: "#map-surface-pressure" });

const closeAudit = await evaluate(`(() => {
  document.querySelector('#close-menu').click();
  return true;
})()`);
assert.equal(closeAudit, true);
await settle();
assert.deepEqual(await evaluate(`({ page: location.pathname.split('/').pop(), choices: document.querySelectorAll('.launcher-options a').length })`), { page: "index.html", choices: 2 });
await call("Page.navigate", { url: pageUrl });
await settle();

await viewport(790, 900);
await settle();
const intermediateAudit = await evaluate(`({ innerWidth, documentWidth: document.documentElement.scrollWidth })`);
assert.deepEqual(intermediateAudit, { innerWidth: 790, documentWidth: 790 });

await viewport(1440, 1000);
await settle();
await screenshot("desktop.png");

const accessibilityAudit = await call("Accessibility.getFullAXTree");
const roles = accessibilityAudit.nodes.reduce((counts, node) => {
  const role = node.role?.value;
  if (role) counts[role] = (counts[role] || 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({ mobileAudit, roles: { navigation: roles.navigation || 0, button: roles.button || 0, link: roles.link || 0, searchbox: roles.searchbox || 0 } }, null, 2));

browser.kill();
