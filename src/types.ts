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
  yeaInterpretation?: string;
  nayInterpretation?: string;
  voteSequence?: number;
  preferredStance?: string;
};

export type Vote = {
  vote: string;
  vote_label: string;
  question_motion?: string;
  interpretation?: string;
  alignment?: "preferred" | "opposed" | "neutral";
};

export type TrackedVote = { bill: TrackerBill; vote: Vote | null };

export type RepresentativeResult = {
  id: number;
  name: string;
  slug?: string;
  chamber: "House" | "Senate";
  district: string;
  party?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  townsRepresented?: string;
  isFloterial?: boolean;
  trackedVotes: TrackedVote[];
};

export type VoteTrackerLookupResponse = {
  address: string;
  normalizedInput: unknown;
  civic: Record<string, unknown>;
  location: {
    placeName: string;
    ward?: string;
    wardRequired: boolean;
  };
  groups: { senate: RepresentativeResult[]; house: RepresentativeResult[] };
  tracker: { source: string; count: number; bills: TrackerBill[] };
};
