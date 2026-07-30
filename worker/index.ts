import { divisionsByAddress, parseNhDivisions } from "./civic";
import { findRepresentatives } from "./repository";
import { parseTrackerCsv, safeSheetUrl } from "./tracker";
import { DEFAULT_SHEET_URL } from "../src/config";
import { getWardStatus } from "./location";

type RuntimeEnv = Env & {
  CIVIC_API_KEY?: SecretsStoreSecret | string;
  DB?: D1Database;
};
type LookupBody = {
  address?: string; ward?: string; partner?: string; sheet?: string; sheetGid?: string;
  sessionYear?: number; candidateYear?: number;
};
type PartnerTracker = {
  partner_key: string;
  partner_name: string;
  tracker_url: string;
};

const json = (data: unknown, status = 200, extra: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", ...extra }
});
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

async function resolveTracker(
  db: D1Database | undefined,
  body: LookupBody
): Promise<{ url: URL; partner?: { key: string; name: string } }> {
  const partnerKey = body.partner?.trim().toLowerCase();
  if (!partnerKey) {
    return { url: safeSheetUrl(body.sheet?.trim() || DEFAULT_SHEET_URL, body.sheetGid) };
  }
  if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(partnerKey)) {
    throw new Error("Invalid partner tracker.");
  }
  if (!db) throw new Error("Partner trackers are not configured.");
  const tracker = await db.prepare(`
    SELECT partner_key, partner_name, tracker_url
    FROM partner_trackers
    WHERE partner_key = ? AND is_active = 1
    LIMIT 1
  `).bind(partnerKey).first<PartnerTracker>();
  if (!tracker) throw new Error("Partner tracker not found.");
  return {
    url: safeSheetUrl(tracker.tracker_url),
    partner: { key: tracker.partner_key, name: tracker.partner_name }
  };
}

async function lookup(request: Request, env: RuntimeEnv): Promise<Response> {
  if (!env.CIVIC_API_KEY) return json({ error: "Civic Information API is not configured." }, 503, cors);
  const civicApiKey = typeof env.CIVIC_API_KEY === "string"
    ? env.CIVIC_API_KEY
    : await env.CIVIC_API_KEY.get();
  if (!civicApiKey) return json({ error: "Civic Information API is not configured." }, 503, cors);
  const body = await request.json<LookupBody>().catch(() => null);
  const address = body?.address?.trim();
  if (!body || !address) return json({ error: "Address is required." }, 400, cors);

  const tracker = await resolveTracker(env.DB, body);
  const sheetUrl = tracker.url;
  const [civicResult, sheetResponse] = await Promise.all([
    divisionsByAddress(address, civicApiKey),
    fetch(sheetUrl, { headers: { Accept: "text/csv" } })
  ]);
  if (!sheetResponse.ok) throw new Error("Unable to load the public bill tracker.");
  const csv = await sheetResponse.text();
  if (csv.length > 2_000_000) throw new Error("The bill tracker is too large.");
  const bills = parseTrackerCsv(csv);
  const civic = parseNhDivisions(civicResult.divisions);
  const location = getWardStatus(civic, civicResult.normalizedInput?.city, body?.ward);
  const groups = await findRepresentatives(env.DB, civic, bills, body?.sessionYear, body?.candidateYear, body?.ward);
  return json({
    address, normalizedInput: civicResult.normalizedInput || {}, civic, location, groups,
    tracker: {
      source: tracker.partner ? `partner:${tracker.partner.key}` : sheetUrl.toString(),
      partner: tracker.partner,
      count: bills.length,
      bills
    }
  }, 200, cors);
}

function demo(): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>NHCC Vote Tracker Demo</title><style>body{margin:0;background:#eef2f7}main{max-width:820px;margin:48px auto;padding:20px}</style></head><body><main><nhcc-vote-tracker></nhcc-vote-tracker></main><script src="/widgets/vote-tracker.js?v=20260730-4"></script></body></html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
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
