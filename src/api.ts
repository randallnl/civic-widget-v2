import type { VoteTrackerLookupResponse } from "./types";

export const DEFAULT_API_BASE = "https://api.nhciviccommons.com";

export type LookupConfig = {
  apiBase?: string;
  address: string;
  sheet: string;
  sheetGid?: string;
  sessionYear?: number;
  candidateYear?: number;
};

export async function lookupVotes(config: LookupConfig): Promise<VoteTrackerLookupResponse> {
  const { apiBase = DEFAULT_API_BASE, ...body } = config;
  const response = await fetch(
    `${apiBase.replace(/\/$/, "")}/widgets/vote-tracker/lookup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  const data = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Unable to load voting information.");
  }
  return data as VoteTrackerLookupResponse;
}
