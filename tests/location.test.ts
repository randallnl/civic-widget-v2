import { describe, expect, it } from "vitest";
import { getWardStatus } from "../worker/location";

describe("ward prompting", () => {
  it("prompts listed cities when Google returns no ward", () => {
    expect(getWardStatus({ place: { name: "Concord city" } }, "Concord").wardRequired).toBe(true);
  });

  it("does not prompt when Google returns a ward", () => {
    const status = getWardStatus({
      place: { name: "Concord city" },
      ward: { id: "ocd-division/country:us/state:nh/place:concord/ward:4" }
    });
    expect(status).toMatchObject({ ward: "4", wardRequired: false });
  });

  it("does not prompt towns outside the ward-city list", () => {
    expect(getWardStatus({ place: { name: "Bow town" } }, "Bow").wardRequired).toBe(false);
  });
});
