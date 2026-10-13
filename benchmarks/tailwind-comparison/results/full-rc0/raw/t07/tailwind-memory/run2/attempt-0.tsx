"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  Check,
  RotateCcw,
  SearchX,
} from "lucide-react";

type Tag = "New" | "Sale" | "Bestseller" | "Limited";
type Shape = "mug" | "lamp" | "bag" | "bottle" | "chair" | "plant" | "clock" | "speaker";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  shape: Shape;
  from: string;
  to: string;
  accent: string;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Stoneware Pour-Over Mug", category: "Kitchen", price: 28, rating: 4.8, reviews: 214, tag: "Bestseller", shape: "mug", from: "#fde68a", to: "#fb923c", accent: "#9a3412" },
  { id: "p2", name: "Arc Desk Lamp", category: "Lighting", price: 89, compareAt: 119, rating: 4.6, reviews: 98, tag: "Sale", shape: "lamp", from: "#bae6fd", to: "#6366f1", accent: "#1e1b4b" },
  { id: "p3", name: "Waxed Canvas Tote", category: "Bags", price: 64, rating: 4.7, reviews: 156, tag: "New", shape: "bag", from: "#d9f99d", to: "#16a34a", accent: "#14532d" },
  { id: "p4", name: "Insulated Steel Bottle 750ml", category: "Outdoors", price: 36, rating: 4.9, reviews: 482, tag: "Bestseller", shape: "bottle", from: "#a5f3fc", to: "#0891b2", accent: "#164e63" },
  { id: "p5", name: "Oak Lounge Chair", category: "Furniture", price: 349, compareAt: 420, rating: 4.5, reviews: 63, tag: "Sale", shape: "chair", from: "#fecdd3", to: "#e11d48", accent: "#881337" },
  { id: "p6", name: "Ceramic Planter with Saucer", category: "Home", price: 32, rating: 4.4, reviews: 77, shape: "plant", from: "#ddd6fe", to: "#7c3aed", accent: "#4c1d95" },
  { id: "p7", name: "Minimal Wall Clock", category: "Home", price: 54, rating: 4.3, reviews: 41, tag: "New", shape: "clock", from: "#e2e8f0", to: "#475569", accent: "#0f172a" },
  { id: "p8", name: "Portable Bluetooth Speaker", category: "Audio", price: 129, rating: 4.7, reviews: 305, tag: "Limited", shape: "speaker", from: "#fbcfe8", to: "#db2777", accent: "#831843" },
];

const TAG_STYLES: Record<Tag, string> = {
  New: "bg-emerald-600 text-white",
  Sale: "bg-rose-600 text-white",
  Bestseller: "bg-amber-500 text-neutral-950",
  Limited: "bg-neutral-900 text-white",
};

const FILTERS = ["All", "Sale", "New", "Bestseller", "Limited"] as const;
type Filter = (typeof FILTERS)[number];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function ProductArt({ shape, accent }: { shape: Shape; accent: string }) {
  const common = { fill: accent, stroke: "none" } as const;
  return (
    <svg viewBox="0 0 120 120" className="h-3/5 w-3/5 drop-shadow-md" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="108" rx="34" ry="5" fill="#000" opacity="0.15" />
      {shape === "mug" && (
        <>
          <rect x="30" y="34" width="46" height="58" rx="8" {...common} />
          <path d="M76 46h8a10 10 0 0 1 0 28h-8" fill="none" stroke={accent} strokeWidth="7" />
          <rect x="36" y="40" width="34" height="6" rx="3" fill="#fff" opacity="0.35" />
        </>
      )}
      {shape === "lamp" && (
        <>
          <rect x="38" y="98" width="40" height="7" rx="3" {...common} />
          <path d="M58 98V52l26-22" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M74 22l24 20-10 8-24-20z" {...common} />
          <circle cx="86" cy="52" r="4" fill="#fff" opacity="0.6" />
        </>
      )}
      {shape === "bag" && (
        <>
          <path d="M42 46c0-18 36-18 36 0" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M28 46h64l6 56H22z" {...common} />
          <rect x="44" y="64" width="32" height="14" rx="3" fill="#fff" opacity="0.3" />
        </>
      )}
      {shape === "bottle" && (
        <>
          <rect x="50" y="14" width="20" height="14" rx="4" {...common} />
          <path d="M48 28h24l6 14v56a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8V42z" {...common} />
          <rect x="50" y="56" width="20" height="26" rx="4" fill="#fff" opacity="0.3" />
        </>
      )}
      {shape === "chair" && (
        <>
          <path d="M34 20h14l4 50H32z" {...common} />
          <rect x="30" y="66" width="62" height="12" rx="4" {...common} />
          <path d="M38 78l-6 28M84 78l6 28M60 78v28" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </>
      )}
      {shape === "plant" && (
        <>
          <path d="M60 64C40 56 38 36 44 24c16 6 22 20 16 40z" fill="#16a34a" />
          <path d="M60 64c20-8 24-28 16-42-14 8-20 22-16 42z" fill="#22c55e" />
          <path d="M36 66h48l-6 38H42z" {...common} />
          <rect x="32" y="62" width="56" height="8" rx="3" {...common} />
        </>
      )}
      {shape === "clock" && (
        <>
          <circle cx="60" cy="60" r="44" {...common} />
          <circle cx="60" cy="60" r="36" fill="#fff" opacity="0.92" />
          <path d="M60 60V36M60 60l16 10" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <circle cx="60" cy="60" r="4" fill={accent} />
        </>
      )}
      {shape === "speaker" && (
        <>
          <rect x="24" y="30" width="72" height="70" rx="14" {...common} />
          <circle cx="60" cy="72" r="20" fill="#fff" opacity="0.25" />
          <circle cx="60" cy="72" r="9" fill="#fff" opacity="0.5" />
          <circle cx="60" cy="46" r="5" fill="#fff" opacity="0.35" />
        </>
      )}
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </span>
  );
}

