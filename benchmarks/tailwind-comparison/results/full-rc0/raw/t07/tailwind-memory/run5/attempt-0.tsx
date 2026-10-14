"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, Heart, RefreshCw, ShoppingBag, Star } from "lucide-react";

type Tag = "New" | "Sale" | "Bestseller" | "Limited";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  from: string;
  to: string;
  shape: "mug" | "bottle" | "lamp" | "bag" | "chair" | "plant" | "watch" | "speaker";
};

const PRODUCTS: Product[] = [
  { id: "p1", name: "Stoneware Pour-Over Set", category: "Kitchen", price: 48, rating: 4.8, reviews: 214, tag: "Bestseller", from: "#fde68a", to: "#f59e0b", shape: "mug" },
  { id: "p2", name: "Insulated Steel Bottle 750ml", category: "Outdoors", price: 29, compareAt: 38, rating: 4.6, reviews: 389, tag: "Sale", from: "#a5f3fc", to: "#0891b2", shape: "bottle" },
  { id: "p3", name: "Arc Desk Lamp", category: "Lighting", price: 86, rating: 4.7, reviews: 97, tag: "New", from: "#e9d5ff", to: "#7c3aed", shape: "lamp" },
  { id: "p4", name: "Waxed Canvas Weekender", category: "Bags", price: 124, rating: 4.9, reviews: 152, from: "#d9f99d", to: "#4d7c0f", shape: "bag" },
  { id: "p5", name: "Oak & Wool Lounge Chair", category: "Furniture", price: 389, compareAt: 459, rating: 4.5, reviews: 63, tag: "Sale", from: "#fed7aa", to: "#c2410c", shape: "chair" },
  { id: "p6", name: "Ceramic Planter with Stand", category: "Home", price: 36, rating: 4.4, reviews: 128, tag: "New", from: "#bbf7d0", to: "#15803d", shape: "plant" },
  { id: "p7", name: "Field Automatic Watch", category: "Accessories", price: 215, rating: 4.9, reviews: 41, tag: "Limited", from: "#cbd5e1", to: "#334155", shape: "watch" },
  { id: "p8", name: "Bookshelf Bluetooth Speaker", category: "Audio", price: 139, rating: 4.7, reviews: 276, from: "#fecdd3", to: "#be123c", shape: "speaker" },
];

