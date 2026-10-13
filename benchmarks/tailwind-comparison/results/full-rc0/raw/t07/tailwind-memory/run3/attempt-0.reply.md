The layout and styles are plain, so I'll write the page with no external images, using inline SVG art for the product visuals.

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

type Tag = "New" | "Sale" | "Bestseller" | "Low stock";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  hue: number;
  shape: "mug" | "bottle" | "lamp" | "bag" | "chair" | "plant" | "watch" | "speaker";
};

const PRODUCTS: Product[] = [
  { id: "p1", name: "Stoneware Pour-Over Set", category: "Kitchen", price: 48, rating: 4.8, reviews: 312, tag: "Bestseller", hue: 28, shape: "mug" },
  { id: "p2", name: "Insulated Steel Bottle 750ml", category: "Outdoor", price: 29, compareAt: 38, rating: 4.6, reviews: 189, tag: "Sale", hue: 200, shape: "bottle" },
  { id: "p3", name: "Arc Desk Lamp", category: "Lighting", price: 86, rating: 4.7, reviews: 94, tag: "New", hue: 45, shape: "lamp" },
  { id: "p4", name: "Waxed Canvas Weekender", category: "Bags", price: 129, rating: 4.9, reviews: 228, hue: 95, shape: "bag" },
  { id: "p5", name: "Oak & Cane Lounge Chair", category: "Furniture", price: 340, compareAt: 420, rating: 4.5, reviews: 61, tag: "Sale", hue: 20, shape: "chair" },
  { id: "p6", name: "Trailing Pothos in Clay Pot", category: "Plants", price: 24, rating: 4.4, reviews: 143, tag: "Low stock", hue: 140, shape: "plant" },
  { id: "p7", name: "Field Automatic Watch 38mm", category: "Accessories", price: 215, rating: 4.8, reviews: 407, tag: "New", hue: 250, shape: "watch" },
  { id: "p8", name: "Bookshelf Bluetooth Speaker", category: "Audio", price: 119, rating: 4.7, reviews: 266, hue: 330, shape: "speaker" },
];

const TAG_STYLES: Record<Tag, string> = {
  New: "bg-emerald-600 text-white",
  Sale: "bg-rose-600 text-white",
  Bestseller: "bg-amber-500 text-neutral-950",
  "Low stock": "bg-neutral-900 text-white",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

function ProductArt({ shape, hue }: { shape: Product["shape"]; hue: number }) {
  const main = `hsl(${hue} 45% 38%)`;
  const light = `hsl(${hue} 50% 62%)`;
  const dark = `hsl(${hue} 40% 24%)`;
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`bg-${shape}-${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 55% 94%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 45% 84%)`} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg-${shape}-${hue})`} />
      <ellipse cx="100" cy="172" rx="58" ry="7" fill="rgb(0 0 0 / 0.12)" />
      {shape === "mug" && (
        <g>
          <rect x="62" y="70" width="64" height="80" rx="10" fill={main} />
          <path d="M126 88h10a14 14 0 0 1 0 36h-10" fill="none" stroke={main} strokeWidth="9" />
          <rect x="62" y="70" width="64" height="12" rx="6" fill={light} />
          <rect x="72" y="100" width="44" height="6" rx="3" fill={dark} opacity="0.35" />
        </g>
      )}
      {shape === "bottle" && (
        <g>
          <rect x="88" y="34" width="24" height="16" rx="4" fill={dark} />
          <rect x="80" y="48" width="40" height="112" rx="16" fill={main} />
          <rect x="88" y="62" width="6" height="80" rx="3" fill={light} opacity="0.7" />
          <rect x="80" y="110" width="40" height="14" fill={dark} opacity="0.3" />
        </g>
      )}
      {shape === "lamp" && (
        <g>
          <rect x="68" y="154" width="64" height="8" rx="4" fill={dark} />
          <path d="M100 154V84l36-30" fill="none" stroke={main} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M122 46l30 22-8 12-34-20z" fill={light} />
          <circle cx="100" cy="84" r="6" fill={dark} />
        </g>
      )}
      {shape === "bag" && (
        <g>
          <path d="M78 76a22 22 0 0 1 44 0" fill="none" stroke={dark} strokeWidth="7" />
          <path d="M52 78h96l8 80H44z" fill={main} />
          <rect x="52" y="78" width="96" height="22" fill={light} opacity="0.55" />
          <rect x="90" y="104" width="20" height="14" rx="3" fill={dark} />
        </g>
      )}
      {shape === "chair" && (
        <g>
          <rect x="62" y="48" width="12" height="108" rx="4" fill={dark} />
          <rect x="62" y="48" width="70" height="56" rx="8" fill={light} />
          <rect x="62" y="104" width="86" height="14" rx="6" fill={main} />
          <rect x="136" y="118" width="10" height="40" rx="4" fill={dark} />
          <rect x="66" y="118" width="10" height="40" rx="4" fill={dark} />
        </g>
      )}
      {shape === "plant" && (
        <g>
          <path d="M100 118C80 96 70 78 74 54c22 8 32 30 26 64z" fill={light} />
          <path d="M100 118c4-30 18-50 44-56 2 26-12 48-44 56z" fill={main} />
          <path d="M100 118c-16-10-34-12-48-4 10 14 28 18 48 4z" fill={dark} opacity="0.7" />
          <path d="M66 118h68l-8 44H74z" fill="hsl(18 55% 48%)" />
          <rect x="62" y="112" width="76" height="10" rx="4" fill="hsl(18 55% 56%)" />
        </g>
      )}
      {shape === "watch" && (
        <g>
          <rect x="84" y="28" width="32" height="48" rx="8" fill={dark} />
          <rect x="84" y="124" width="32" height="48" rx="8" fill={dark} />
          <circle cx="100" cy="100" r="40" fill={main} />
          <circle cx="100" cy="100" r="33" fill="hsl(0 0% 97%)" />
          <path d="M100 100V78M100 100l15 9" stroke={dark} strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="100" r="3.5" fill={dark} />
        </g>
      )}
      {shape === "speaker" && (
        <g>
          <rect x="52" y="52" width="96" height="108" rx="14" fill={main} />
          <circle cx="100" cy="92" r="24" fill={dark} />
          <circle cx="100" cy="92" r="10" fill={light} />
          <circle cx="100" cy="134" r="11" fill={dark} />
          <circle cx="100" cy="134" r="4" fill={light} />
        </g>
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
          className={`size-3.5 ${
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </span>
  );
}

