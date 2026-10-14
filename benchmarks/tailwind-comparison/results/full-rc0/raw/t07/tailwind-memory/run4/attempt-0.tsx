"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Heart, RefreshCw, ShoppingBag, Star } from "lucide-react";

type Shape = "mug" | "lamp" | "bottle" | "chair" | "plant" | "speaker" | "bag" | "clock";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: "New" | "Sale" | "Best seller" | "Low stock";
  shape: Shape;
  bg: string; // tailwind gradient classes
  accent: string; // css color
};

const PRODUCTS: Product[] = [
  { id: "p1", name: "Stoneware Pour-Over Set", category: "Kitchen", price: 48, rating: 4.8, reviews: 312, tag: "Best seller", shape: "mug", bg: "from-amber-100 to-orange-200", accent: "#b45309" },
  { id: "p2", name: "Arc Desk Lamp", category: "Lighting", price: 89, compareAt: 119, rating: 4.6, reviews: 187, tag: "Sale", shape: "lamp", bg: "from-yellow-100 to-amber-200", accent: "#a16207" },
  { id: "p3", name: "Insulated Steel Bottle 750ml", category: "Outdoors", price: 32, rating: 4.9, reviews: 904, shape: "bottle", bg: "from-sky-100 to-cyan-200", accent: "#0e7490" },
  { id: "p4", name: "Oak & Cane Lounge Chair", category: "Furniture", price: 340, rating: 4.7, reviews: 76, tag: "New", shape: "chair", bg: "from-stone-100 to-stone-300", accent: "#78350f" },
  { id: "p5", name: "Trailing Pothos in Clay Pot", category: "Plants", price: 24, rating: 4.5, reviews: 233, shape: "plant", bg: "from-emerald-100 to-green-200", accent: "#047857" },
  { id: "p6", name: "Portable Bluetooth Speaker", category: "Audio", price: 129, compareAt: 159, rating: 4.4, reviews: 521, tag: "Sale", shape: "speaker", bg: "from-slate-200 to-slate-300", accent: "#334155" },
  { id: "p7", name: "Waxed Canvas Weekender", category: "Travel", price: 156, rating: 4.8, reviews: 142, tag: "Low stock", shape: "bag", bg: "from-rose-100 to-orange-100", accent: "#9f1239" },
  { id: "p8", name: "Minimal Wall Clock", category: "Decor", price: 56, rating: 4.3, reviews: 98, tag: "New", shape: "clock", bg: "from-violet-100 to-indigo-200", accent: "#4338ca" },
];

