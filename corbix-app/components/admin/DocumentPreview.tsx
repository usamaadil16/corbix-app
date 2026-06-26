import { calculateDocumentTotal } from "@/lib/documents/calculate-totals";
import type { Client, Document } from "@/types/database";

type Props = {
  document: Pick<Document, "type" | "line_items" | "terms" | "notes">;
  client: Client | null;
};

export function DocumentPreview({ document, client }: Props) {
  const total = calculateDocumentTotal(document.line_items);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <h3 className="font-display text-2xl text-white">
        {document.type.toUpperCase()} Preview
      </h3>
      <p className="mt-2 text-sm text-muted">
        {client?.client_name} - {client?.company_name}
      </p>
      <div className="mt-4 space-y-2">
        {document.line_items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted">
              {item.description} x{item.quantity}
            </span>
            <span className="text-white">{item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between border-t border-white/10 pt-3 font-semibold">
        <span>Total</span>
        <span className="text-accent">{total.toFixed(2)}</span>
      </div>
      <p className="mt-4 text-xs text-muted">Terms: {document.terms || "N/A"}</p>
      <p className="mt-1 text-xs text-muted">Notes: {document.notes || "N/A"}</p>
    </div>
  );
}
