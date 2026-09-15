import ExcelJS from "exceljs";
import { Readable } from "stream";

// Server-only — parsing/generating both happen here, never in the browser
// bundle. exceljs was chosen over the `xlsx` npm package specifically
// because the latter has unpatched prototype-pollution/ReDoS advisories
// with no fix available; exceljs has no equivalent open issue.

export const SAMPLE_COLUMNS = [
  { header: "Customer Name", key: "customerName", width: 22 },
  { header: "Customer Phone", key: "customerPhone", width: 16 },
  { header: "Customer Email", key: "customerEmail", width: 26 },
  { header: "Address", key: "address", width: 30 },
  { header: "City", key: "city", width: 16 },
  { header: "State", key: "state", width: 16 },
  { header: "Pincode", key: "pincode", width: 10 },
  { header: "Package Name", key: "packageName", width: 28 },
  { header: "Quantity", key: "quantity", width: 10 },
  { header: "Scheduled For (YYYY-MM-DD HH:mm, blank = instant)", key: "scheduledFor", width: 34 },
  { header: "Assign To Vendor Email (blank = broadcast to all matching vendors)", key: "vendorEmail", width: 38 },
] as const;

export async function buildSampleWorkbook(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Orders");
  sheet.columns = SAMPLE_COLUMNS as unknown as ExcelJS.Column[];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({
    customerName: "Ramesh Kumar",
    customerPhone: "9876543210",
    customerEmail: "ramesh@example.com",
    address: "12 MG Road, Sector 4",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    packageName: "Split AC Deep Foam Clean",
    quantity: 1,
    scheduledFor: "",
    vendorEmail: "",
  });

  const notes = workbook.addWorksheet("Instructions");
  notes.columns = [{ width: 90 }];
  [
    "One row = one order.",
    "Customer Name / Phone / Email / Address / City / State / Pincode / Package Name are required.",
    "Package Name must match an existing package's name exactly (not case-sensitive).",
    "Quantity defaults to 1 if left blank.",
    "Scheduled For: leave blank for an instant order, or use YYYY-MM-DD HH:mm.",
    "Assign To Vendor Email: leave blank to broadcast the order for any matching vendor to buy. Fill in a vendor's registered email to assign it directly to that vendor at no cost to them.",
    "If a phone number isn't already registered, a new customer account is created automatically for that order.",
  ].forEach((line) => notes.addRow([line]));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export interface ParsedRow {
  rowNumber: number;
  /** Keyed by the internal field name (customerName, pincode, ...) — see
   *  HEADER_TEXT_TO_KEY — never by the raw header cell text, so a caller
   *  reading v.pincode always gets the pincode regardless of exactly how
   *  the header cell was capitalized or spaced in the uploaded file. */
  values: Record<string, string>;
}

// Maps a column's header cell text to the field name every consumer of
// ParsedRow.values actually reads (v.customerName, v.pincode, ...). Built
// from the same SAMPLE_COLUMNS the downloadable template uses, normalized
// (lowercased, trimmed) so re-typed or slightly reworded headers still
// resolve correctly rather than requiring an exact string match.
const HEADER_TEXT_TO_KEY = new Map(SAMPLE_COLUMNS.map((c) => [c.header.trim().toLowerCase(), c.key]));

export async function parseUploadedWorkbook(buffer: Buffer, filename: string): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook();
  const isCsv = filename.toLowerCase().endsWith(".csv");

  let sheet: ExcelJS.Worksheet | undefined;
  if (isCsv) {
    sheet = await workbook.csv.read(Readable.from(buffer));
  } else {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    sheet = workbook.worksheets[0];
  }
  if (!sheet) return [];

  const rows: ParsedRow[] = [];
  // Position -> internal key, resolved once from the header row. A column
  // whose header text doesn't match anything in SAMPLE_COLUMNS (a stray
  // extra column, say) is simply skipped rather than guessed at.
  let keysByPosition: (string | null)[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    // row.values is 1-indexed with a leading empty slot — values[0] is
    // always undefined, real cells start at [1].
    const cells = Array.isArray(row.values) ? row.values.slice(1) : [];

    if (rowNumber === 1) {
      keysByPosition = cells.map((v) => HEADER_TEXT_TO_KEY.get(String(v ?? "").trim().toLowerCase()) ?? null);
      return;
    }
    if (cells.every((v) => v === null || v === undefined || String(v).trim() === "")) return;

    const values: Record<string, string> = {};
    keysByPosition.forEach((key, i) => {
      if (!key) return;
      const cell = cells[i];
      values[key] = cell === null || cell === undefined ? "" : String(cell).trim();
    });
    rows.push({ rowNumber, values });
  });

  return rows;
}
