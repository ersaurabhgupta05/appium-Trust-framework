// utils/testData.js
// ─────────────────────────────────────────────────────────────────
// All test data in one place.  Sensitive data (real seed phrases)
// must come from environment variables, never hardcoded here.
// ─────────────────────────────────────────────────────────────────
require('dotenv').config({ path: './config/.env' });

module.exports = {

  // ── Valid Wallet ───────────────────────────────────────────────
  // Load from env so CI secrets are never committed to git
  VALID_SEED_PHRASE: process.env.VALID_SEED_PHRASE ||
    'test test test test test test test test test test test junk', // BIP-39 test vector

  EXPECTED_ADDRESS: process.env.EXPECTED_WALLET_ADDRESS ||
    '0x0000000000000000000000000000000000000000',

  // ── Invalid Inputs ─────────────────────────────────────────────
  INVALID_SEED_PHRASES: [
    'word1 word2 word3',                                         // too short
    'aaaaa bbbbb ccccc ddddd eeeee fffff ggggg hhhhh iiiii jjjjj kkkkk lllll', // not BIP-39
    '     ',                                                     // blank
    '12345 67890 abcde fghij klmno pqrst uvwxy z1234 56789 0abcd efghi jklmn', // numeric
  ],

  INVALID_ADDRESSES: [
    'not-an-address',
    '0x123',                  // too short
    'bc1qar0srrr7xfkvy5l643l',// Bitcoin address in Ethereum send field
    '',                       // empty
    'SELECT * FROM wallets;', // SQL injection attempt
    '<script>alert(1)</script>', // XSS attempt
  ],

  INVALID_AMOUNTS: [
    '-1',
    '0',
    'abc',
    '999999999999999999',  // exceeds balance
    '0.000000000000000001', // below dust limit
    '',
  ],

  // ── Tokens ─────────────────────────────────────────────────────
  KNOWN_TOKEN: 'ETH',
  TOKEN_TO_ADD: 'USDC',
};
