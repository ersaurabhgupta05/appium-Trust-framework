// tests/wallet-import/walletImport.spec.js
// ─────────────────────────────────────────────────────────────────
// TC-WI-01 → TC-WI-03  |  Wallet Import Flow
// ─────────────────────────────────────────────────────────────────
const { expect }        = require('chai');
const { tapElement, waitForElement, waitForText, typeIntoField, takeScreenshot, resetAppState } = require('../../utils/helpers');
const SEL               = require('../../utils/selectors');
const DATA              = require('../../utils/testData');

describe('📥  Wallet Import', () => {

  beforeEach(async () => {
    // Reset to a clean onboarding state before each import test
    await resetAppState();
    await waitForElement(SEL.ONBOARDING.IMPORT_WALLET_BTN);
    await tapElement(SEL.ONBOARDING.IMPORT_WALLET_BTN);
  });

  // ── TC-WI-01 ─────────────────────────────────────────────────
  it('TC-WI-01 | Import wallet using a valid recovery phrase', async () => {
    await waitForElement(SEL.WALLET_IMPORT.PHRASE_INPUT);
    await typeIntoField(SEL.WALLET_IMPORT.PHRASE_INPUT, DATA.VALID_SEED_PHRASE);
    await takeScreenshot('TC-WI-01_phrase_entered');

    await tapElement(SEL.WALLET_IMPORT.IMPORT_BTN);

    // Wallet should load – allow extra time for key derivation
    const balance = await waitForElement(SEL.HOME.TOTAL_BALANCE_LABEL, 30000);
    expect(await balance.isDisplayed()).to.be.true;

    await takeScreenshot('TC-WI-01_import_success');
  });

  // ── TC-WI-02 ─────────────────────────────────────────────────
  it('TC-WI-02 | Invalid recovery phrases are rejected with an error message', async () => {
    await waitForElement(SEL.WALLET_IMPORT.PHRASE_INPUT);

    for (const badPhrase of DATA.INVALID_SEED_PHRASES) {
      await typeIntoField(SEL.WALLET_IMPORT.PHRASE_INPUT, badPhrase);
      await tapElement(SEL.WALLET_IMPORT.IMPORT_BTN);

      // Expect an inline error – not navigation to the home screen
      const errorEl = await waitForElement(SEL.WALLET_IMPORT.ERROR_MSG, 5000);
      expect(await errorEl.isDisplayed()).to.be.true;

      // ⚠️  BUG CANDIDATE: verify the app does NOT navigate away on error
      const isOnImportScreen = await $(SEL.WALLET_IMPORT.PHRASE_INPUT).isDisplayed();
      expect(isOnImportScreen).to.be.true;

      await takeScreenshot(`TC-WI-02_invalid_phrase_rejected`);
    }
  });

  // ── TC-WI-03 ─────────────────────────────────────────────────
  it('TC-WI-03 | Wallet loads correctly with expected address after import', async () => {
    await typeIntoField(SEL.WALLET_IMPORT.PHRASE_INPUT, DATA.VALID_SEED_PHRASE);
    await tapElement(SEL.WALLET_IMPORT.IMPORT_BTN);
    await waitForElement(SEL.HOME.TOTAL_BALANCE_LABEL, 30000);

    // Check the derived address matches what we expect for this seed
    await tapElement(SEL.HOME.RECEIVE_BTN);
    const addrEl = await waitForElement(SEL.RECEIVE.ADDRESS_TEXT);
    const displayedAddress = await addrEl.getText();

    expect(displayedAddress.toLowerCase()).to.equal(
      DATA.EXPECTED_ADDRESS.toLowerCase(),
      `Derived address ${displayedAddress} doesn't match expected ${DATA.EXPECTED_ADDRESS}`
    );

    await takeScreenshot('TC-WI-03_address_verified');
  });

});
