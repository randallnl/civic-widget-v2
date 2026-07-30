import type { RepresentativeResult, TrackerBill, Vote } from "../src/types";
import type { ParsedCivic } from "./civic";

type RepresentativeRow = {
  id: number;
  employeeno: number;
  name: string;
  chamber: string;
  district: string;
  party: string | null;
};
type VoteRow = {
  representative_id: number;
  bill_number: string;
  vote: string;
  question_motion: string | null;
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

export async function findRepresentatives(
  db: D1Database | undefined,
  civic: ParsedCivic,
  bills: TrackerBill[],
  sessionYear?: number,
  candidateYear?: number
): Promise<{ senate: RepresentativeResult[]; house: RepresentativeResult[] }> {
  if (!db) return { senate: [], house: [] };
  const house = houseDistrict(civic.house?.id);
  const senate = districtCode(civic.senate?.id);
  if (!house && !senate) return { senate: [], house: [] };
  const roleYear = candidateYear ?? sessionYear ?? 2026;

  const query = `SELECT p.id, r.employeeno, p.display_name AS name,
      CASE r.legislativebody WHEN 'S' THEN 'Senate' ELSE 'House' END AS chamber,
      CASE WHEN r.legislativebody = 'H' THEN cc.name || ' ' || r.district ELSE r.district END AS district,
      p.party
    FROM d1_people p
    JOIN d1_person_legislator_roles r ON r.person_id = p.id
    LEFT JOIN county_codes cc ON cc.code = r.countycode
    WHERE p.is_current_legislator = 1 AND r.active = 1 AND r.session_year = ?
      AND (
        (r.legislativebody = 'S' AND upper(r.district) = ?)
        OR
        (r.legislativebody = 'H' AND upper(cc.name) = ? AND upper(r.district) = ?)
      )
    ORDER BY chamber DESC, name`;
  const reps = await db.prepare(query).bind(
    roleYear,
    senate ?? "",
    house?.county ?? "",
    house?.district ?? ""
  ).all<RepresentativeRow>();
  const employeeIds = reps.results.map((rep) => rep.employeeno);
  const billCodes = [...new Set(bills.map((bill) => bill.voteBillNumber))];
  let votes: VoteRow[] = [];
  if (employeeIds.length && billCodes.length) {
    const voteQuery = `SELECT h.employeenumber AS representative_id,
        upper(h.condensedbillno) AS bill_number, h.vote, s.question_motion
      FROM d1_rollcallhistory h
      JOIN d1_rollcallsummary s
        ON s.sessionyear = h.sessionyear
        AND s.legislativebody = h.legislativebody
        AND s.votesequencenumber = h.votesequencenumber
      WHERE h.employeenumber IN (${employeeIds.map(() => "?").join(",")})
        AND upper(h.condensedbillno) IN (${billCodes.map(() => "?").join(",")})
        AND h.sessionyear = ?
      ORDER BY s.votedate DESC, h.votesequencenumber DESC`;
    votes = (await db.prepare(voteQuery).bind(...employeeIds, ...billCodes, sessionYear ?? 2026).all<VoteRow>()).results;
  }
  const mapped = reps.results.map((rep): RepresentativeResult => ({
    name: rep.name,
    chamber: rep.chamber.toLowerCase() === "senate" ? "Senate" : "House",
    district: rep.district,
    party: rep.party || undefined,
    trackedVotes: bills.map((bill) => {
      const found = votes.find((vote) => vote.representative_id === rep.employeeno && vote.bill_number === bill.voteBillNumber);
      const vote: Vote | null = found ? {
        vote: voteLabel(found.vote), vote_label: voteLabel(found.vote),
        question_motion: found.question_motion || undefined
      } : null;
      return { bill, vote };
    })
  }));
  return {
    senate: mapped.filter((rep) => rep.chamber === "Senate"),
    house: mapped.filter((rep) => rep.chamber === "House")
  };
}
