import type { LineItem } from "@/types/database";

export function calculateLineItemTotal(quantity: number, unitPrice: number) {
  return Number((quantity * unitPrice).toFixed(2));
}

export function calculateDocumentTotal(lineItems: LineItem[]) {
  return Number(
    lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2),
  );
}
