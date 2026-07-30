import type { RepresentativeResult, TrackerBill, Vote } from "../src/types";
import type { ParsedCivic } from "./civic";

type RepresentativeRow = {
  id: string;
  name: string;
  chamber: string;
  district: string;
  party: string | null;
};
type VoteRow = {
  representative_id: string;
  bill_number: string;
  vote: string;
  vote_label: string | null;
  question_motion: string | null;
};

function districtCode(divisionId?: string): string | undefined {
  return divisionId?.split(":").at(-1)?.toUpperCase();
}

export async function findRepresentatives(
  db: D1Database | undefined,
  civic: ParsedCivic,
  bills: TrackerBill[],
  sessionYear?: number,
  candidateYear?: number
): Promise<{ senate: RepresentativeResult[]; house: RepresentativeResult[] }> {
  if (!db) return { senate: [], house: [] };
  const house = districtCode(civic.house?.id);
  const senate = districtCode(civic.senate?.id);
  const districts = [house, senate].filter((value): value is string => Boolean(value));
  if (!districts.length) return { senate: [], house: [] };

  const query = `SELECT id, name, chamber, district, party
    FROM representatives
    WHERE upper(chamber) IN ('HOUSE','SENATE')
      AND upper(district) IN (${districts.map(() => "?").join(",")})
      AND (? IS NULL OR candidate_year = ?)
      AND (active = 1 OR active IS NULL)`;
  const reps = await db.prepare(query).bind(...districts, candidateYear ?? null, candidateYear ?? null).all<RepresentativeRow>();
  const repIds = reps.results.map((rep) => rep.id);
  const billCodes = [...new Set(bills.map((bill) => bill.voteBillNumber))];
  let votes: VoteRow[] = [];
  if (repIds.length && billCodes.length) {
    const voteQuery = `SELECT representative_id, upper(bill_number) AS bill_number, vote, vote_label, question_motion
      FROM roll_call_votes WHERE representative_id IN (${repIds.map(() => "?").join(",")})
      AND upper(bill_number) IN (${billCodes.map(() => "?").join(",")})
      AND (? IS NULL OR session_year = ?)`;
    votes = (await db.prepare(voteQuery).bind(...repIds, ...billCodes, sessionYear ?? null, sessionYear ?? null).all<VoteRow>()).results;
  }
  const mapped = reps.results.map((rep): RepresentativeResult => ({
    name: rep.name,
    chamber: rep.chamber.toLowerCase() === "senate" ? "Senate" : "House",
    district: rep.district,
    party: rep.party || undefined,
    trackedVotes: bills.map((bill) => {
      const found = votes.find((vote) => vote.representative_id === rep.id && vote.bill_number === bill.voteBillNumber);
      const vote: Vote | null = found ? {
        vote: found.vote, vote_label: found.vote_label || found.vote,
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