const TAG_STYLES: Record<Tag, string> = {
  New: "bg-emerald-600 text-white",
  Sale: "bg-rose-600 text-white",
  Bestseller: "bg-amber-500 text-neutral-950",
  Limited: "bg-neutral-900 text-white",
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function Illustration({ shape }: { shape: Product["shape"] }) {
  const common = {
    fill: "rgba(255,255,255,0.85)",
    stroke: "rgba(0,0,0,0.25)",
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  return (
    <svg viewBox="0 0 120 120" className="h-3/5 w-3/5 drop-shadow-lg" aria-hidden="true" focusable="false">
      {shape === "mug" && (
        <>
          <path d="M30 40h48v36a16 16 0 0 1-16 16H46a16 16 0 0 1-16-16z" {...common} />
          <path d="M78 50h6a10 10 0 0 1 0 22h-6" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} strokeLinecap="round" />
          <path d="M44 28c-3-5 3-7 0-12M58 28c-3-5 3-7 0-12" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}
      {shape === "bottle" && (
        <>
          <rect x="48" y="14" width="24" height="12" rx="3" {...common} />
          <path d="M46 26h28l6 14v62a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V40z" {...common} />
          <path d="M40 58h40" stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
        </>
      )}
      {shape === "lamp" && (
        <>
          <path d="M40 100h40M60 100V50" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={5} strokeLinecap="round" />
          <path d="M60 50c0-22 20-30 36-24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={5} strokeLinecap="round" />
          <path d="M84 24l24 8-10 18z" {...common} />
        </>
      )}
      {shape === "bag" && (
        <>
          <path d="M42 44c0-22 36-22 36 0" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={5} strokeLinecap="round" />
          <path d="M26 44h68l6 56a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" {...common} />
          <rect x="46" y="62" width="28" height="18" rx="3" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
        </>
      )}
      {shape === "chair" && (
        <>
          <path d="M34 20h40l6 46H28z" {...common} />
          <path d="M22 66h72v16H22z" {...common} />
          <path d="M30 82l-6 22M86 82l6 22" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      {shape === "plant" && (
        <>
          <path d="M60 70c-22-4-30-24-26-40 20 0 30 14 26 40z" {...common} />
          <path d="M60 70c22-8 28-28 22-44-18 4-28 20-22 44z" {...common} />
          <path d="M36 70h48l-6 32a6 6 0 0 1-6 5H48a6 6 0 0 1-6-5z" {...common} />
        </>
      )}
      {shape === "watch" && (
        <>
          <path d="M46 10h28l4 22H42zM42 88h36l-4 22H46z" {...common} />
          <circle cx="60" cy="60" r="30" {...common} />
          <path d="M60 60V42M60 60l12 8" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {shape === "speaker" && (
        <>
          <rect x="30" y="16" width="60" height="88" rx="10" {...common} />
          <circle cx="60" cy="40" r="9" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={2.5} />
          <circle cx="60" cy="74" r="16" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={2.5} />
          <circle cx="60" cy="74" r="5" fill="rgba(0,0,0,0.25)" />
        </>
      )}
    </svg>
  );
}

function SkeletonCard() {
  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-200 bg-white" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-neutral-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-5 w-1/4 animate-pulse rounded bg-neutral-200" />
      </div>
    </li>
  );
}

function ProductCard({
  product,
  wished,
  inCart,
  onToggleWish,
  onAdd,
  onQuickView,
}: {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: () => void;
  onAdd: () => void;
  onQuickView: () => void;
}) {
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-xl focus-within:shadow-xl">
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden"
        style={{ backgroundImage: `linear-gradient(145deg, ${product.from}, ${product.to})` }}
      >
        <div className="transition-transform duration-500 group-hover:scale-110 group-focus-within:scale-110 motion-reduce:transition-none">
          <Illustration shape={product.shape} />
        </div>

        {product.tag && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${TAG_STYLES[product.tag]}`}
          >
            {product.tag}
            {product.tag === "Sale" && discount > 0 ? ` −${discount}%` : ""}
          </span>
        )}

        <button
          type="button"
          onClick={onToggleWish}
          aria-pressed={wished}
          aria-label={`${wished ? "Remove from wishlist" : "Add to wishlist"}: ${product.name}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          <Heart
            className={`size-4.5 ${wished ? "fill-rose-600 text-rose-600" : ""}`}
            aria-hidden="true"
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 motion-reduce:transition-none">
          <button
            type="button"
            onClick={onAdd}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {inCart ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="size-4" aria-hidden="true" />
            )}
            {inCart ? "Added" : "Add to cart"}
            <span className="sr-only"> {product.name}</span>
          </button>
          <button
            type="button"
            onClick={onQuickView}
            aria-label={`Quick view: ${product.name}`}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-neutral-900 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Eye className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
          {product.name}
        </h3>
        <p className="flex items-center gap-1 text-xs text-neutral-600">
          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>
            <span className="sr-only">Rated </span>
            {product.rating.toFixed(1)}
            <span className="sr-only"> out of 5, </span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{product.reviews} reviews</span>
        </p>
        <p className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-neutral-900">{money.format(product.price)}</span>
          {product.compareAt && (
            <>
              <span className="sr-only">, was </span>
              <span className="text-sm text-neutral-500 line-through">
                {money.format(product.compareAt)}
              </span>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), 1800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const reload = () => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    setStatus("");
    timer.current = setTimeout(() => setLoading(false), 1800);
  };

  const toggleWish = (p: Product) => {
    const next = new Set(wished);
    const removing = next.has(p.id);
    if (removing) next.delete(p.id);
    else next.add(p.id);
    setWished(next);
    setStatus(`${p.name} ${removing ? "removed from" : "added to"} wishlist`);
  };

  const addToCart = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }));
    setStatus(`${p.name} added to cart`);
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-lg font-bold tracking-tight">Hearth &amp; Field</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5">
              <Heart className="size-4" aria-hidden="true" />
              <span aria-label={`${wished.size} items in wishlist`}>{wished.size}</span>
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-white">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span aria-label={`${cartCount} items in cart`}>{cartCount}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Home &amp; Living Essentials</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Everyday pieces, made to last. Free shipping on orders over $75.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            {loading ? "Loading…" : "Reload products"}
          </button>
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {loading ? "Loading products" : status || "Products loaded"}
        </p>

        <ul
          className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy={loading}
        >
          {loading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
            : PRODUCTS.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wished={wished.has(p.id)}
                  inCart={(cart[p.id] ?? 0) > 0}
                  onToggleWish={() => toggleWish(p)}
                  onAdd={() => addToCart(p)}
                  onQuickView={() => setStatus(`Quick view opened for ${p.name}`)}
                />
              ))}
        </ul>
      </main>
    </div>
  );
}
