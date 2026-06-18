"use client";

import { Scale, Users, TrendingUp, Coins, Sprout, Ship, Leaf, type LucideIcon } from "lucide-react";
import { type Lens } from "@/lib/lenses";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  scale: Scale, users: Users, "trending-up": TrendingUp,
  coins: Coins, sprout: Sprout, ship: Ship, leaf: Leaf,
};

// The three lenses that carry the thesis (the regulation→DKK engine, the pouch growth story, hiring
// as a leading indicator) lead; the live-feed lenses sit under an "extends to —" label so they read
// as breadth/roadmap, not four co-equal hero feeds (buyer-panel feedback, 2026-06-18).
const PRIMARY = new Set(["regulatory", "sales", "hr"]);

export function LensSwitcher({
  lenses,
  activeId,
  onChange,
}: {
  lenses: Lens[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const primary = lenses.filter((l) => PRIMARY.has(l.id));
  const extended = lenses.filter((l) => !PRIMARY.has(l.id));

  const tab = (l: Lens) => {
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
  };

  return (
    <div role="tablist" aria-label="Department" className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">{primary.map(tab)}</div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          and the same engine extends to —
        </span>
        {extended.map(tab)}
      </div>
    </div>
  );
}
