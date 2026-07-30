import { describe, expect, it } from "vitest";
import { parseNhDivisions } from "../worker/civic";

describe("Civic Information API divisions", () => {
  it("reads OCD division IDs from the response object keys", () => {
    const parsed = parseNhDivisions({
      "ocd-division/country:us/state:nh/sldu:15": { name: "New Hampshire Senate district 15" },
      "ocd-division/country:us/state:nh/sldl:merrimack_10": { name: "New Hampshire House district Merrimack 10" }
    });

    expect(parsed.senate?.id).toMatch(/\/sldu:15$/);
    expect(parsed.house?.id).toMatch(/\/sldl:merrimack_10$/);
  });
});
