// config/wdio.conf.js
// ─────────────────────────────────────────────────────────────────
// WHY WebdriverIO + Appium?
//   • WebdriverIO provides a rich test-runner (Mocha) and CLI out of the box
//   • Appium is the industry standard for native/hybrid mobile automation
//   • Together they give you real device + emulator support, element
//     inspection via Appium Inspector, and parallel execution for free
// ─────────────────────────────────────────────────────────────────
require('dotenv').config();

exports.config = {
  runner: 'local',

  // ── Appium server ────────────────────────────────────────────────
  port: 4723,
  path: '/',

  // ── Target specs ────────────────────────────────────────────────
  specs: ['./tests/**/*.spec.js'],
  exclude: [],

  // ── Parallelism ──────────────────────────────────────────────────
  // Keep at 1 for a single real device; increase for emulator farms
  maxInstances: 1,

  // ── Capabilities (Android + Trust Wallet APK) ────────────────────
  // TRADE-OFF: We test the Android build because:
  //   • Android emulators are freely available (AVD Manager / CI)
  //   • iOS requires a paid Apple Developer account + macOS runner
  //   • Selector strategy (accessibility IDs) is kept cross-platform
  //     so switching to XCUITest is a one-line change
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': process.env.DEVICE_NAME || 'emulator-5554',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '13.0',
    'appium:automationName': 'UiAutomator2',

    // Option A – install APK before each session (CI-friendly)
    'appium:app': process.env.APP_PATH || './app/trust-wallet.apk',

    // Option B – target already-installed package (faster local dev)
    // 'appium:appPackage': 'com.wallet.crypto.trustapp',
    // 'appium:appActivity': 'com.wallet.crypto.trustapp.MainActivity',

    'appium:noReset': false,      // fresh state every run
    'appium:fullReset': false,    // don't wipe device data between specs
    'appium:newCommandTimeout': 60,
    'appium:autoGrantPermissions': true,
  }],

  // ── Framework ────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,   // 2 min per test – mobile is slower than web
    retries: 1,        // one automatic retry on flaky network/animation
  },

  // ── Reporters ────────────────────────────────────────────────────
  reporters: [
    'spec',            // real-time terminal output
    ['allure', {
      outputDir: 'reports/allure-results',
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
    }],
  ],

  // ── Hooks ────────────────────────────────────────────────────────
  beforeSession(_config, _capabilities, _specs) {
    // Nothing needed – dotenv already loaded above
  },

  afterTest(test, _context, { error, passed }) {
    if (!passed) {
      // Capture screenshot on every failure automatically
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename  = `./screenshots/FAIL_${test.title.replace(/\s+/g, '_')}_${timestamp}.png`;
      browser.saveScreenshot(filename);
      console.error(`\n📸  Screenshot saved: ${filename}`);
    }
  },
};
