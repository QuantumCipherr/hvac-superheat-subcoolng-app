#!/usr/bin/env node
/* Acceptance-criteria harness for the Practice system (build spec §6).
 *
 * This does NOT re-implement any logic. It loads the real inline <script>
 * out of superheat-subcooling-trainer.html, runs it under a minimal DOM
 * shim so the page "loads" exactly as it does in a browser, then calls the
 * in-file runSelfTest(). One source of truth — the HTML file.
 *
 *   node practice-selftest.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "superheat-subcooling-trainer.html");
const html = fs.readFileSync(file, "utf8");

// pull the single inline <script> block
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("No <script> block found."); process.exit(2); }
const scriptBody = m[1];

/* ---- minimal DOM shim: just enough for the page to construct ---- */
function makeNode() {
  const style = { setProperty() {}, removeProperty() {} };
  const node = {
    style, dataset: {}, className: "", id: "", value: "", checked: false,
    textContent: "", innerHTML: "", onclick: null,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, setAttributeNS() {}, getAttribute() { return null; },
    removeAttribute() {}, appendChild(c) { return c; }, append() {}, prepend() {},
    insertBefore(c) { return c; }, removeChild(c) { return c; }, remove() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    setProperty() {}, focus() {}, blur() {}, select() {}, click() {},
    querySelector() { return makeNode(); }, querySelectorAll() { return []; },
    getElementsByClassName() { return []; }, closest() { return null; },
    cloneNode() { return makeNode(); }, contains() { return false; },
  };
  return node;
}

const elements = new Map(); // cache by id so custom props (svg._needle) persist
const document = {
  getElementById(id) { if (!elements.has(id)) { const n = makeNode(); n.id = id; elements.set(id, n); } return elements.get(id); },
  createElement() { return makeNode(); },
  createElementNS() { return makeNode(); },
  createTextNode() { return makeNode(); },
  querySelector() { return makeNode(); },
  querySelectorAll() { return []; },
  getElementsByClassName() { return []; },
  addEventListener() {}, removeEventListener() {},
  body: makeNode(), documentElement: makeNode(), head: makeNode(),
  execCommand() { return true; },
};
const localStorage = (() => {
  const store = {};
  return {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
  };
})();
const navigator = { clipboard: { writeText() { return Promise.resolve(); } } };
const windowShim = { print() {}, alert() {}, setTimeout, clearTimeout };
const requestAnimationFrame = (fn) => 0;
const cancelAnimationFrame = () => {};
const location = { hash: "", origin: "", pathname: "" };
const history = { replaceState() {}, pushState() {} };

/* ---- run the real page script ---- */
let runSelfTest;
try {
  const runner = new Function(
    "window", "document", "localStorage", "navigator",
    "requestAnimationFrame", "cancelAnimationFrame", "alert", "setTimeout", "clearTimeout",
    "location", "history", "console",
    scriptBody + "\n;return (typeof runSelfTest!=='undefined')?runSelfTest:(window&&window.runSelfTest);"
  );
  runSelfTest = runner(
    windowShim, document, localStorage, navigator,
    requestAnimationFrame, cancelAnimationFrame, windowShim.alert, setTimeout, clearTimeout,
    location, history, console
  );
} catch (e) {
  console.error("\n✗ The page script threw while loading (this would be a console error in the browser):\n");
  console.error(e);
  process.exit(1);
}

if (typeof runSelfTest !== "function") {
  console.error("runSelfTest was not exported by the page.");
  process.exit(1);
}

/* ---- run acceptance checks and report ---- */
console.log("\nThe Gauge Bench — Practice self-test (acceptance criteria §6)");
console.log("Source: superheat-subcooling-trainer.html (loaded under a DOM shim)\n");
const t0 = Date.now();
const { allPass, results } = runSelfTest({ n: 2000 });
const ms = Date.now() - t0;

results.forEach((r, i) => {
  console.log(`${r.pass ? "✓" : "✗"}  ${i + 1}. ${r.name}`);
  if (r.detail) console.log(`     ${r.detail}`);
});
console.log(`\n${allPass ? "✓ ALL CHECKS PASS" : "✗ SOME CHECKS FAILED"}  (${ms} ms)\n`);
process.exit(allPass ? 0 : 1);
