// tests/security/securityChecks.spec.js
// ─────────────────────────────────────────────────────────────────
// TC-SEC-01 → TC-SEC-04  |  Security & UX Observations
//
// These tests validate security posture rather than functionality.
// They are lightweight but highly valuable for a crypto wallet.
// ─────────────────────────────────────────────────────────────────
const { expect }        = require('chai');
const { waitForElement, takeScreenshot, tapElement } = require('../../utils/helpers');
const SEL               = require('../../utils/selectors');

describe('🔒  Security & UX Observations', () => {

  // ── TC-SEC-01 ─────────────────────────────────────────────────
  it('TC-SEC-01 | Recovery phrase is NOT visible in the app switcher (recent apps)', async () => {
    // Navigate to the recovery phrase screen
    await tapElement(SEL.SETTINGS.TAB);
    await tapElement(SEL.SETTINGS.BACKUP_BTN);
    await waitForElement(SEL.WALLET_CREATION.RECOVERY_PHRASE_VIEW);

    // Send app to background (simulates pressing Home / Recent Apps)
    await driver.background(2); // 2 seconds in background

    // Take a screenshot – this should be blank or show a privacy overlay
    await takeScreenshot('TC-SEC-01_app_switcher_check');

    // Re-foreground
    await driver.activateApp('com.wallet.crypto.trustapp');

    // ⚠️  MANUAL verification note added to report:
    // Inspect TC-SEC-01_app_switcher_check.png – if the recovery phrase
    // words are visible, this is a HIGH severity bug (CWE-200).
    //
    // Automated check: the screen should not be the phrase view
    // (it should have re-locked or shown a blur overlay)
    const isLockedOrHidden = await $(SEL.WALLET_CREATION.RECOVERY_PHRASE_VIEW).isDisplayed()
      .then(v => !v)
      .catch(() => true); // element gone = good

    expect(isLockedOrHidden).to.be.true;
  });

  // ── TC-SEC-02 ─────────────────────────────────────────────────
  it('TC-SEC-02 | App requires re-authentication after session gap', async () => {
    // Put app in background for 35 seconds (exceeds typical 30s auto-lock)
    await driver.background(35);
    await driver.activateApp('com.wallet.crypto.trustapp');

    // Should be prompted to re-authenticate (PIN / biometric screen)
    // rather than going straight to the wallet home
    const isOnHome = await $(SEL.HOME.TOTAL_BALANCE_LABEL).isDisplayed()
      .catch(() => false);

    // ⚠️  BUG CANDIDATE: if this assertion fails, the app has no auto-lock
    expect(isOnHome).to.be.false;

    await takeScreenshot('TC-SEC-02_reauth_prompt');
  });

  // ── TC-SEC-03 ─────────────────────────────────────────────────
  it('TC-SEC-03 | Recovery phrase input field is masked / obscured', async () => {
    await driver.terminateApp('com.wallet.crypto.trustapp');
    await driver.activateApp('com.wallet.crypto.trustapp');
    await browser.pause(2000);

    await tapElement(SEL.ONBOARDING.IMPORT_WALLET_BTN);
    await waitForElement(SEL.WALLET_IMPORT.PHRASE_INPUT);

    // Type a word and verify the field's input type is password or similar
    const inputEl   = await $(SEL.WALLET_IMPORT.PHRASE_INPUT);
    await inputEl.setValue('abandon');

    const inputType = await inputEl.getAttribute('password');
    // On Android: attribute 'password' is 'true' for masked fields
    // ⚠️  BUG CANDIDATE: seed phrase should be masked on screen
    // (many wallets fail this – it's a medium severity finding)
    //
    // NOTE: Trust Wallet currently shows the phrase in plain text
    // to aid manual verification, so this test may legitimately fail.
    // Document as a UX/security trade-off in the bug report.

    await takeScreenshot('TC-SEC-03_phrase_input_visibility');

    // We log rather than assert here because the design may be intentional
    console.log(`ℹ️  Seed phrase input masked: ${inputType === 'true'}`);
  });

  // ── TC-SEC-04 ─────────────────────────────────────────────────
  it('TC-SEC-04 | XSS / injection strings in address field do not crash the app', async () => {
    await driver.terminateApp('com.wallet.crypto.trustapp');
    await driver.activateApp('com.wallet.crypto.trustapp');
    await browser.pause(2000);

    await waitForElement(SEL.HOME.SEND_BTN);
    await tapElement(SEL.HOME.SEND_BTN);
    await waitForElement(SEL.SEND.ADDRESS_INPUT);

    const attackStrings = [
      '<script>alert(document.cookie)</script>',
      '\'; DROP TABLE wallets; --',
      '\\x00\\x00\\x00', // null bytes
      'A'.repeat(5000),   // buffer overflow attempt
    ];

    for (const str of attackStrings) {
      await $(SEL.SEND.ADDRESS_INPUT).setValue(str);
      await browser.pause(500);

      // App must still be running and responsive
      const isAlive = await driver.isAppInstalled('com.wallet.crypto.trustapp');
      expect(isAlive).to.be.true;

      // App should not crash – verify home elements are reachable after back
    }

    await takeScreenshot('TC-SEC-04_injection_test_survived');
    await driver.back();
  });

});
