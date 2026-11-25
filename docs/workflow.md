# Archicad file-exchange workflow

## Prepare a real model

1. Create an Interactive Element Schedule containing doors and windows. Filter to the intended elements and avoid grouping identical elements.
2. Include element ID, unique GUID if available, opening type, width, height, quantity, storey and room. Include existing editable custom text properties for glazing layers, glazing colour, frame colour and notes if desired.
3. If you intend to return property information, export the property values from the schedule via Archicad's interoperability commands. Keep that exact original XLSX property file. See [Graphisoft's Archicad 29 property data exchange guide](https://help.graphisoft.com/AC/29/INT/_AC29_Help/120_Interoperability/120_Interoperability-15.htm) for the native export/import workflow.
4. Open this repository's `index.html` in a modern browser. Choose your file, worksheet, header and final data rows. Map columns and select actual units. Preview to check the openings. Download WinMatch project JSON.

## Review in WinMatch

Import the JSON in [WinMatch](https://winquotes.com.au/studio), back up your current project before restoring/importing, and review dimensions, dimension basis, configurations, handing and specification. Export normal project JSON. The exchange format is WinMatch v1, not IFC or 3D JSON.

## Return text properties

Load the reviewed project JSON in the standalone tool with the same original workbook and worksheet. Map reviewed fields to corresponding editable text columns only. Confirm the destinations and preview changes before downloading the new XLSX.

The source hash, worksheet and row identity are used to prevent accidentally writing into a different workbook. New rows with no original identity are reported and skipped; duplicate or grouped source entries are rejected. Identifiers, dimensions and source non-property columns are excluded from destination mappings. Blank and TBC reviewed values do not clear existing text.

In Archicad, use **Import Property Values into Elements**, inspect the preview, and apply only after checking the proposed properties on a copy of the model. Built-in sizes, library parameters, geometry, placement and classification are not modified by this tool.

## Supported fields

| Field | Import | Return |
| --- | --- | --- |
| Opening ID / source ID | Yes | No |
| Window / Door, size, quantity | Yes | No |
| Storey / room | Yes | No |
| Glazing layer specification | Yes | Existing editable text only |
| Glazing colour | Yes | Existing editable text only |
| Frame colour | Yes | Existing editable text only |
| Notes | Yes | Existing editable text only |

CSV/TSV create a WinMatch project but cannot produce a native return workbook. XLSX values and workbook metadata are retained where supported by ExcelJS. Workbooks with formulas in mapped cells, macros, signatures, and unsupported complex Excel features require special care. There is no native Archicad add-on, direct model connection, live sync, or guarantee of host compatibility; this beta has not been tested inside Archicad.

