# Verification status — 26 November 2026

- **Passed:** eight Node.js engine/workbook checks: delimited input, schema, explicit unit conversion, duplicate/invalid input rejection, scoped return, grouped/duplicate return rejection, source identity, and real XLSX save/reload preserving original dimensions, style, hidden column and other sheet.
- **Passed:** JavaScript syntax checks.
- **Verified dependency:** exact browser bundle from the official ExcelJS 4.4.0 package; matches the previously hosted WinMatch dependency byte for byte.
- **Pending:** browser UI smoke test. The test is supplied in `tests/browser-smoke.cjs` and in GitHub Actions; local Chromium start was blocked by this execution environment. No responsive or in-browser compatibility guarantee is claimed.
- **Pending:** actual Archicad export/import on Windows with a model-generated property workbook.

To run the optional browser test locally on a system with Node.js and Chromium support:

```sh
npm install --no-save --no-package-lock playwright@1.62.1
npx playwright install chromium
node tests/browser-smoke.cjs
```

The browser smoke checks local file operation, CSV → JSON, XLSX → JSON → reviewed XLSX, no network requests and several viewport widths. Test fixtures are synthetic, not native property workbook exports.
