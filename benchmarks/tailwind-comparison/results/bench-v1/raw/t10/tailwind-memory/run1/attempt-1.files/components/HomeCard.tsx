"use client";

import Link from "next/link";
import { Bath, BedDouble, Heart, Maximize2, MapPin } from "lucide-react";
import { bedsLabel, formatPrice, isNew, type Home } from "@/lib/data";
import { Placeholder } from "./Placeholder";

export function HomeCard({
  home,
  highlighted,
  saved,
  onToggleSave,
  onHover,
}: {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <article
      id={`card-${home.id}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative overflow-hidden rounded-xl border bg-white transition-shadow ${
        highlighted
          ? "border-teal-700 shadow-lg ring-2 ring-teal-700/40"
          : "border-stone-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="relative">
        <Placeholder seed={home.id} className="h-40 w-full" />
        {isNew(home.listed) && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
            New this week
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onToggleSave(home.id)}
        aria-pressed={saved}
        aria-label={
          saved ? `Remove ${home.title} from saved` : `Save ${home.title}`
        }
        className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 shadow hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <Heart
          aria-hidden="true"
          className={`size-5 ${saved ? "fill-rose-600 text-rose-600" : "text-stone-700"}`}
        />
      </button>
      <div className="p-4">
        <p className="text-xl font-semibold tracking-tight text-stone-900">
          {formatPrice(home.price)}
        </p>
        <h3 className="mt-0.5 text-base font-medium text-stone-900">
          <Link
            href={`/homes/${home.id}`}
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {home.title}
          </Link>
        </h3>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700">
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            {bedsLabel(home.beds)}
          </li>
          <li className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden="true" />
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </li>
          <li className="flex items-center gap-1.5">
            <Maximize2 className="size-4" aria-hidden="true" />
            {home.area_m2} m²
          </li>
        </ul>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin className="size-4" aria-hidden="true" />
          {home.district} · {home.type}
        </p>
      </div>
    </article>
  );
}
