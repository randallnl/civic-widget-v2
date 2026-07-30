export type TrackerBill = {
  billNumber: string;
  voteBillNumber: string;
  title: string;
  summary?: string;
  impact?: string;
  url?: string;
  issueArea?: string;
  articles?: string;
  testimonySupporting?: string;
  testimonyOpposed?: string;
};

export type Vote = {
  vote: string;
  vote_label: string;
  question_motion?: string;
};

export type TrackedVote = { bill: TrackerBill; vote: Vote | null };

export type RepresentativeResult = {
  name: string;
  chamber: "House" | "Senate";
  district: string;
  party?: string;
  trackedVotes: TrackedVote[];
};

export type VoteTrackerLookupResponse = {
  address: string;
  normalizedInput: unknown;
  civic: Record<string, unknown>;
  groups: { senate: RepresentativeResult[]; house: RepresentativeResult[] };
  tracker: { source: string; count: number; bills: TrackerBill[] };
};
