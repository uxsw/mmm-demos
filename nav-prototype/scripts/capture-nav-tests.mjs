import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const project = resolve(import.meta.dirname, "..");
const output = resolve(project, ".impeccable/review");

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

const settle = () => new Promise((finish) => setTimeout(finish, 300));

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function viewport(width, height) {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 760 });
}

async function navigate(file) {
  await call("Page.navigate", { url: `file://${resolve(project, file)}` });
  await settle();
}

async function screenshot(name) {
  const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
  await writeFile(resolve(output, name), Buffer.from(data, "base64"));
}

await viewport(390, 844);
await navigate("index.html");
await screenshot("nav-variants-launcher.png");
assert.equal(await evaluate(`document.querySelectorAll('.launcher-options a').length`), 4);

await navigate("with-avatar.html");
await screenshot("nav-with-avatar.png");
assert.deepEqual(await evaluate(`({ hamburger: !!document.querySelector('#open-navigation'), avatar: !!document.querySelector('#open-avatar-menu') })`), { hamburger: true, avatar: true });

await evaluate(`document.querySelector('#open-avatar-menu').click()`);
await screenshot("nav-with-avatar-popover.png");
assert.deepEqual(await evaluate(`({ open: !document.querySelector('#avatar-popover').hidden, message: document.querySelector('#avatar-popover p').textContent })`), { open: true, message: "Avatar menu launched" });

await evaluate(`document.querySelector('#close-avatar-menu').click(); document.querySelector('#open-navigation').click()`);
await settle();
await screenshot("nav-with-avatar-menu.png");
assert.deepEqual(await evaluate(`({ open: document.querySelector('#navigation-drawer').classList.contains('is-open'), sections: document.querySelectorAll('#test-navigation details').length, accountInside: !!document.querySelector('.menu-account') })`), { open: true, sections: 6, accountInside: false });

await navigate("without-avatar.html");
await screenshot("nav-without-avatar.png");
assert.deepEqual(await evaluate(`({ hamburger: !!document.querySelector('#open-navigation'), avatar: !!document.querySelector('#open-avatar-menu') })`), { hamburger: true, avatar: false });

await evaluate(`document.querySelector('#open-navigation').click()`);
await settle();
await screenshot("nav-without-avatar-menu.png");
assert.deepEqual(await evaluate(`({ open: document.querySelector('#navigation-drawer').classList.contains('is-open'), sections: document.querySelectorAll('#test-navigation details').length, accountInside: !!document.querySelector('.menu-account .header-avatar') })`), { open: true, sections: 6, accountInside: true });
assert.deepEqual(await evaluate(`({ active: document.activeElement.id, appBarInert: document.querySelector('.app-bar').inert, mapInert: document.querySelector('.map-placeholder').inert, accountIsButton: document.querySelector('.menu-account .header-avatar').matches('button') })`), { active: "close-navigation", appBarInert: true, mapInert: true, accountIsButton: false });

assert.equal(await evaluate(`(() => { document.querySelector('#open-navigation').focus(); return document.activeElement.id; })()`), "close-navigation");

assert.equal(await evaluate(`(() => {
  const focusable = [...document.querySelectorAll('#navigation-drawer button, #navigation-drawer summary, #navigation-drawer a[href]')].filter((element) => element.getClientRects().length);
  focusable.at(-1).focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  return document.activeElement.id;
})()`), "close-navigation");

assert.deepEqual(await evaluate(`(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return { active: document.activeElement.id, open: document.querySelector('#navigation-drawer').classList.contains('is-open'), appBarInert: document.querySelector('.app-bar').inert };
})()`), { active: "open-navigation", open: false, appBarInert: false });

await evaluate(`document.querySelector('#open-navigation').click()`);

await evaluate(`document.querySelector('#test-navigation summary').click()`);
assert.equal(await evaluate(`document.querySelectorAll('#test-navigation details[open]').length`), 1);

const layoutAudit = await evaluate(`({ innerWidth, documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight })`);
assert.deepEqual(layoutAudit, { innerWidth: 390, documentWidth: 390, documentHeight: 844 });

await viewport(1440, 1000);
await navigate("with-avatar.html");
await screenshot("nav-variants-desktop.png");
assert.equal(await evaluate(`document.documentElement.scrollWidth`), 1440);

const accessibility = await call("Accessibility.getFullAXTree");
const roles = accessibility.nodes.reduce((counts, node) => {
  const role = node.role?.value;
  if (role) counts[role] = (counts[role] || 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({ layoutAudit, roles: { button: roles.button || 0, navigation: roles.navigation || 0, link: roles.link || 0 } }, null, 2));
browser.kill();