function SkeletonCard() {
  return (
    <li className="animate-pulse" aria-hidden="true">
      <div className="aspect-square rounded-2xl bg-neutral-200" />
      <div className="mt-4 space-y-2.5">
        <div className="h-3 w-1/4 rounded bg-neutral-200" />
        <div className="h-4 w-4/5 rounded bg-neutral-200" />
        <div className="h-3 w-2/5 rounded bg-neutral-200" />
        <div className="h-5 w-1/3 rounded bg-neutral-200" />
      </div>
    </li>
  );
}

interface CardProps {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onWish: (id: string) => void;
  onAdd: (id: string) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({ product, wished, inCart, onWish, onAdd, onQuickView }: CardProps) {
  const { id, name, category, price, compareAt, rating, reviews, tag } = product;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <li className="group relative">
      <article aria-labelledby={`name-${id}`}>
        <div
          className="relative aspect-square overflow-hidden rounded-2xl"
          style={{ backgroundImage: `linear-gradient(135deg, ${product.from}, ${product.to})` }}
        >
          <div className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transition-none">
            <ProductArt shape={product.shape} accent={product.accent} />
          </div>

          {tag && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${TAG_STYLES[tag]}`}
            >
              {tag}
              {tag === "Sale" && discount > 0 ? ` −${discount}%` : ""}
            </span>
          )}

          <button
            type="button"
            onClick={() => onWish(id)}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Heart className={`h-5 w-5 ${wished ? "fill-rose-600 text-rose-600" : ""}`} aria-hidden="true" />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex gap-2 transition duration-300 motion-reduce:transition-none md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onAdd(id)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {inCart ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{inCart ? "Added" : "Add to cart"}</span>
              <span className="sr-only"> {name}</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`Quick view ${name}`}
              className="grid h-11 w-11 place-items-center rounded-xl bg-white text-neutral-900 shadow-lg transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Eye className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{category}</p>
          <h3 id={`name-${id}`} className="mt-1 text-base font-semibold leading-snug text-neutral-900">
            {name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-600">
            <Stars rating={rating} />
            <span>
              <span className="sr-only">Rated </span>
              {rating.toFixed(1)}
              <span className="sr-only"> out of 5,</span> ({reviews}
              <span className="sr-only"> reviews</span>)
            </span>
          </div>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900">
              <span className="sr-only">Price: </span>
              {money.format(price)}
            </span>
            {compareAt && (
              <span className="text-sm text-neutral-500 line-through">
                <span className="sr-only">Was </span>
                {money.format(compareAt)}
              </span>
            )}
          </p>
        </div>
      </article>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<ReadonlySet<string>>(new Set());
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!quickView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickView(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickView]);

  const visible = useMemo(
    () => (filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.tag === filter)),
    [filter],
  );

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>,
    id: string,
  ) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const nameOf = (id: string) => PRODUCTS.find((p) => p.id === id)?.name ?? "Item";

  const handleWish = (id: string) => {
    const adding = !wishlist.has(id);
    toggle(setWishlist, id);
    setStatus(`${nameOf(id)} ${adding ? "added to" : "removed from"} wishlist`);
  };

  const handleAdd = (id: string) => {
    if (cart.has(id)) {
      setStatus(`${nameOf(id)} is already in your cart`);
      return;
    }
    toggle(setCart, id);
    setStatus(`${nameOf(id)} added to cart`);
  };

  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1600);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-bold tracking-tight">Hearthline</span>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Heart className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Wishlist items:</span>
              {wishlist.size}
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Cart items:</span>
              {cart.size}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Home &amp; everyday essentials</h1>
            <p className="mt-2 max-w-xl text-neutral-600">
              Thoughtfully made pieces for the kitchen, desk and living room. Free shipping on orders over $75.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-neutral-300 bg-white px-3.5 text-sm font-medium transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Reload products
          </button>
        </div>

        <div role="group" aria-label="Filter products by tag" className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`h-10 rounded-full px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                filter === f
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-neutral-600" aria-live="polite">
          {loading ? "Loading products…" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </p>

        {loading ? (
          <ul
            className="mt-4 grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : visible.length > 0 ? (
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wished={wishlist.has(p.id)}
                inCart={cart.has(p.id)}
                onWish={handleWish}
                onAdd={handleAdd}
                onQuickView={setQuickView}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <SearchX className="h-10 w-10 text-neutral-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">No products match this filter</h2>
            <p className="mt-1 text-neutral-600">Try another tag to see more of the collection.</p>
          </div>
        )}
      </main>

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {quickView && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/60 p-4 sm:items-center"
          onClick={() => setQuickView(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qv-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex aspect-video items-center justify-center rounded-xl"
              style={{ backgroundImage: `linear-gradient(135deg, ${quickView.from}, ${quickView.to})` }}
            >
              <ProductArt shape={quickView.shape} accent={quickView.accent} />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {quickView.category}
            </p>
            <h2 id="qv-title" className="mt-1 text-xl font-bold">
              {quickView.name}
            </h2>
            <p className="mt-1 text-lg font-semibold">{money.format(quickView.price)}</p>
            <p className="mt-2 text-sm text-neutral-600">
              Rated {quickView.rating.toFixed(1)} out of 5 by {quickView.reviews} customers. Ships in 2–3 business days.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  handleAdd(quickView.id);
                  setQuickView(null);
                }}
                className="h-11 flex-1 rounded-xl bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => setQuickView(null)}
                className="h-11 rounded-xl border border-neutral-300 px-5 text-sm font-medium transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
