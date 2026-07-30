import type { TrackerBill } from "../src/types";

export function voteBillNumber(code: string): string {
  return code.trim().toUpperCase().split("-", 1)[0];
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (quoted && char === '"' && csv[i + 1] === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function parseTrackerCsv(csv: string): TrackerBill[] {
  const [header = [], ...rows] = parseCsvRows(csv);
  const columns = new Map(header.map((value, index) => [value.trim().toLowerCase(), index]));
  const get = (row: string[], name: string) => row[columns.get(name) ?? -1]?.trim() || undefined;
  if (!columns.has("code")) throw new Error("The tracker sheet must include a Code column.");
  return rows.flatMap((row) => {
    const billNumber = get(row, "code");
    if (!billNumber) return [];
    const rawSequence = get(row, "vote sequence");
    const voteSequence = rawSequence && /^\d+$/.test(rawSequence) ? Number(rawSequence) : undefined;
    const preferredStance = get(row, "preferred stance");
    if (voteSequence === undefined || !preferredStance) return [];
    return [{
      billNumber,
      voteBillNumber: voteBillNumber(billNumber),
      title: get(row, "name") || billNumber,
      summary: get(row, "summary"),
      impact: get(row, "impact"),
      url: get(row, "moreinfourl"),
      issueArea: get(row, "issue area"),
      articles: get(row, "articles"),
      testimonySupporting: get(row, "testimony supporting"),
      testimonyOpposed: get(row, "testimony opposed"),
      yeaInterpretation: get(row, "yea interpretation"),
      nayInterpretation: get(row, "nay interpretation"),
      voteSequence,
      preferredStance
    }];
  });
}

export function safeSheetUrl(value: string, gid?: string): URL {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "docs.google.com") {
    throw new Error("Sheet must be a public Google Sheets HTTPS URL.");
  }
  if (gid) url.searchParams.set("gid", gid);
  url.searchParams.set("output", "csv");
  return url;
}
