// utils/helpers.js
// ─────────────────────────────────────────────────────────────────
// Reusable helpers used across all spec files.
// Keeping them here means a selector change is fixed in one place.
// ─────────────────────────────────────────────────────────────────

const path = require('path');
const fs   = require('fs');

// ── Waits ────────────────────────────────────────────────────────

/**
 * Wait until an element with the given accessibility id is visible.
 * Accessibility IDs are the safest cross-platform selector because they
 * don't change when the UI is restyled or translated.
 */
async function waitForElement(accessibilityId, timeout = 10000) {
  const el = await $(`~${accessibilityId}`);
  await el.waitForDisplayed({ timeout });
  return el;
}

/**
 * Wait until text appears anywhere on screen (useful for toast messages).
 */
async function waitForText(text, timeout = 10000) {
  const el = await $(`android=new UiSelector().text("${text}")`);
  await el.waitForDisplayed({ timeout });
  return el;
}

// ── Actions ──────────────────────────────────────────────────────

async function tapElement(accessibilityId) {
  const el = await waitForElement(accessibilityId);
  await el.click();
}

async function typeIntoField(accessibilityId, value) {
  const el = await waitForElement(accessibilityId);
  await el.clearValue();
  await el.setValue(value);
}

/**
 * Scroll down until an element is found (handles long lists).
 */
async function scrollToElement(accessibilityId) {
  await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${accessibilityId}"))`);
}

// ── Screenshots ──────────────────────────────────────────────────

async function takeScreenshot(label) {
  const dir  = path.resolve('./screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ts   = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `${label}_${ts}.png`);
  await browser.saveScreenshot(file);
  console.log(`📸  Screenshot: ${file}`);
  return file;
}

// ── App State ────────────────────────────────────────────────────

async function resetAppState() {
  await driver.terminateApp('com.wallet.crypto.trustapp');
  await driver.activateApp('com.wallet.crypto.trustapp');
  await browser.pause(2000); // let splash finish
}

// ── Clipboard ────────────────────────────────────────────────────

/**
 * Android 12+ restricts clipboard reads from background apps.
 * We work around this by reading the clipboard immediately after
 * the copy action while the app is still foregrounded.
 */
async function getClipboardText() {
  return await driver.getClipboard('plaintext');
}

module.exports = {
  waitForElement,
  waitForText,
  tapElement,
  typeIntoField,
  scrollToElement,
  takeScreenshot,
  resetAppState,
  getClipboardText,
};
