import { describe, expect, it } from "vitest";
import { parseTrackerCsv, safeSheetUrl, voteBillNumber } from "../worker/tracker";
import { DEFAULT_SHEET_URL } from "../src/config";

describe("tracker parsing", () => {
  it("keeps display suffixes while normalizing the vote code", () => {
    expect(voteBillNumber("HB2-LGBTQ")).toBe("HB2");
  });
  it("parses quoted commas and expected columns", () => {
    const [bill] = parseTrackerCsv('Code,Name,Summary,Impact,MoreInfoURL,Issue Area,Vote Sequence,Preferred Stance\r\nHB2-LGBTQ,"HB2, LGBTQ","A summary","An impact",https://example.com,"Civil Rights, Labor",12,Nay\r\n');
    expect(bill).toMatchObject({ billNumber: "HB2-LGBTQ", voteBillNumber: "HB2", title: "HB2, LGBTQ", issueArea: "Civil Rights, Labor" });
  });
  it("parses vote sequence, interpretations, and preferred stance", () => {
    const [bill] = parseTrackerCsv("Code,Name,Yea Interpretation,Nay Interpretation,Vote Sequence,Preferred Stance\nHB115,HB115,Anti-Public Education,Pro-Public Education,64,Nay\n");
    expect(bill).toMatchObject({
      voteSequence: 64,
      yeaInterpretation: "Anti-Public Education",
      nayInterpretation: "Pro-Public Education",
      preferredStance: "Nay"
    });
  });
  it("excludes bills without both a vote sequence and preferred stance", () => {
    const bills = parseTrackerCsv(
      "Code,Name,Vote Sequence,Preferred Stance\n"
      + "HB1,Complete,12,Nay\n"
      + "HB2,Missing sequence,,Yea\n"
      + "HB3,Missing stance,13,\n"
      + "HB4,Invalid sequence,TBD,Nay\n"
    );
    expect(bills.map((bill) => bill.billNumber)).toEqual(["HB1"]);
  });
  it("only permits Google Sheets HTTPS URLs", () => {
    expect(() => safeSheetUrl("https://evil.example/sheet.csv")).toThrow();
    expect(safeSheetUrl("https://docs.google.com/spreadsheets/d/a/pub?output=csv").hostname).toBe("docs.google.com");
  });
  it("uses the published NH Civic Commons tracker as the default", () => {
    expect(safeSheetUrl(DEFAULT_SHEET_URL).hostname).toBe("docs.google.com");
  });
});
