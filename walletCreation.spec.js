// tests/wallet-creation/walletCreation.spec.js
// ─────────────────────────────────────────────────────────────────
// TC-WC-01 → TC-WC-04 |  Wallet Creation Flow
// ─────────────────────────────────────────────────────────────────
const { expect }        = require('chai');
const { tapElement, waitForElement, waitForText, takeScreenshot } = require('../../utils/helpers');
const SEL               = require('../../utils/selectors');

describe('🏦  Wallet Creation', () => {

  // ── TC-WC-01 ─────────────────────────────────────────────────
  it('TC-WC-01 | A new wallet can be successfully created', async () => {
    // Step 1 – land on onboarding
    await waitForElement(SEL.ONBOARDING.CREATE_WALLET_BTN);
    await takeScreenshot('TC-WC-01_onboarding');

    // Step 2 – tap Create
    await tapElement(SEL.ONBOARDING.CREATE_WALLET_BTN);

    // Step 3 – accept terms if shown
    try {
      await tapElement(SEL.ONBOARDING.TERMS_ACCEPT_BTN);
    } catch (_) { /* terms screen may not appear on every build */ }

    // Step 4 – skip biometric / passcode setup for test purposes
    try {
      await tapElement(SEL.ONBOARDING.SKIP_BTN);
    } catch (_) {}

    // Step 5 – verify home screen loads
    const homeBalance = await waitForElement(SEL.HOME.TOTAL_BALANCE_LABEL, 20000);
    expect(await homeBalance.isDisplayed()).to.be.true;

    await takeScreenshot('TC-WC-01_home_after_creation');
  });

  // ── TC-WC-02 ─────────────────────────────────────────────────
  it('TC-WC-02 | Recovery phrase is displayed during backup flow', async () => {
    // Assumes we are on the home screen after TC-WC-01
    // In practice each test can also deep-link / reset state
    await tapElement(SEL.WALLET_CREATION.BACKUP_NOW_BTN);

    const phraseView = await waitForElement(SEL.WALLET_CREATION.RECOVERY_PHRASE_VIEW, 15000);
    expect(await phraseView.isDisplayed()).to.be.true;

    // Capture – but note: in a REAL CI run you'd want to REDACT this
    // screenshot or skip it entirely for security
    await takeScreenshot('TC-WC-02_recovery_phrase_REDACTED');

    // Verify 12 word-chip elements are shown (Trust Wallet shows chips)
    const chips = await $$('[class*="WordChip"]');   // fallback xpath
    expect(chips.length).to.be.at.least(12, 'Should display at least 12 recovery words');
  });

  // ── TC-WC-03 ─────────────────────────────────────────────────
  it('TC-WC-03 | Backup confirmation flow completes successfully', async () => {
    // Continue past phrase display
    await tapElement(SEL.WALLET_CREATION.CONTINUE_BTN);

    // Trust Wallet asks user to re-enter selected words in order
    // We read the displayed phrase in TC-WC-02 and supply them here
    // For automation we use the "test" BIP-39 vector which gives predictable words
    // In a full implementation you'd parse the chip text in TC-WC-02 and pass it here

    // Simulate word confirmation – tap word chips in correct order
    // (Word order depends on what the app picks randomly, so we handle
    //  this by reading the prompt labels and mapping back)
    const wordPrompts = await $$('[content-desc*="word_prompt"]');
    for (const prompt of wordPrompts) {
      const wordText = await prompt.getText();
      const matchChip = await $(`~chip_${wordText}`);
      await matchChip.click();
    }

    await tapElement(SEL.WALLET_CREATION.DONE_BTN);

    // Verify back on home
    const balance = await waitForElement(SEL.HOME.TOTAL_BALANCE_LABEL, 10000);
    expect(await balance.isDisplayed()).to.be.true;

    await takeScreenshot('TC-WC-03_backup_confirmed');
  });

  // ── TC-WC-04 ─────────────────────────────────────────────────
  it('TC-WC-04 | A wallet address is generated after setup', async () => {
    await tapElement(SEL.HOME.WALLET_ADDRESS_BTN);

    const addrEl = await waitForElement(SEL.RECEIVE.ADDRESS_TEXT, 10000);
    const address = await addrEl.getText();

    // Ethereum address: starts with 0x, 42 chars total
    expect(address).to.match(/^0x[a-fA-F0-9]{40}$/, `Address "${address}" is not a valid Ethereum address`);

    await takeScreenshot('TC-WC-04_wallet_address');
  });

});
