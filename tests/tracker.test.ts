import { describe, expect, it } from "vitest";
import { parseTrackerCsv, safeSheetUrl, voteBillNumber } from "../worker/tracker";
import { DEFAULT_SHEET_URL } from "../src/config";

describe("tracker parsing", () => {
  it("keeps display suffixes while normalizing the vote code", () => {
    expect(voteBillNumber("HB2-LGBTQ")).toBe("HB2");
  });
  it("parses quoted commas and expected columns", () => {
    const [bill] = parseTrackerCsv('Code,Name,Summary,Impact,MoreInfoURL,Issue Area\r\nHB2-LGBTQ,"HB2, LGBTQ","A summary","An impact",https://example.com,"Civil Rights, Labor"\r\n');
    expect(bill).toMatchObject({ billNumber: "HB2-LGBTQ", voteBillNumber: "HB2", title: "HB2, LGBTQ", issueArea: "Civil Rights, Labor" });
  });
  it("only permits Google Sheets HTTPS URLs", () => {
    expect(() => safeSheetUrl("https://evil.example/sheet.csv")).toThrow();
    expect(safeSheetUrl("https://docs.google.com/spreadsheets/d/a/pub?output=csv").hostname).toBe("docs.google.com");
  });
  it("uses the published NH Civic Commons tracker as the default", () => {
    expect(safeSheetUrl(DEFAULT_SHEET_URL).hostname).toBe("docs.google.com");
  });
});
