import type { ParsedCivic } from "./civic";

export const NH_WARD_CITIES = new Set([
  "berlin",
  "claremont",
  "concord",
  "dover",
  "franklin",
  "keene",
  "laconia",
  "lebanon",
  "manchester",
  "nashua",
  "portsmouth",
  "rochester",
  "somersworth"
]);

export function getWardStatus(
  civic: ParsedCivic,
  normalizedCity?: string,
  suppliedWard?: string
): { placeName: string; ward?: string; wardRequired: boolean } {
  const placeName = (civic.place?.name || normalizedCity || "")
    .replace(/\s+(city|town)\s*$/i, "")
    .trim();
  const wardSource = `${civic.ward?.id || ""} ${civic.ward?.name || ""}`;
  const returnedWard = wardSource.match(/(?:ward:|ward\s+)(\d+)/i)?.[1];
  const ward = suppliedWard?.trim() || returnedWard;
  return {
    placeName,
    ward: ward || undefined,
    wardRequired: NH_WARD_CITIES.has(placeName.toLowerCase()) && !returnedWard && !suppliedWard?.trim()
  };
}
