# WinMatch for Archicad — File Exchange

**Open-source window and door schedule exchange for Archicad and WinMatch.**

[WinMatch by Glazentri](https://winquotes.com.au) · Original exchange developed in November 2026 · Standalone release v0.1.1 beta · MIT

Import Australian or international window and door schedules from Archicad into WinMatch, review dimensions and glazing selections, then prepare a property workbook for return. Everything is handled in your browser. No native Archicad plug-in installation, cloud API, account token or hosted service is needed for the local file conversion.

> **Beta:** This is the original browser-based Archicad **file exchange tool**, not a compiled Graphisoft add-on. Local exchange and workbook tests passed; browser smoke and in-host Archicad verification are pending.

## Quick start (Windows)

1. Download the release ZIP or clone the repository.
2. Extract **all** files into a folder and double-click `Start_WinMatch_Archicad.cmd` (Windows) or open `index.html` in a current Edge, Chrome or Firefox browser. Keep the adjacent scripts and `vendor` folder.
3. Use `examples/schedule.csv` to try the workflow without Archicad. Select millimetres; preview, then download project JSON.
4. To use a real Archicad project, follow the [full workflow](docs/workflow.md).
5. Open the project JSON in [WinMatch](https://winquotes.com.au/studio); keep a backup of your existing project. For the return journey, load the reviewed project JSON alongside the original Archicad-generated XLSX property workbook.

If your browser restricts local file access, launch a static local web server from the repository folder:

```powershell
py -3 -m http.server 8765 --bind 127.0.0.1
```

Then browse to http://localhost:8765/. Close the terminal to stop it. The website can also be hosted unchanged as a GitHub Pages site (root folder).

## What it does

- Reads XLSX, CSV and TSV schedules and lets you map input columns.
- Normalises millimetres, centimetres, metres and inches to millimetres.
- Preview window and door rows before producing WinMatch v1 project JSON.
- Preserves source worksheet, source identity and original file fingerprint.
- Previews proposed changes to selected existing custom text properties.
- Creates a new reviewed XLSX workbook, retaining the original file and other workbook content where supported.
- Checks for grouped or duplicated elements, missing data, invalid dimensions, mismatched files, and attempts to overwrite identifier or size columns.

No window or door geometry is edited. No automatic panel configuration, handing, actual fabrication size, sill or subsill inference. Use WinMatch to review those attributes. Source numbers default to a nominal “Internal window size” basis requiring confirmation.

## File limits

20 MB input file, 40 XLSX sheets, 10,000 rows and 250 columns per worksheet, and at most 3,000 opening records. CSV/TSV export to project JSON only. Return requires quantity one for each matched row, your original XLSX and existing compatible text properties. Verify special workbook features and all return changes in a model copy.

## Repository

| File | Purpose |
| --- | --- |
| `index.html` | Standalone browser interface |
| `archicad-exchange-engine.js` | Original calculation, validation and return-plan engine |
| `archicad-exchange.js` | File handling, UI and XLSX round trip |
| `vendor/exceljs.min.js` | Bundled ExcelJS 4.4.0; upstream licence included |
| `examples/` | Fictional schedules |
| `docs/workflow.md` | Archicad setup, import/export and limitations |
| `tests/exchange.test.cjs` | Exchange tests |

Run the engine and workbook checks with Node.js 20+:

```sh
node --test tests/exchange.test.cjs
```

No npm install is required for the engine/workbook tests. An optional Chromium UI smoke test is included and configured in GitHub Actions; this workspace could not launch Chromium, so that test is not claimed as passed here. See [verification](docs/verification.md). The browser edition requires native Web Crypto (local file or localhost/HTTPS). Opening the WinMatch website or Graphisoft guide is optional and is the only intentional navigation to those services.

## Contributing and licence

See [CONTRIBUTING.md](CONTRIBUTING.md). Original WinMatch code is under the [MIT licence](LICENSE); the included ExcelJS browser library is separately licensed as described in [vendor/README.md](vendor/README.md). Archicad is a Graphisoft product. This independent project is not sponsored or endorsed by Graphisoft.

Originally published at [winquotes.com.au/archicad-exchange](https://winquotes.com.au/archicad-exchange). The standalone release replaces site-relative assets and hosted-workspace controls with local or explicitly linked equivalents.
