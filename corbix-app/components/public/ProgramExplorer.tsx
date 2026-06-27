"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { Program } from "@/types/database";

type ProgramExplorerProps = {
  programs: Program[];
};

type Range = "all" | "lt250" | "250to500" | "500to1000" | "gt1000";

function parseAmount(value: string): number {
  const numeric = value.replace(/[^0-9.]/g, "");
  if (!numeric) return Number.POSITIVE_INFINITY;
  return Number.parseFloat(numeric);
}

function withinRange(value: number, range: Range) {
  if (range === "all") return true;
  if (range === "lt250") return value < 250000;
  if (range === "250to500") return value >= 250000 && value <= 500000;
  if (range === "500to1000") return value > 500000 && value <= 1000000;
  return value > 1000000;
}

export function ProgramExplorer({ programs }: ProgramExplorerProps) {
  const [region, setRegion] = useState("All");
  const [type, setType] = useState<"All" | "Citizenship" | "Residence">("All");
  const [serviceType, setServiceType] = useState("All");
  const [range, setRange] = useState<Range>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const regions = useMemo(
    () => ["All", ...new Set(programs.map((program) => program.region))],
    [programs],
  );

  const serviceTypes = useMemo(
    () => [
      "All",
      ...new Set(
        programs
          .map((program) => program.service_type)
          .filter((value): value is string => Boolean(value)),
      ),
    ],
    [programs],
  );

  const filtered = useMemo(() => {
    return programs.filter((program) => {
      if (region !== "All" && program.region !== region) return false;
      if (type !== "All" && program.type !== type) return false;
      if (serviceType !== "All" && program.service_type !== serviceType)
        return false;
      if (!withinRange(parseAmount(program.minimum_capital), range)) return false;
      return true;
    });
  }, [programs, range, region, serviceType, type]);

  return (
    <section className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Select value={region} onChange={(event) => setRegion(event.target.value)}>
          {regions.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </Select>
        <Select
          value={type}
          onChange={(event) =>
            setType(event.target.value as "All" | "Citizenship" | "Residence")
          }
        >
          <option value="All">All Program Types</option>
          <option value="Citizenship">Citizenship</option>
          <option value="Residence">Residence</option>
        </Select>
        {serviceTypes.length > 1 ? (
          <Select
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
          >
            {serviceTypes.map((entry) => (
              <option key={entry} value={entry}>
                {entry === "All" ? "All Service Types" : entry}
              </option>
            ))}
          </Select>
        ) : null}
        <Select
          value={range}
          onChange={(event) => setRange(event.target.value as Range)}
        >
          <option value="all">All Investment Ranges</option>
          <option value="lt250">&lt; 250k</option>
          <option value="250to500">250k - 500k</option>
          <option value="500to1000">500k - 1M</option>
          <option value="gt1000">&gt; 1M</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((program) => {
          const isOpen = expanded === program.country;
          return (
            <button
              key={`${program.country}-${program.type}`}
              type="button"
              className="text-left"
              onClick={() =>
                setExpanded((current) =>
                  current === program.country ? null : program.country,
                )
              }
            >
              <Card className="h-full">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">{program.country}</h3>
                  <Badge tone="accent">{program.type}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{program.region}</p>
                {program.service_type ? (
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                    {program.service_type}
                  </p>
                ) : null}
                {isOpen ? (
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-white">
                      Minimum Investment:{" "}
                      <span className="text-accent">{program.minimum_capital}</span>
                    </p>
                    <p className="text-muted">{program.key_benefit}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted">Click to view details</p>
                )}
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
