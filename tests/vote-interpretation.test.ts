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
});
