"use client";

import { Scale, Users, TrendingUp, Coins, Sprout, Ship, Leaf, type LucideIcon } from "lucide-react";
import { type Lens } from "@/lib/lenses";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  scale: Scale, users: Users, "trending-up": TrendingUp,
  coins: Coins, sprout: Sprout, ship: Ship, leaf: Leaf,
};

export function LensSwitcher({
  lenses,
  activeId,
  onChange,
}: {
  lenses: Lens[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Department" className="flex flex-wrap gap-1.5">
      {lenses.map((l) => {
        const Icon = icons[l.icon] ?? Scale;
        const active = l.id === activeId;
        return (
          <button
            key={l.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(l.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
