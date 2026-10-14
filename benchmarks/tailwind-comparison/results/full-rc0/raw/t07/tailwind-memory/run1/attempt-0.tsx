"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import {
  Armchair,
  Check,
  Eye,
  Headphones,
  Heart,
  Lamp,
  RefreshCw,
  Backpack,
  ShoppingBag,
  Star,
  Watch,
  Coffee,
  Footprints,
  Camera,
  Sofa,
  Speaker,
} from "lucide-react";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

type Tag = "New" | "Sale" | "Bestseller" | "Low stock" | "Eco";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  icon: IconType;
  gradient: string;
  iconColor: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aurora Wireless Headphones",
    category: "Audio",
    price: 189,
    compareAt: 249,
    rating: 4.7,
    reviews: 1284,
    tag: "Sale",
    icon: Headphones,
    gradient: "from-indigo-200 via-violet-100 to-sky-100",
    iconColor: "text-indigo-700",
  },
  {
    id: "p2",
    name: "Meridian Automatic Watch",
    category: "Accessories",
    price: 342,
    rating: 4.9,
    reviews: 403,
    tag: "New",
    icon: Watch,
    gradient: "from-amber-200 via-orange-100 to-yellow-50",
    iconColor: "text-amber-800",
  },
  {
    id: "p3",
    name: "Trailhead 28L Daypack",
    category: "Bags",
    price: 94,
    rating: 4.6,
    reviews: 962,
    tag: "Bestseller",
    icon: Backpack,
    gradient: "from-emerald-200 via-teal-100 to-lime-50",
    iconColor: "text-emerald-800",
  },
  {
    id: "p4",
    name: "Nordic Lounge Chair",
    category: "Furniture",
    price: 520,
    compareAt: 640,
    rating: 4.5,
    reviews: 211,
    tag: "Sale",
    icon: Armchair,
    gradient: "from-rose-200 via-orange-100 to-amber-50",
    iconColor: "text-rose-800",
  },
  {
    id: "p5",
    name: "Halo Brass Desk Lamp",
    category: "Lighting",
    price: 78,
    rating: 4.4,
    reviews: 318,
    tag: "Low stock",
    icon: Lamp,
    gradient: "from-yellow-200 via-amber-100 to-stone-50",
    iconColor: "text-yellow-800",
  },
  {
    id: "p6",
    name: "Pour-Over Ceramic Set",
    category: "Kitchen",
    price: 56,
    rating: 4.8,
    reviews: 745,
    tag: "Eco",
    icon: Coffee,
    gradient: "from-stone-300 via-stone-100 to-orange-50",
    iconColor: "text-stone-700",
  },
  {
    id: "p7",
    name: "Stride Knit Runners",
    category: "Footwear",
    price: 128,
    rating: 4.3,
    reviews: 1530,
    icon: Footprints,
    gradient: "from-sky-200 via-cyan-100 to-blue-50",
    iconColor: "text-sky-800",
  },
  {
    id: "p8",
    name: "Lumen Mirrorless Camera",
    category: "Photography",
    price: 1199,
    rating: 4.8,
    reviews: 187,
    tag: "New",
    icon: Camera,
    gradient: "from-slate-300 via-zinc-100 to-slate-50",
    iconColor: "text-slate-800",
  },
  {
    id: "p9",
    name: "Cloud Modular Sofa",
    category: "Furniture",
    price: 1450,
    compareAt: 1790,
    rating: 4.6,
    reviews: 96,
    tag: "Sale",
    icon: Sofa,
    gradient: "from-fuchsia-200 via-pink-100 to-rose-50",
    iconColor: "text-fuchsia-800",
  },
  {
    id: "p10",
    name: "Pebble Bluetooth Speaker",
    category: "Audio",
    price: 69,
    rating: 4.5,
    reviews: 2210,
    tag: "Bestseller",
    icon: Speaker,
    gradient: "from-teal-200 via-cyan-100 to-emerald-50",
    iconColor: "text-teal-800",
  },
];

const TAG_STYLES: Record<Tag, string> = {
  New: "bg-indigo-600 text-white",
  Sale: "bg-rose-600 text-white",
  Bestseller: "bg-amber-400 text-amber-950",
  "Low stock": "bg-white text-orange-700 ring-1 ring-orange-300",
  Eco: "bg-emerald-600 text-white",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <div
      className="flex items-center gap-1 text-xs text-slate-600"
      role="img"
      aria-label={`Rated ${value} out of 5 from ${reviews.toLocaleString("en-US")} reviews`}
    >
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium text-slate-800" aria-hidden="true">
        {value.toFixed(1)}
      </span>
      <span aria-hidden="true">({reviews.toLocaleString("en-US")})</span>
    </div>
  );
}

