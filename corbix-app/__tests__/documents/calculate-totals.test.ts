import { describe, expect, it } from "vitest";
import {
  calculateDocumentTotal,
  calculateLineItemTotal,
} from "@/lib/documents/calculate-totals";

describe("calculate-totals", () => {
  it("calculates line item total", () => {
    expect(calculateLineItemTotal(2, 150)).toBe(300);
  });

  it("sums document total", () => {
    expect(
      calculateDocumentTotal([
        { description: "A", quantity: 1, unit_price: 100, total: 100 },
        { description: "B", quantity: 2, unit_price: 50, total: 100 },
      ]),
    ).toBe(200);
  });
});
