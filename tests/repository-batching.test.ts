import { describe, expect, it } from "vitest";
import { voteTargetBatches } from "../worker/repository";

describe("D1 vote query batching", () => {
  it("keeps large partner trackers below the SQL variable limit", () => {
    const targets = Array.from({ length: 181 }, (_, index) => index);
    const batches = voteTargetBatches(targets, 3);

    expect(batches.flat()).toEqual(targets);
    expect(batches.length).toBeGreaterThan(1);
    expect(batches.every((batch) => 3 + (batch.length * 2) <= 90)).toBe(true);
  });
});