const TAG_STYLES: Record<NonNullable<Product["tag"]>, string> = {
  New: "bg-emerald-600 text-white",
  Sale: "bg-rose-600 text-white",
  "Best seller": "bg-neutral-900 text-white",
  "Low stock": "bg-amber-500 text-neutral-900",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function ProductArt({ shape, accent }: { shape: Shape; accent: string }) {
  const common = { fill: "none", stroke: accent, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const soft = { fill: accent, fillOpacity: 0.18, stroke: accent, strokeWidth: 3, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="176" rx="56" ry="7" fill="#000" fillOpacity="0.08" />
      {shape === "mug" && (
        <g>
          <path d="M56 70h88v62a26 26 0 0 1-26 26H82a26 26 0 0 1-26-26z" {...soft} />
          <path d="M144 86h8a14 14 0 0 1 0 28h-8" {...common} />
          <path d="M80 50c-6-8 6-12 0-20M104 50c-6-8 6-12 0-20M128 50c-6-8 6-12 0-20" {...common} strokeWidth={2.5} />
        </g>
      )}
      {shape === "lamp" && (
        <g>
          <path d="M70 170h60M100 170V96l34-40" {...common} />
          <path d="M118 40l40 22-18 30z" {...soft} />
          <circle cx="100" cy="96" r="5" fill={accent} />
        </g>
      )}
      {shape === "bottle" && (
        <g>
          <rect x="84" y="28" width="32" height="16" rx="4" {...soft} />
          <path d="M88 44h24v10c14 8 20 18 20 34v66a14 14 0 0 1-14 14H82a14 14 0 0 1-14-14V88c0-16 6-26 20-34z" {...soft} />
          <path d="M80 100h40M80 116h40" {...common} strokeWidth={2.5} />
        </g>
      )}
      {shape === "chair" && (
        <g>
          <path d="M60 40h60l8 70H64z" {...soft} />
          <path d="M56 110h84v22H56z" {...soft} />
          <path d="M64 132l-8 38M132 132l8 38M72 132v34M124 132v34" {...common} />
          <path d="M76 56h36M78 74h36M80 92h36" {...common} strokeWidth={2} />
        </g>
      )}
      {shape === "plant" && (
        <g>
          <path d="M100 110C96 80 80 62 56 58c0 28 16 46 44 52z" {...soft} />
          <path d="M100 110c4-34 22-52 46-54-2 30-18 48-46 54z" {...soft} />
          <path d="M100 110V80c0-14 6-26 12-34-14 4-22 18-12 34z" {...soft} />
          <path d="M66 110h68l-8 56a8 8 0 0 1-8 6H82a8 8 0 0 1-8-6z" fill="#c2410c" fillOpacity="0.35" stroke="#9a3412" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {shape === "speaker" && (
        <g>
          <rect x="50" y="64" width="100" height="100" rx="26" {...soft} />
          <circle cx="100" cy="124" r="26" {...common} />
          <circle cx="100" cy="124" r="9" fill={accent} />
          <circle cx="100" cy="86" r="5" {...common} strokeWidth={2.5} />
        </g>
      )}
      {shape === "bag" && (
        <g>
          <path d="M72 76V62a28 28 0 0 1 56 0v14" {...common} />
          <path d="M44 76h112l-8 86a8 8 0 0 1-8 7H60a8 8 0 0 1-8-7z" {...soft} />
          <path d="M50 108h100" {...common} strokeWidth={2.5} />
          <rect x="88" y="100" width="24" height="16" rx="3" fill={accent} fillOpacity="0.6" />
        </g>
      )}
      {shape === "clock" && (
        <g>
          <circle cx="100" cy="100" r="62" {...soft} />
          <circle cx="100" cy="100" r="50" {...common} strokeWidth={2} />
          <path d="M100 100V66M100 100l24 14" {...common} />
          <circle cx="100" cy="100" r="4" fill={accent} />
          <path d="M100 56v6M100 138v6M56 100h6M138 100h6" {...common} strokeWidth={2.5} />
        </g>
      )}
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`}
        />
      ))}
    </span>
  );
}

function ProductCard({
  product,
  wished,
  inCart,
  onToggleWish,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: () => void;
  onAddToCart: () => void;
  onQuickView: () => void;
}) {
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 focus-within:shadow-lg hover:shadow-lg">
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${product.bg}`}>
        <div className="h-full w-full p-6 transition-transform duration-300 ease-out group-focus-within:scale-105 group-hover:scale-105 motion-reduce:transition-none">
          <ProductArt shape={product.shape} accent={product.accent} />
        </div>

        {product.tag && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${TAG_STYLES[product.tag]}`}
          >
            {product.tag}
            {product.tag === "Sale" && discount > 0 ? ` −${discount}%` : ""}
          </span>
        )}

        <button
          type="button"
          onClick={onToggleWish}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          <Heart className={`h-[18px] w-[18px] ${wished ? "fill-rose-600 text-rose-600" : ""}`} aria-hidden="true" />
        </button>

        {/* Hover / focus actions. Always visible on touch devices (no hover). */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 transition duration-200 motion-reduce:transition-none [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          <button
            type="button"
            onClick={onAddToCart}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 text-sm font-medium text-white shadow-md transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            {inCart ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{inCart ? "Added" : "Add to cart"}</span>
            <span className="sr-only"> {product.name}</span>
          </button>
          <button
            type="button"
            onClick={onQuickView}
            aria-label={`Quick view ${product.name}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-neutral-900 shadow-md transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{product.category}</p>
        <h3 className="text-sm font-semibold leading-snug text-neutral-900 sm:text-base">{product.name}</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Stars rating={product.rating} />
          <span>
            <span className="sr-only">Rated </span>
            {product.rating.toFixed(1)}
            <span className="sr-only"> out of 5, </span>
            <span aria-hidden="true"> · </span>
            {product.reviews} <span className="sr-only">reviews</span>
            <span aria-hidden="true" className="hidden sm:inline"> reviews</span>
          </span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-neutral-900">{currency.format(product.price)}</span>
          {product.compareAt && (
            <>
              <span className="sr-only">Original price</span>
              <span className="text-sm text-neutral-500 line-through">{currency.format(product.compareAt)}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-neutral-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<ReadonlySet<string>>(new Set());
  const [quick, setQuick] = useState<Product | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(t);
  }, [reloadKey]);

  useEffect(() => {
    if (!quick) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quick]);

  const cartCount = cart.size;
  const status = useMemo(
    () => (loading ? "Loading products…" : `${PRODUCTS.length} products loaded. ${cartCount} in cart.`),
    [loading, cartCount],
  );

  const toggle = (set: ReadonlySet<string>, id: string): Set<string> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-bold tracking-tight">Hearth &amp; Home</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 font-medium">
              <Heart className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Wishlist: </span>
              {wished.size}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 font-medium text-white">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Cart: </span>
              {cartCount}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Home essentials</h1>
            <p className="mt-1 text-neutral-600">Thoughtfully made pieces for kitchen, desk and living room.</p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
            Reload products
          </button>
        </div>

        <p role="status" className="sr-only">
          {status}
        </p>

        <ul
          className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
          aria-busy={loading}
          aria-label="Products"
        >
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
                <li key={`s${i}`}>
                  <SkeletonCard />
                </li>
              ))
            : PRODUCTS.map((p) => (
                <li key={p.id}>
                  <ProductCard
                    product={p}
                    wished={wished.has(p.id)}
                    inCart={cart.has(p.id)}
                    onToggleWish={() => setWished((s) => toggle(s, p.id))}
                    onAddToCart={() => setCart((s) => (s.has(p.id) ? s : toggle(s, p.id)))}
                    onQuickView={() => setQuick(p)}
                  />
                </li>
              ))}
        </ul>
      </main>

      {quick && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setQuick(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`aspect-[4/3] bg-gradient-to-br p-6 ${quick.bg}`}>
              <ProductArt shape={quick.shape} accent={quick.accent} />
            </div>
            <div className="space-y-2 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{quick.category}</p>
              <h2 id="quick-title" className="text-xl font-bold">
                {quick.name}
              </h2>
              <p className="text-lg font-bold">{currency.format(quick.price)}</p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    setCart((s) => (s.has(quick.id) ? s : toggle(s, quick.id)));
                    setQuick(null);
                  }}
                  className="h-10 flex-1 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => setQuick(null)}
                  className="h-10 rounded-xl border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
