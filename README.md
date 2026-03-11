#  Trust Wallet – Automation Test Suite

> **Framework:** WebdriverIO  + Appium  + UiAutomator  
> **Language:** JavaScript (Node.js)  
> **Platform:** Android 

---

## Architecture Overview

```
trust-wallet-automation/
├── config/
│   ├── wdio.conf.js        # WebdriverIO + Appium configuration
│   └── .env.example        # Environment variable template
├── tests/
│   ├── wallet-creation/    # TC-WC-01 → TC-WC-04
│   ├── wallet-import/      # TC-WI-01 → TC-WI-03
│   ├── token-management/   # TC-TM-01 → TC-TM-03
│   ├── send-receive/       # TC-SR-01 → TC-SR-06
│   
├── utils/
│   ├── helpers.js          # Reusable wait/tap/screenshot utilities
│   ├── selectors.js        # Central selector registry (all accessibility IDs)
│   └── testData.js         # Test vectors and invalid input datasets
├── reports/
│   ├── test-report.html    # Human-readable HTML report
│   └── allure-results/     # Raw Allure data (auto-generated)
├── screenshots/            # Failure + checkpoint screenshots (auto-generated)
├── app/
│   └── trust-wallet.apk    # Place your APK here (not committed to git)
└── README.md
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18.x | https://nodejs.org |
| Java (JDK) | ≥ 11 | `brew install openjdk` / apt |
| Android SDK | ≥ API 31 | Android Studio → SDK Manager |
| Appium | 2.x | `npm install -g appium` |
| UiAutomator2 driver | latest | `appium driver install uiautomator2` |
| Allure CLI (optional) | 2.x | `npm install -g allure-commandline` |

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-org/trust-wallet-automation.git
cd trust-wallet-automation

# 2. Install Node dependencies
npm install

# 3. Set up environment variables
cp config/.env.example config/.env
# Edit config/.env with your device name, platform version,
# APK path, and test seed phrase

# 4. Start an Android emulator (or connect a real device via USB)
emulator -avd Pixel_7_API_33 &     # or use AVD Manager in Android Studio

# 5. Verify ADB sees the device
adb devices
# Should show:  emulator-5554   device

# 6. Start the Appium server (in a separate terminal)
appium --port 4723
```

---

##  Running Tests

```bash
# Run the full suite
npm test

# Run a specific suite
npm run test:wallet-creation
npm run test:wallet-import
npm run test:token-management
npm run test:send-receive


# Open the Allure report (after a run)
npm run report
```

---

## HTML Report

Open `reports/test-report.html` in any browser — no server required.

For the interactive Allure report (with step-level screenshots and timeline):
```bash
npm run report
# Allure will auto-open in your default browser
```

---

## Approach & Assumptions

### Why WebdriverIO + Appium (and not Detox / Espresso)?

| Criterion | Appium | Detox |
|-----------|--------|-------|
| Works on release APK | ✅ Yes | ❌ Needs instrumented build |
| Cross-platform (Android + iOS) | ✅ Yes | Partial |
| Supports real devices | ✅ Yes | ✅ Yes |
| Test speed | Moderate | Fast |
| Setup complexity | Medium | High |

**Decision:** Appium was chosen because it works on any APK binary, which mirrors real-world QA conditions. Detox would be faster on a grey-box build but is not viable without access to the app source.

### Why JavaScript / Node.js?

- WebdriverIO is primarily a JavaScript-first framework
- `async/await` syntax maps naturally to mobile UI wait patterns
- Lower barrier for teammates from web QA backgrounds
- TypeScript can be added with zero framework changes if needed

### Selector Strategy

All selectors use **Accessibility IDs** (`~myAccessibilityLabel`). These are:
- Cross-platform (Android `content-desc` = iOS `accessibilityLabel`)
- Resistant to UI restyling and translation changes
- Required for screen reader compliance (WCAG)

XPath is used only as a fallback when accessibility IDs are missing (see BUG-01, BUG-02).

### Test Data

- **Seed phrases** come from environment variables — never hardcoded
- The default test vector uses the publicly-known BIP-39 `test test test...junk` mnemonic which generates a deterministic address that holds no real funds
- Invalid input datasets (addresses, amounts, phrases) include security-oriented inputs (XSS, SQL injection, buffer overflow strings)

### What is NOT tested (and why)

| Out of scope | Reason |
|-------------|--------|
| Real ETH / BNB transactions | Irreversible mainnet fund movement |
| Push notification delivery | Requires a real notification server + device token |
| Price feed accuracy | Third-party data source, not app logic |
| Deep-link handling | Requires additional device ADB setup |

---

## Known Issues

See `reports/test-report.html` → Bug Report section for full details on:

- **BUG-01** (MEDIUM) – Word-chip elements missing accessibility IDs
- **BUG-02** (MEDIUM) – Token toggles missing accessibility labels  
- **BUG-03** (HIGH)   – Send form accepts `0` as a valid amount

---

## 🔒 Security Notes

- Never commit `config/.env` — it is in `.gitignore`
- Screenshots captured during the recovery phrase display step (`TC-WC-02`) are marked `_REDACTED` and should be excluded from CI artefact uploads
- Use ephemeral testnet wallets for CI runs; rotate seed phrases regularly
