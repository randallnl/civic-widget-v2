export type CivicDivision = { id: string; name?: string };
export type CivicResult = {
  normalizedInput?: Record<string, string>;
  divisions?: Record<string, CivicDivision>;
};

export type ParsedCivic = {
  house?: CivicDivision;
  senate?: CivicDivision;
  place?: CivicDivision;
  ward?: CivicDivision;
};

export function parseNhDivisions(divisions: Record<string, CivicDivision> = {}): ParsedCivic {
  const values = Object.values(divisions);
  const find = (part: string) => values.find((division) => division.id.includes(part));
  return {
    house: find("/sldl:"),
    senate: find("/sldu:"),
    place: find("/place:"),
    ward: find("/ward:")
  };
}

export async function divisionsByAddress(address: string, apiKey: string): Promise<CivicResult> {
  const url = new URL("https://www.googleapis.com/civicinfo/v2/divisionsByAddress");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json() as CivicResult & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Unable to match that address.");
  return data;
}
