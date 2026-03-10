// tests/token-management/tokenManagement.spec.js
// ─────────────────────────────────────────────────────────────────
// TC-TM-01 → TC-TM-03  |  Token Management
// ─────────────────────────────────────────────────────────────────
const { expect }        = require('chai');
const { tapElement, waitForElement, typeIntoField, scrollToElement, takeScreenshot } = require('../../utils/helpers');
const SEL               = require('../../utils/selectors');
const DATA              = require('../../utils/testData');

describe('🪙  Token Management', () => {

  before(async () => {
    // Assumes wallet already created/imported (run after walletCreation suite)
    await waitForElement(SEL.HOME.MANAGE_TOKENS_BTN);
  });

  // ── TC-TM-01 ─────────────────────────────────────────────────
  it('TC-TM-01 | Add a new token (USDC)', async () => {
    await tapElement(SEL.HOME.MANAGE_TOKENS_BTN);
    await waitForElement(SEL.TOKENS.SEARCH_INPUT);

    await typeIntoField(SEL.TOKENS.SEARCH_INPUT, DATA.TOKEN_TO_ADD);
    await takeScreenshot('TC-TM-01_search_USDC');

    // Tap the first result's toggle
    const toggle = await waitForElement(`${SEL.TOKENS.ADD_TOKEN_TOGGLE}_${DATA.TOKEN_TO_ADD}`, 8000);
    await toggle.click();

    // Toast or confirmation
    await takeScreenshot('TC-TM-01_USDC_added');

    // Navigate back and verify USDC appears in the list
    await driver.back();
    await scrollToElement(`${SEL.TOKENS.TOKEN_ROW_PREFIX}${DATA.TOKEN_TO_ADD}`);
    const tokenRow = await $(`~${SEL.TOKENS.TOKEN_ROW_PREFIX}${DATA.TOKEN_TO_ADD}`);
    expect(await tokenRow.isDisplayed()).to.be.true;
  });

  // ── TC-TM-02 ─────────────────────────────────────────────────
  it('TC-TM-02 | Enable and disable a token toggles its visibility', async () => {
    await tapElement(SEL.HOME.MANAGE_TOKENS_BTN);
    await typeIntoField(SEL.TOKENS.SEARCH_INPUT, DATA.KNOWN_TOKEN);

    const toggle = await waitForElement(`${SEL.TOKENS.ADD_TOKEN_TOGGLE}_${DATA.KNOWN_TOKEN}`);
    const stateBefore = await toggle.getAttribute('checked');

    // Toggle off
    await toggle.click();
    await browser.pause(500);
    const stateAfter = await toggle.getAttribute('checked');

    expect(stateAfter).to.not.equal(stateBefore, 'Toggle state should change after tap');

    // Toggle back on so subsequent tests are not affected
    await toggle.click();

    await takeScreenshot('TC-TM-02_toggle_verified');
  });

  // ── TC-TM-03 ─────────────────────────────────────────────────
  it('TC-TM-03 | Token balances appear correctly (format validation)', async () => {
    await driver.back(); // back to home
    await waitForElement(SEL.HOME.TOKEN_LIST);

    const balanceEls = await $$(`[content-desc*="balance_"]`);
    expect(balanceEls.length).to.be.greaterThan(0, 'At least one balance should be shown');

    for (const el of balanceEls) {
      const text = await el.getText();
      // Balance should be a number or "$0.00" format – never empty or "NaN"
      expect(text).to.not.include('NaN', `Balance shows "NaN": ${text}`);
      expect(text.trim()).to.not.equal('',   `Balance is empty for element`);
    }

    await takeScreenshot('TC-TM-03_balances_verified');
  });

});
