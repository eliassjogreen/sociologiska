import { google } from "googleapis";
import { DATABASE, database } from "../server/database.ts";

// Google Sheet each event's registrations are exported to. The sheet must be
// shared with GOOGLE_SERVICE_ACCOUNT_EMAIL as an editor.
const SPREADSHEET_IDS: Record<string, string> = {
  "julful-2026": "1HyVV4DSH6p3gDzRHOt8cZv33T8aIdyUz3cC3lyyhduA",
};

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const HEADER = [
  "Namn",
  "E-post",
  "Telefon",
  "Bordsgranne",
  "Specialkost",
  "Sångbok",
  "Betalningssätt",
  "Belopp (kr)",
  "Betalning bekräftad",
  "Betalning verifierad",
  "Anmäld (UTC)",
];

interface RegistrationRow {
  name: string;
  email: string | null;
  phone: string;
  wants_neighbor: string | null;
  dietary_preferences: string | null;
  wants_songbook: number;
  payment_kind: string;
  payment_amount: number;
  payment_confirmed: number;
  payment_verified: number;
  created_at: string;
}

const registrationsQuery = database.prepare(`
  SELECT name, email, phone, wants_neighbor, dietary_preferences, wants_songbook,
         payment_kind, payment_amount, payment_confirmed, payment_verified, created_at
  FROM registrations
  WHERE event = ?
  ORDER BY created_at, id
`);

function yesNo(value: number): string {
  return value === 1 ? "Ja" : "Nej";
}

function toSheetRow(row: RegistrationRow): (string | number)[] {
  return [
    row.name,
    row.email ?? "",
    row.phone,
    row.wants_neighbor ?? "",
    row.dietary_preferences ?? "",
    yesNo(row.wants_songbook),
    row.payment_kind,
    row.payment_amount,
    yesNo(row.payment_confirmed),
    yesNo(row.payment_verified),
    row.created_at,
  ];
}

function createSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must be set",
    );
  }

  const auth = new google.auth.JWT({ email, key, scopes: SCOPES });
  return google.sheets({ version: "v4", auth });
}

async function exportEvent(
  sheets: ReturnType<typeof createSheetsClient>,
  eventSlug: string,
  spreadsheetId: string,
) {
  const rows = registrationsQuery.all(eventSlug) as unknown as RegistrationRow[];
  const values = [HEADER, ...rows.map(toSheetRow)];

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A:Z" });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "A1",
    // RAW stores values as typed, so user input starting with "=" isn't evaluated as a formula.
    valueInputOption: "RAW",
    requestBody: { values },
  });

  console.info(`Exported ${rows.length} registrations for ${eventSlug}`);
}

async function main() {
  if (DATABASE === ":memory:") {
    throw new Error("DATABASE must point to the database file, not the in memory database");
  }

  const sheets = createSheetsClient();

  for (const [eventSlug, spreadsheetId] of Object.entries(SPREADSHEET_IDS)) {
    await exportEvent(sheets, eventSlug, spreadsheetId);
  }
}

main().catch((error: unknown) => {
  console.error("Export failed", error);
  process.exitCode = 1;
});
