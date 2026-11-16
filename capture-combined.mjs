import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const project = resolve(import.meta.dirname);
const output = resolve(project, ".impeccable/review");
const pageUrl = `file://${resolve(project, "combined-prototype.html")}`;

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
const settle = (ms = 500) => new Promise((finish) => setTimeout(finish, ms));

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
await settle(1500);

const initial = await evaluate(`(() => {
  const forecast = document.querySelector('.forecast').getBoundingClientRect();
  const drawer = document.querySelector('#information-drawer').getBoundingClientRect();
  const timeline = document.querySelector('#timeline').getBoundingClientRect();
  return {
    headerHeight: document.querySelector('.site-header').getBoundingClientRect().height,
    forecastWidth: forecast.width,
    drawerWidth: drawer.width,
    timelineWidth: timeline.width,
    timelineReady: document.querySelectorAll('#ticks .tick').length > 0,
    mapPresent: Boolean(document.querySelector('#map'))
  };
})()`);
assert.equal(initial.headerHeight, 106);
assert.equal(initial.forecastWidth, 1120);
assert.equal(initial.drawerWidth, 320);
assert.equal(initial.timelineReady, true);
assert.equal(initial.mapPresent, true);
await screenshot("combined-collapsed.png");

const beforeTime = await evaluate(`document.querySelector('#selected-time').textContent.trim()`);
await evaluate(`document.querySelector('#next').click()`);
await settle(750);
const afterTime = await evaluate(`document.querySelector('#selected-time').textContent.trim()`);
assert.notEqual(afterTime, beforeTime);

await evaluate(`document.querySelector('[data-drawer-toggle]').click()`);
await settle(450);
const expanded = await evaluate(`(() => {
  const forecast = document.querySelector('.forecast').getBoundingClientRect();
  const drawer = document.querySelector('#information-drawer').getBoundingClientRect();
  const timeline = document.querySelector('#timeline').getBoundingClientRect();
  return {
    forecastWidth: forecast.width,
    drawerWidth: drawer.width,
    timelineWidth: timeline.width,
    expanded: document.querySelector('[data-drawer-toggle]').getAttribute('aria-expanded')
  };
})()`);
assert.equal(expanded.forecastWidth, 720);
assert.equal(expanded.drawerWidth, 720);
assert.equal(expanded.expanded, "true");
assert.equal(expanded.timelineWidth < initial.timelineWidth, true);
await screenshot("combined-expanded-full.png");

await evaluate(`document.querySelector('[data-menu-trigger="briefing"]').click()`);
await settle();
const briefing = await evaluate(`({
  visible: document.querySelector('#briefing-panel').classList.contains('is-visible'),
  columns: document.querySelectorAll('#briefing-panel .link-columns > div').length,
  labelsUnwrapped: Array.from(document.querySelectorAll('#briefing-panel a')).every((link) => getComputedStyle(link).whiteSpace === 'nowrap')
})`);
assert.deepEqual(briefing, { visible: true, columns: 2, labelsUnwrapped: true });
await screenshot("combined-briefing.png");

await evaluate(`document.querySelector('[data-menu-trigger="layers"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('#layers-panel').getBoundingClientRect().width`), 1440);
await screenshot("combined-layers.png");

console.log(JSON.stringify({ initial, expanded, briefing, beforeTime, afterTime }, null, 2));
browser.kill();
