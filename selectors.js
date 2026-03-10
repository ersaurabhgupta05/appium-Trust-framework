// utils/selectors.js
// ─────────────────────────────────────────────────────────────────
// Central registry of all UI selectors.
//
// WHY a selectors file?
//   When the app updates (common in crypto wallets), you update ONE
//   file rather than hunting through every spec.  Each key is the
//   Appium accessibility ID (content-desc on Android, accessibilityLabel
//   on iOS).  Use Appium Inspector to confirm values on your build.
// ─────────────────────────────────────────────────────────────────

module.exports = {

  // ── Onboarding ─────────────────────────────────────────────────
  ONBOARDING: {
    CREATE_WALLET_BTN:    'Create a new wallet',
    IMPORT_WALLET_BTN:    'I already have a wallet',
    GET_STARTED_BTN:      'Get Started',
    TERMS_ACCEPT_BTN:     'Accept',
    SKIP_BTN:             'Skip',
  },

  // ── Wallet Creation ────────────────────────────────────────────
  WALLET_CREATION: {
    BACKUP_NOW_BTN:       'Back Up Now',
    BACKUP_LATER_BTN:     'Do it later',
    RECOVERY_PHRASE_VIEW: 'Secret Recovery Phrase',
    CONTINUE_BTN:         'Continue',
    DONE_BTN:             'Done',
    // Word verification step – numbered buttons 1-12
    WORD_INPUT_PREFIX:    'word_input_',
  },

  // ── Wallet Import ──────────────────────────────────────────────
  WALLET_IMPORT: {
    PHRASE_INPUT:         'Recovery Phrase Input',
    IMPORT_BTN:           'Import',
    ERROR_MSG:            'Invalid recovery phrase',
    SUCCESS_INDICATOR:    'Wallet imported',
  },

  // ── Home / Dashboard ───────────────────────────────────────────
  HOME: {
    WALLET_ADDRESS_BTN:   'Wallet Address',
    COPY_ADDRESS_BTN:     'Copy',
    RECEIVE_BTN:          'Receive',
    SEND_BTN:             'Send',
    TOTAL_BALANCE_LABEL:  'Total Balance',
    TOKEN_LIST:           'Token List',
    MANAGE_TOKENS_BTN:    'Manage Tokens',
  },

  // ── Token Management ───────────────────────────────────────────
  TOKENS: {
    SEARCH_INPUT:         'Search Tokens',
    ADD_TOKEN_TOGGLE:     'Add Token Toggle',
    TOKEN_ROW_PREFIX:     'token_row_',
    BALANCE_PREFIX:       'balance_',
  },

  // ── Send Flow ──────────────────────────────────────────────────
  SEND: {
    ADDRESS_INPUT:        'Recipient Address',
    AMOUNT_INPUT:         'Amount',
    SEND_BTN:             'Send Button',
    CONTINUE_BTN:         'Continue',
    ADDRESS_ERROR:        'Invalid address',
    AMOUNT_ERROR:         'Invalid amount',
    NETWORK_FEE_LABEL:    'Network Fee',
    MAX_BTN:              'Max',
    QR_SCAN_BTN:          'Scan QR',
  },

  // ── Receive Flow ───────────────────────────────────────────────
  RECEIVE: {
    QR_CODE:              'QR Code',
    ADDRESS_TEXT:         'Receive Address Text',
    COPY_BTN:             'Copy Address',
    SHARE_BTN:            'Share',
  },

  // ── Settings / Security ────────────────────────────────────────
  SETTINGS: {
    TAB:                  'Settings Tab',
    PASSCODE_BTN:         'Passcode & Touch ID',
    BIOMETRIC_TOGGLE:     'Biometric Toggle',
    AUTO_LOCK_BTN:        'Auto-Lock',
    BACKUP_BTN:           'Backup',
  },
};