function SkeletonCard() {
  return (
    <li
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
      aria-hidden="true"
    >
      <div className="aspect-square animate-pulse bg-neutral-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
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
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-300 focus-within:shadow-lg hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transition-none">
          <ProductArt shape={product.shape} hue={product.hue} />
        </div>

        {product.tag && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${TAG_STYLES[product.tag]}`}
          >
            {product.tag}
            {product.tag === "Sale" && discount > 0 ? ` −${discount}%` : ""}
          </span>
        )}

        <button
          type="button"
          onClick={onToggleWish}
          aria-pressed={wished}
          aria-label={`${wished ? "Remove from" : "Add to"} wishlist: ${product.name}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Heart
            className={`size-4.5 ${wished ? "fill-rose-600 text-rose-600" : ""}`}
            aria-hidden="true"
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none max-md:translate-y-0 max-md:opacity-100">
          <button
            type="button"
            onClick={onAdd}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 text-sm font-medium text-white shadow-md transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {inCart ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="size-4" aria-hidden="true" />
            )}
            {inCart ? "Added" : "Add to cart"}
            <span className="sr-only">: {product.name}</span>
          </button>
          <button
            type="button"
            onClick={onQuickView}
            aria-label={`Quick view: ${product.name}`}
            className="grid size-10 place-items-center rounded-xl bg-white text-neutral-800 shadow-md transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Eye className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Stars rating={product.rating} />
          <span>
            <span className="sr-only">Rated </span>
            {product.rating.toFixed(1)}
            <span className="sr-only"> out of 5,</span> ({product.reviews}
            <span className="sr-only"> reviews</span>)
          </span>
        </div>
        <p className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-neutral-900">
            <span className="sr-only">Price: </span>
            {currency.format(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-neutral-500 line-through">
              <span className="sr-only">Was </span>
              {currency.format(product.compareAt)}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("featured");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const products = useMemo(() => {
    const list = [...PRODUCTS];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [sort]);

  const toggle = (
    set: Set<string>,
    setter: (s: Set<string>) => void,
    id: string,
  ) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
    return next.has(id);
  };

  const handleWish = (p: Product) => {
    const on = toggle(wishlist, setWishlist, p.id);
    setStatus(`${p.name} ${on ? "added to" : "removed from"} wishlist`);
  };

  const handleAdd = (p: Product) => {
    if (!cart.has(p.id)) {
      const next = new Set(cart);
      next.add(p.id);
      setCart(next);
    }
    setStatus(`${p.name} added to cart`);
  };

  const handleQuickView = (p: Product) => {
    setStatus(`Quick view opened for ${p.name}`);
  };

  const reload = () => {
    setLoading(true);
    setStatus("");
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-bold tracking-tight">Hearth &amp; Field</span>
          <div
            className="flex items-center gap-4 text-sm"
            aria-label="Account summary"
          >
            <span className="flex items-center gap-1.5">
              <Heart className="size-4" aria-hidden="true" />
              <span className="sr-only">Wishlist items:</span>
              {wishlist.size}
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span className="sr-only">Cart items:</span>
              {cart.size}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Home &amp; everyday goods
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {loading
                ? "Loading products…"
                : `${products.length} products, free shipping over $75`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-700"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              disabled={loading}
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">Reload</span>
            </button>
          </div>
        </div>

        <ul
          className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy={loading}
          aria-label="Products"
        >
          {loading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
            : products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wished={wishlist.has(p.id)}
                  inCart={cart.has(p.id)}
                  onToggleWish={() => handleWish(p)}
                  onAdd={() => handleAdd(p)}
                  onQuickView={() => handleQuickView(p)}
                />
              ))}
        </ul>
      </main>

      <div role="status" aria-live="polite" className="sr-only">
        {status}
      </div>
    </div>
  );
}
```