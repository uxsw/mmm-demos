import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const project = resolve(import.meta.dirname, "..");
const output = resolve(project, ".impeccable/review");
const pageUrl = `file://${resolve(project, "cover.html")}`;
const destination = "https://uxsw.github.io/mmm-demos/nav-prototype/index.html";

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

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function capture(width, height, name) {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 760 });
  await call("Page.navigate", { url: pageUrl });
  await new Promise((finish) => setTimeout(finish, 300));
  const audit = await evaluate(`({
    innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    hrefs: [...document.querySelectorAll('a')].map((link) => link.href),
    qrLoaded: document.querySelector('.qr-frame img').complete && document.querySelector('.qr-frame img').naturalWidth === 420
  })`);
  assert.equal(audit.documentWidth, audit.innerWidth);
  assert.equal(audit.qrLoaded, true);
  assert.deepEqual([...new Set(audit.hrefs)], [destination]);
  const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
  await writeFile(resolve(output, name), Buffer.from(data, "base64"));
  return audit;
}

await call("Page.enable");
await call("Runtime.enable");
const desktop = await capture(1440, 900, "cover-desktop.png");
const mobile = await capture(390, 844, "cover-mobile.png");

const accessibility = await call("Accessibility.getFullAXTree");
const roles = accessibility.nodes.reduce((counts, node) => {
  const role = node.role?.value;
  if (role) counts[role] = (counts[role] || 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({ desktop, mobile, roles: { main: roles.main || 0, link: roles.link || 0, image: roles.image || 0 } }, null, 2));
browser.kill();
