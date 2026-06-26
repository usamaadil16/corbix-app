"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculateLineItemTotal } from "@/lib/documents/calculate-totals";
import type { LineItem } from "@/types/database";

type Props = {
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
};

export function LineItemsEditor({ lineItems, onChange }: Props) {
  const updateItem = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    const next = [...lineItems];
    const item = { ...next[index], [field]: value };
    item.total = calculateLineItemTotal(item.quantity, item.unit_price);
    next[index] = item;
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(lineItems.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      {lineItems.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-12">
          <Input
            className="md:col-span-5"
            placeholder="Description"
            value={item.description}
            onChange={(event) => updateItem(index, "description", event.target.value)}
          />
          <Input
            className="md:col-span-2"
            type="number"
            value={item.quantity}
            onChange={(event) =>
              updateItem(index, "quantity", Number(event.target.value || 0))
            }
          />
          <Input
            className="md:col-span-2"
            type="number"
            value={item.unit_price}
            onChange={(event) =>
              updateItem(index, "unit_price", Number(event.target.value || 0))
            }
          />
          <Input className="md:col-span-2" type="number" value={item.total} readOnly />
          <Button
            className="md:col-span-1"
            variant="outline"
            onClick={() => removeItem(index)}
          >
            X
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addItem}>
        Add Line Item
      </Button>
    </div>
  );
}
