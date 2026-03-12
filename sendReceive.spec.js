// tests/send-receive/sendReceive.spec.js
// ─────────────────────────────────────────────────────────────────
// TC-SR-01 → TC-SR-06  |  Send & Receive Flows
// NOTE: No real transactions are executed.  All send tests stop
//       before the final "Confirm" submission step.
// ─────────────────────────────────────────────────────────────────
const { expect }        = require('chai');
const { tapElement, waitForElement, typeIntoField, takeScreenshot, getClipboardText } = require('../../utils/helpers');
const SEL               = require('../../utils/selectors');
const DATA              = require('../../utils/testData');

describe('💸  Send & Receive', () => {

  // ── TC-SR-01 ─────────────────────────────────────────────────
  it('TC-SR-01 | Copy wallet address copies a valid Ethereum address', async () =>
    {
    await waitForElement(SEL.HOME.WALLET_ADDRESS_BTN);
    await tapElement(SEL.HOME.WALLET_ADDRESS_BTN);
    await tapElement(SEL.HOME.COPY_ADDRESS_BTN);

    const clipboard = await getClipboardText();
    expect(clipboard).to.match(
      /^0x[a-fA-F0-9]{40}$/,
      `Clipboard content "${clipboard}" is not a valid Ethereum address`
    );

    await takeScreenshot('TC-SR-01_address_copied');
  });

  // ── TC-SR-02 ─────────────────────────────────────────────────
  it('TC-SR-02 | Receive screen displays a QR code', async () => {
    await tapElement(SEL.HOME.RECEIVE_BTN);

    const qrCode = await waitForElement(SEL.RECEIVE.QR_CODE, 10000);
    expect(await qrCode.isDisplayed()).to.be.true;

    // Also verify the text address is visible below the QR
    const addrText = await waitForElement(SEL.RECEIVE.ADDRESS_TEXT);
    const addr = await addrText.getText();
    expect(addr).to.match(/^0x[a-fA-F0-9]{40}$/);

    await takeScreenshot('TC-SR-02_receive_QR');
    await driver.back();
  });

  // ── TC-SR-03 ─────────────────────────────────────────────────
  it('TC-SR-03 | Send form rejects an invalid wallet address', async () => {
    await tapElement(SEL.HOME.SEND_BTN);
    await waitForElement(SEL.SEND.ADDRESS_INPUT);

    for (const badAddr of DATA.INVALID_ADDRESSES) {
      await typeIntoField(SEL.SEND.ADDRESS_INPUT, badAddr);
      await tapElement(SEL.SEND.CONTINUE_BTN);

      // Must show an error, must NOT proceed to amount screen
      const errEl = await waitForElement(SEL.SEND.ADDRESS_ERROR, 5000);
      expect(await errEl.isDisplayed()).to.be.true;

      await takeScreenshot(`TC-SR-03_invalid_addr`);
    }
  });

  // ── TC-SR-04 ─────────────────────────────────────────────────
  it('TC-SR-04 | Send form rejects invalid amounts', async () => {
    // Navigate to amount step using a valid (but fake) address
    await tapElement(SEL.HOME.SEND_BTN);
    await typeIntoField(SEL.SEND.ADDRESS_INPUT, DATA.EXPECTED_ADDRESS);
    await tapElement(SEL.SEND.CONTINUE_BTN);

    await waitForElement(SEL.SEND.AMOUNT_INPUT);

    for (const badAmt of DATA.INVALID_AMOUNTS) {
      await typeIntoField(SEL.SEND.AMOUNT_INPUT, badAmt);
      await tapElement(SEL.SEND.CONTINUE_BTN);

      const errEl = await waitForElement(SEL.SEND.AMOUNT_ERROR, 5000);
      expect(await errEl.isDisplayed()).to.be.true;

      await takeScreenshot(`TC-SR-04_invalid_amount`);
    }

    await driver.back();
  });

  // ── TC-SR-05 ─────────────────────────────────────────────────
  it('TC-SR-05 | Network fee is displayed on the send confirmation screen', async () => {
    await tapElement(SEL.HOME.SEND_BTN);
    await typeIntoField(SEL.SEND.ADDRESS_INPUT, DATA.EXPECTED_ADDRESS);
    await tapElement(SEL.SEND.CONTINUE_BTN);

    // Enter a small valid amount
    await typeIntoField(SEL.SEND.AMOUNT_INPUT, '0.001');
    await tapElement(SEL.SEND.CONTINUE_BTN);

    // Confirmation screen should show the network fee
    const feeEl = await waitForElement(SEL.SEND.NETWORK_FEE_LABEL, 15000);
    const feeText = await feeEl.getText();

    // Fee should be a non-zero number (may show "< $0.01" on testnet)
    expect(feeText.trim()).to.not.equal('',  'Network fee should not be blank');
    expect(feeText).to.not.include('NaN',    'Network fee should not be NaN');

    await takeScreenshot('TC-SR-05_network_fee_shown');

    // ⚠️  STOP – do not tap the final Send/Confirm button
    await driver.back();
  });

  // ── TC-SR-06 ─────────────────────────────────────────────────
  it('TC-SR-06 | MAX button populates the maximum spendable amount', async () => {
    await tapElement(SEL.HOME.SEND_BTN);
    await typeIntoField(SEL.SEND.ADDRESS_INPUT, DATA.EXPECTED_ADDRESS);
    await tapElement(SEL.SEND.CONTINUE_BTN);

    await waitForElement(SEL.SEND.MAX_BTN);
    await tapElement(SEL.SEND.MAX_BTN);

    const amtEl = await $(SEL.SEND.AMOUNT_INPUT);
    const amount = await amtEl.getValue();

    // MAX should fill in a positive number
    expect(parseFloat(amount)).to.be.greaterThan(0, 'MAX should set a positive amount');

    await takeScreenshot('TC-SR-06_max_amount');
    await driver.back();
  });

});
