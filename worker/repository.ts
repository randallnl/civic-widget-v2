import type { RepresentativeResult, TrackerBill, Vote } from "../src/types";
import type { ParsedCivic } from "./civic";

type RepresentativeRow = {
  id: number;
  employeeno: number;
  name: string;
  slug: string | null;
  chamber: string;
  district: string;
  party: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  towns_represented: string | null;
  district_number: string;
};
type VoteRow = {
  representative_id: number;
  bill_number: string;
  vote_sequence: number;
  vote: string;
  question_motion: string | null;
};
type DistrictMappingRow = {
  county: number;
  district: number;
  communities_represented: string;
};

function districtCode(divisionId?: string): string | undefined {
  return divisionId?.split(":").at(-1)?.toUpperCase();
}

function houseDistrict(divisionId?: string): { county: string; district: string } | undefined {
  const code = districtCode(divisionId);
  const separator = code?.lastIndexOf("_") ?? -1;
  if (!code || separator < 1) return undefined;
  return { county: code.slice(0, separator).replaceAll("_", " "), district: code.slice(separator + 1) };
}

function voteLabel(code: string): string {
  return ({ "1": "yea", "2": "nay", "3": "absent", "4": "No vote found", "6": "present" } as Record<string, string>)[code] || code;
}

function displayVote(value: string): string {
  return value === "No vote found" ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

function interpretedVote(bill: TrackerBill, rawCode: string): Vote {
  const vote = voteLabel(rawCode);
  const normalizedVote = vote.toLowerCase();
  const interpretation = normalizedVote === "yea"
    ? bill.yeaInterpretation
    : normalizedVote === "nay"
      ? bill.nayInterpretation
      : undefined;
  const preferred = bill.preferredStance?.trim().toLowerCase();
  const alignment = preferred && (normalizedVote === "yea" || normalizedVote === "nay")
    ? normalizedVote === preferred ? "preferred" : "opposed"
    : "neutral";
  return {
    vote,
    vote_label: interpretation
      ? `${bill.billNumber}: ${displayVote(vote)}, ${interpretation} Vote`
      : `${bill.billNumber}: ${displayVote(vote)}`,
    interpretation,
    alignment
  };
}

function civicPlace(civic: ParsedCivic): string {
  return (civic.place?.name || "")
    .replace(/\s+(city|town)\s*$/i, "")
    .trim();
}

function civicWard(civic: ParsedCivic): string | undefined {
  const source = `${civic.ward?.id || ""} ${civic.ward?.name || ""}`;
  return source.match(/(?:ward:|ward\s+)(\d+)/i)?.[1];
}

function wardFromCommunities(communities: string, place: string): string | undefined {
  const escaped = place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return communities.match(new RegExp(`${escaped}[\\s-]+(?:ward\\s*)?(\\d+)`, "i"))?.[1];
}

function servesPlace(communities: string, place: string, ward?: string): boolean {
  const normalized = communities.toLowerCase().replaceAll("-", " ");
  const target = place.toLowerCase();
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (ward) {
    if (new RegExp(`\\b${escaped}\\s+(?:ward\\s*)?${ward}\\b`, "i").test(normalized)) return true;
    const wards = normalized.match(new RegExp(`\\b${escaped}\\s+wards?\\s+([\\d,\\sand]+)`, "i"))?.[1];
    return Boolean(wards?.match(/\d+/g)?.includes(ward));
  }
  return normalized.split(",").some((part) => part.trim() === target);
}

export async function findRepresentatives(
  db: D1Database | undefined,
  civic: ParsedCivic,
  bills: TrackerBill[],
  sessionYear?: number,
  candidateYear?: number,
  wardOverride?: string
): Promise<{ senate: RepresentativeResult[]; house: RepresentativeResult[] }> {
  if (!db) return { senate: [], house: [] };
  const house = houseDistrict(civic.house?.id);
  const senate = districtCode(civic.senate?.id);
  if (!house && !senate) return { senate: [], house: [] };
  const roleYear = candidateYear ?? sessionYear ?? 2026;
  const place = civicPlace(civic);
  let houseMappings: DistrictMappingRow[] = [];
  let primaryHouseDistrict = house?.district;

  if (house) {
    const mappings = await db.prepare(`SELECT m.county, m.district, m.communities_represented
      FROM d1_district_mapping m
      JOIN county_codes cc ON cc.source_county_id = m.county
      WHERE m.body = 'H' AND upper(cc.name) = ?`)
      .bind(house.county)
      .all<DistrictMappingRow>();
    const direct = mappings.results.find((mapping) => String(mapping.district) === house.district);
    const ward = wardOverride?.trim() || civicWard(civic) || (direct && place ? wardFromCommunities(direct.communities_represented, place) : undefined);
    houseMappings = place
      ? mappings.results.filter((mapping) => servesPlace(mapping.communities_represented, place, ward))
      : [];
    if (!houseMappings.length && direct) houseMappings = [direct];
  }

  const houseConditions = houseMappings.map(() => "(r.countycode = ? AND r.district = ?)");
  const representationConditions = [
    senate ? "(r.legislativebody = 'S' AND upper(r.district) = ?)" : "",
    houseConditions.length ? `(r.legislativebody = 'H' AND (${houseConditions.join(" OR ")}))` : ""
  ].filter(Boolean);
  if (!representationConditions.length) return { senate: [], house: [] };

  const query = `SELECT p.id, r.employeeno, p.display_name AS name, p.slug,
      CASE r.legislativebody WHEN 'S' THEN 'Senate' ELSE 'House' END AS chamber,
      CASE WHEN r.legislativebody = 'H' THEN cc.name || ' ' || r.district ELSE r.district END AS district,
      p.party, p.photo_url, p.email, p.phone, p.website_url,
      COALESCE(NULLIF(r.towns_represented, ''), m.communities_represented) AS towns_represented,
      r.district AS district_number
    FROM d1_people p
    JOIN d1_person_legislator_roles r ON r.person_id = p.id
    LEFT JOIN county_codes cc ON cc.code = r.countycode
    LEFT JOIN d1_district_mapping m
      ON m.body = r.legislativebody
      AND m.county = cc.source_county_id
      AND m.district = CAST(r.district AS INTEGER)
    WHERE p.is_current_legislator = 1 AND r.active = 1 AND r.session_year = ?
      AND (${representationConditions.join(" OR ")})
    ORDER BY chamber DESC, name`;
  const bindings: Array<string | number> = [roleYear];
  if (senate) bindings.push(senate);
  for (const mapping of houseMappings) bindings.push(String(mapping.county).padStart(2, "0"), String(mapping.district));
  const reps = await db.prepare(query).bind(...bindings).all<RepresentativeRow>();
  const employeeIds = reps.results.map((rep) => rep.employeeno);
  const voteTargets = bills.filter((bill): bill is TrackerBill & { voteSequence: number } =>
    Number.isInteger(bill.voteSequence)
  );
  let votes: VoteRow[] = [];
  if (employeeIds.length && voteTargets.length) {
    const targetConditions = voteTargets.map(() =>
      "(upper(h.condensedbillno) = ? AND h.votesequencenumber = ?)"
    );
    const voteQuery = `SELECT h.employeenumber AS representative_id,
        upper(h.condensedbillno) AS bill_number,
        h.votesequencenumber AS vote_sequence, h.vote, s.question_motion
      FROM d1_rollcallhistory h
      JOIN d1_rollcallsummary s
        ON s.sessionyear = h.sessionyear
        AND s.legislativebody = h.legislativebody
        AND s.votesequencenumber = h.votesequencenumber
      WHERE h.employeenumber IN (${employeeIds.map(() => "?").join(",")})
        AND (${targetConditions.join(" OR ")})
      ORDER BY h.sessionyear DESC, s.votedate DESC`;
    const targetBindings = voteTargets.flatMap((bill) => [bill.voteBillNumber, bill.voteSequence]);
    votes = (await db.prepare(voteQuery).bind(...employeeIds, ...targetBindings).all<VoteRow>()).results;
  }
  const mapped = reps.results.map((rep): RepresentativeResult => ({
    id: rep.id,
    name: rep.name,
    slug: rep.slug || undefined,
    chamber: rep.chamber.toLowerCase() === "senate" ? "Senate" : "House",
    district: rep.district,
    party: rep.party || undefined,
    photoUrl: rep.photo_url || undefined,
    email: rep.email || undefined,
    phone: rep.phone || undefined,
    websiteUrl: rep.website_url || undefined,
    townsRepresented: rep.towns_represented || undefined,
    isFloterial: rep.chamber.toLowerCase() === "house" && rep.district_number !== primaryHouseDistrict,
    trackedVotes: bills.map((bill) => {
      const found = votes.find((vote) =>
        vote.representative_id === rep.employeeno
        && vote.bill_number === bill.voteBillNumber
        && vote.vote_sequence === bill.voteSequence
      );
      const vote: Vote | null = found
        ? { ...interpretedVote(bill, found.vote), question_motion: found.question_motion || undefined }
        : null;
      return { bill, vote };
    })
  }));
  return {
    senate: mapped.filter((rep) => rep.chamber === "Senate"),
    house: mapped.filter((rep) => rep.chamber === "House")
  };
}
