import { describe, expect, it } from "vitest";
import { interpretedVote } from "../worker/repository";

describe("vote interpretation", () => {
  const bill = {
    billNumber: "HB115",
    voteBillNumber: "HB115",
    title: "HB115: Universal Voucher System",
    voteSequence: 64,
    preferredStance: "Nay",
    yeaInterpretation: "Anti-Public Education",
    nayInterpretation: "Pro-Public Education"
  };

  it("labels and marks a Yea vote as opposed to the preferred stance", () => {
    expect(interpretedVote(bill, "1")).toMatchObject({
      vote: "yea",
      vote_label: "HB115: Yea, Anti-Public Education Vote",
      alignment: "opposed"
    });
  });

  it("labels and marks a Nay vote as matching the preferred stance", () => {
    expect(interpretedVote(bill, "2")).toMatchObject({
      vote: "nay",
      vote_label: "HB115: Nay, Pro-Public Education Vote",
      alignment: "preferred"
    });
  });

  it("keeps a recorded Present vote visible without treating it as missing", () => {
    expect(interpretedVote(bill, "4")).toMatchObject({
      vote: "present",
      vote_label: "HB115: Present",
      alignment: "neutral"
    });
  });

  it("labels present-not-voting statuses consistently", () => {
    expect(interpretedVote(bill, "6")).toMatchObject({
      vote: "present not voting",
      vote_label: "HB115: Present not voting",
      alignment: "neutral"
    });
  });
});