interface CardProps {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: (id: string) => void;
  onAddToCart: (id: string) => void;
  onQuickView: (id: string) => void;
}

function ProductCard({ product, wished, inCart, onToggleWish, onAddToCart, onQuickView }: CardProps) {
  const Icon = product.icon;
  const discount =
    product.compareAt !== undefined
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : null;

  const circleBtn =
    "grid size-10 place-items-center rounded-full bg-white/95 text-slate-800 shadow-md ring-1 ring-black/5 transition hover:bg-white hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95 motion-reduce:transition-none";

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${product.gradient}`}>
        <div
          className="absolute -right-10 -top-10 size-40 rounded-full bg-white/40 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-12 -left-8 size-44 rounded-full bg-white/30 blur-2xl"
          aria-hidden="true"
        />
        <div className="absolute inset-0 grid place-items-center" role="img" aria-label={`${product.name} product illustration`}>
          <div className="grid size-28 place-items-center rounded-3xl bg-white/50 shadow-inner ring-1 ring-white/70 backdrop-blur-sm transition duration-300 group-hover:scale-105 sm:size-32 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Icon className={`size-14 sm:size-16 ${product.iconColor}`} aria-hidden="true" />
          </div>
        </div>

        {product.tag && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${TAG_STYLES[product.tag]}`}
          >
            {product.tag}
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2 transition duration-200 [@media(hover:hover)]:translate-x-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:translate-x-0 [@media(hover:hover)]:group-focus-within:opacity-100 motion-reduce:transition-none">
          <button
            type="button"
            className={circleBtn}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={() => onToggleWish(product.id)}
          >
            <Heart
              className={`size-5 ${wished ? "fill-rose-500 text-rose-500" : ""}`}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            className={circleBtn}
            aria-label={`Quick view ${product.name}`}
            onClick={() => onQuickView(product.id)}
          >
            <Eye className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 transition duration-200 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 motion-reduce:transition-none">
          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            aria-label={inCart ? `${product.name} added to cart` : `Add ${product.name} to cart`}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] motion-reduce:transition-none ${
              inCart
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {inCart ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" aria-hidden="true" />
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{product.category}</p>
        <h3 className="text-base font-semibold leading-snug text-slate-900">{product.name}</h3>
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-lg font-bold text-slate-900">{currency.format(product.price)}</span>
          {product.compareAt !== undefined && (
            <>
              <s className="text-sm text-slate-500">
                <span className="sr-only">Original price </span>
                {currency.format(product.compareAt)}
              </s>
              <span className="text-xs font-semibold text-rose-700">Save {discount}%</span>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function SkeletonCard() {
  return (
    <li
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="aspect-[4/5] animate-pulse bg-slate-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-16 animate-pulse rounded bg-slate-200" />
      </div>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<ReadonlySet<string>>(new Set());
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), 1800);
  }, []);

  useEffect(() => {
    startLoading();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startLoading]);

  const byId = (id: string) => PRODUCTS.find((p) => p.id === id);

  const toggleWish = useCallback((id: string) => {
    const name = PRODUCTS.find((p) => p.id === id)?.name ?? "Item";
    setWished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setStatus(`${name} removed from wishlist.`);
      } else {
        next.add(id);
        setStatus(`${name} added to wishlist.`);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((id: string) => {
    const name = PRODUCTS.find((p) => p.id === id)?.name ?? "Item";
    setCart((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setStatus(`${name} added to cart.`);
  }, []);

  const quickView = useCallback((id: string) => {
    const name = PRODUCTS.find((p) => p.id === id)?.name ?? "Item";
    setStatus(`Quick view opened for ${name}.`);
  }, []);

  void byId;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">Spring collection</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Home &amp; carry essentials</h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Considered pieces for your desk, your commute and your living room, with free returns for 30 days.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span>
                Cart: {cart.size}
                <span className="sr-only"> {cart.size === 1 ? "item" : "items"}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={startLoading}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
              {loading ? "Loading…" : "Reload products"}
            </button>
          </div>
        </header>

        <section aria-labelledby="products-heading" aria-busy={loading}>
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>
          <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {loading
              ? Array.from({ length: 10 }, (_, i) => <SkeletonCard key={i} />)
              : PRODUCTS.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    wished={wished.has(p.id)}
                    inCart={cart.has(p.id)}
                    onToggleWish={toggleWish}
                    onAddToCart={addToCart}
                    onQuickView={quickView}
                  />
                ))}
          </ul>
        </section>

        <div role="status" aria-live="polite" className="sr-only">
          {loading ? "Loading products." : status}
        </div>
      </div>
    </main>
  );
}
