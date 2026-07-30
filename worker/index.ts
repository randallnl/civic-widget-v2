import { divisionsByAddress, parseNhDivisions } from "./civic";
import { findRepresentatives } from "./repository";
import { parseTrackerCsv, safeSheetUrl } from "./tracker";

type RuntimeEnv = Env & { CIVIC_API_KEY?: string; DB?: D1Database };
type LookupBody = {
  address?: string; sheet?: string; sheetGid?: string;
  sessionYear?: number; candidateYear?: number;
};

const json = (data: unknown, status = 200, extra: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", ...extra }
});
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

async function lookup(request: Request, env: RuntimeEnv): Promise<Response> {
  if (!env.CIVIC_API_KEY) return json({ error: "Civic Information API is not configured." }, 503, cors);
  const body = await request.json<LookupBody>().catch(() => null);
  const address = body?.address?.trim();
  if (!address) return json({ error: "Address is required." }, 400, cors);
  if (!body?.sheet) return json({ error: "This widget needs a sheet URL." }, 400, cors);

  const sheetUrl = safeSheetUrl(body.sheet, body.sheetGid);
  const [civicResult, sheetResponse] = await Promise.all([
    divisionsByAddress(address, env.CIVIC_API_KEY),
    fetch(sheetUrl, { headers: { Accept: "text/csv" } })
  ]);
  if (!sheetResponse.ok) throw new Error("Unable to load the public bill tracker.");
  const csv = await sheetResponse.text();
  if (csv.length > 2_000_000) throw new Error("The bill tracker is too large.");
  const bills = parseTrackerCsv(csv);
  const civic = parseNhDivisions(civicResult.divisions);
  const groups = await findRepresentatives(env.DB, civic, bills, body.sessionYear, body.candidateYear);
  return json({
    address, normalizedInput: civicResult.normalizedInput || {}, civic, groups,
    tracker: { source: sheetUrl.toString(), count: bills.length, bills }
  }, 200, cors);
}

function demo(): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>NHCC Vote Tracker Demo</title><style>body{margin:0;background:#eef2f7}main{max-width:820px;margin:48px auto;padding:20px}</style></head><body><main><nhcc-vote-tracker sheet="REPLACE_WITH_PUBLISHED_GOOGLE_SHEET_CSV_URL"></nhcc-vote-tracker></main><script src="/widgets/vote-tracker.js"></script></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export default {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (request.method === "OPTIONS" && url.pathname === "/widgets/vote-tracker/lookup") return new Response(null, { status: 204, headers: cors });
      if (request.method === "POST" && url.pathname === "/widgets/vote-tracker/lookup") return await lookup(request, env);
      if (request.method === "GET" && url.pathname === "/widgets/vote-tracker/demo") return demo();
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(JSON.stringify({ event: "vote_tracker_error", message: error instanceof Error ? error.message : "Unknown error" }));
      return json({ error: error instanceof Error ? error.message : "Unable to load voting information." }, 500, cors);
    }
  }
} satisfies ExportedHandler<RuntimeEnv>;
