"use client";

import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Home, formatBeds, formatPrice, isNew } from "@/lib/data";
import { HomePlaceholder } from "@/components/haven/home-placeholder";
import { SaveButton } from "@/components/haven/save-button";

export function HomeCard({
  home,
  active,
  onHover,
}: {
  home: Home;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  return (
    <article
      id={`card-${home.id}`}
      data-active={active}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow",
        active && "ring-2 ring-primary shadow-md",
      )}
    >
      <div className="relative">
        <HomePlaceholder home={home} className="aspect-[16/10] transition-transform duration-300 group-hover:scale-[1.02]" />
        {isNew(home) ? (
          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">New this week</Badge>
        ) : null}
        <SaveButton homeId={home.id} title={home.title} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xl font-semibold tracking-tight">{formatPrice(home.price)}</p>
        <h3 className="leading-snug font-medium">
          <Link
            href={`/homes/${home.id}`}
            className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {home.title}
          </Link>
        </h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            {formatBeds(home.beds)}
          </li>
          <li className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden="true" />
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </li>
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4" aria-hidden="true" />
            {home.area_m2} m²
          </li>
        </ul>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden="true" />
          {home.district}, Lisbon · {home.type}
        </p>
      </div>
    </article>
  );
}
