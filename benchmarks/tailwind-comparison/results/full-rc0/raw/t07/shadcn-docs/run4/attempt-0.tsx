"use client";

import * as React from "react";
import {
  Heart,
  RefreshCw,
  ShoppingBag,
  Eye,
  Star,
  PackageSearch,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Shape = "lamp" | "mug" | "chair" | "plant" | "bottle" | "speaker" | "clock" | "blanket";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: "New" | "Sale" | "Bestseller" | "Low stock";
  shape: Shape;
  from: string;
  to: string;
  accent: string;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Arc Floor Lamp",
    category: "Lighting",
    price: 189,
    compareAt: 239,
    rating: 4.7,
    reviews: 312,
    tag: "Sale",
    shape: "lamp",
    from: "#fde8d0",
    to: "#f6c9a0",
    accent: "#9a4f1c",
  },
  {
    id: "p2",
    name: "Stoneware Pour-Over Mug",
    category: "Kitchen",
    price: 28,
    rating: 4.9,
    reviews: 1204,
    tag: "Bestseller",
    shape: "mug",
    from: "#e3ecf5",
    to: "#c3d5e8",
    accent: "#2d4e73",
  },
  {
    id: "p3",
    name: "Oslo Lounge Chair",
    category: "Furniture",
    price: 449,
    rating: 4.6,
    reviews: 87,
    tag: "New",
    shape: "chair",
    from: "#e6efe3",
    to: "#c5d9bf",
    accent: "#3c5a35",
  },
  {
    id: "p4",
    name: "Monstera in Clay Pot",
    category: "Plants",
    price: 54,
    rating: 4.8,
    reviews: 640,
    shape: "plant",
    from: "#f1ead9",
    to: "#ddd0ae",
    accent: "#4b6b3a",
  },
  {
    id: "p5",
    name: "Insulated Steel Bottle 750ml",
    category: "Outdoors",
    price: 36,
    compareAt: 45,
    rating: 4.5,
    reviews: 958,
    tag: "Sale",
    shape: "bottle",
    from: "#e9e4f3",
    to: "#cfc6e6",
    accent: "#4a3b78",
  },
  {
    id: "p6",
    name: "Cove Bluetooth Speaker",
    category: "Audio",
    price: 129,
    rating: 4.4,
    reviews: 221,
    tag: "Low stock",
    shape: "speaker",
    from: "#e8e8e8",
    to: "#cfcfcf",
    accent: "#2b2b2b",
  },
  {
    id: "p7",
    name: "Walnut Wall Clock",
    category: "Decor",
    price: 79,
    rating: 4.7,
    reviews: 145,
    tag: "New",
    shape: "clock",
    from: "#f5e3e0",
    to: "#e8c3bd",
    accent: "#7a3a30",
  },
  {
    id: "p8",
    name: "Chunky Knit Throw",
    category: "Textiles",
    price: 98,
    rating: 4.9,
    reviews: 503,
    tag: "Bestseller",
    shape: "blanket",
    from: "#f3efe6",
    to: "#e1d8c3",
    accent: "#8a7448",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function tagVariant(tag: NonNullable<Product["tag"]>) {
  switch (tag) {
    case "Sale":
      return "destructive" as const;
    case "Low stock":
      return "outline" as const;
    case "New":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

function ProductArt({ product }: { product: Product }) {
  const { shape, accent } = product;
  const gradientId = `bg-${product.id}`;
  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full"
      role="img"
      aria-label={`Illustration of ${product.name}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={product.from} />
          <stop offset="1" stopColor={product.to} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradientId})`} />
      <ellipse cx="100" cy="168" rx="56" ry="7" fill={accent} opacity="0.15" />
      {shape === "lamp" && (
        <g fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round">
          <path d="M70 164 H112" />
          <path d="M91 164 V90 C91 48 140 40 148 70" />
          <path d="M132 70 H164 L158 92 H138 Z" fill={accent} />
        </g>
      )}
      {shape === "mug" && (
        <g>
          <rect x="62" y="70" width="64" height="82" rx="10" fill={accent} />
          <path
            d="M126 88 H138 a14 14 0 0 1 0 38 H126"
            fill="none"
            stroke={accent}
            strokeWidth="8"
          />
          <rect x="62" y="70" width="64" height="12" rx="6" fill="#ffffff" opacity="0.25" />
        </g>
      )}
      {shape === "chair" && (
        <g fill={accent}>
          <rect x="62" y="48" width="76" height="58" rx="14" />
          <rect x="52" y="100" width="96" height="26" rx="10" />
          <rect x="60" y="124" width="7" height="42" rx="3" />
          <rect x="133" y="124" width="7" height="42" rx="3" />
        </g>
      )}
      {shape === "plant" && (
        <g>
          <path d="M100 120 C60 110 52 70 70 52 C92 62 100 90 100 120 Z" fill={accent} />
          <path d="M100 120 C140 110 148 70 130 52 C108 62 100 90 100 120 Z" fill={accent} opacity="0.8" />
          <path d="M100 124 C96 90 100 66 100 44 C112 66 112 96 100 124 Z" fill={accent} opacity="0.9" />
          <path d="M70 120 H130 L122 164 H78 Z" fill="#b5653c" />
          <rect x="66" y="114" width="68" height="10" rx="3" fill="#c97a4f" />
        </g>
      )}
      {shape === "bottle" && (
        <g>
          <rect x="88" y="38" width="24" height="16" rx="4" fill={accent} />
          <rect x="82" y="52" width="36" height="14" rx="5" fill={accent} opacity="0.85" />
          <rect x="74" y="64" width="52" height="100" rx="16" fill={accent} />
          <rect x="84" y="78" width="7" height="70" rx="3.5" fill="#ffffff" opacity="0.25" />
        </g>
      )}
      {shape === "speaker" && (
        <g>
          <rect x="54" y="62" width="92" height="100" rx="22" fill={accent} />
          <circle cx="100" cy="124" r="26" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.5" />
          <circle cx="100" cy="124" r="12" fill="#ffffff" opacity="0.35" />
          <circle cx="100" cy="82" r="5" fill="#ffffff" opacity="0.5" />
        </g>
      )}
      {shape === "clock" && (
        <g>
          <circle cx="100" cy="100" r="62" fill={accent} />
          <circle cx="100" cy="100" r="52" fill="#fbf6ee" />
          <g stroke={accent} strokeWidth="4" strokeLinecap="round">
            <path d="M100 100 V64" />
            <path d="M100 100 L124 112" />
          </g>
          <circle cx="100" cy="100" r="5" fill={accent} />
        </g>
      )}
      {shape === "blanket" && (
        <g>
          <rect x="44" y="64" width="112" height="92" rx="10" fill={accent} />
          <g stroke="#ffffff" strokeWidth="3" opacity="0.35" strokeLinecap="round">
            <path d="M44 88 H156" />
            <path d="M44 112 H156" />
            <path d="M44 136 H156" />
          </g>
          <g stroke={accent} strokeWidth="3" strokeLinecap="round">
            {[52, 64, 76, 88, 100, 112, 124, 136, 148].map((x) => (
              <path key={x} d={`M${x} 156 V170`} />
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <div
      className="flex items-center gap-1 text-xs text-muted-foreground"
      role="img"
      aria-label={`Rated ${value} out of 5 from ${reviews} reviews`}
    >
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium text-foreground" aria-hidden="true">
        {value.toFixed(1)}
      </span>
      <span aria-hidden="true">({reviews.toLocaleString("en-US")})</span>
    </div>
  );
}

type CardProps = {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

function ProductCard({
  product,
  wished,
  onToggleWish,
  onAddToCart,
  onQuickView,
}: CardProps) {
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : null;

  return (
    <Card
      className="group/product gap-0 overflow-hidden p-0 transition-shadow focus-within:shadow-md hover:shadow-md"
      aria-label={product.name}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="size-full transition-transform duration-500 ease-out group-hover/product:scale-105 motion-reduce:transition-none motion-reduce:group-hover/product:scale-100">
          <ProductArt product={product} />
        </div>

        {product.tag && (
          <Badge
            variant={tagVariant(product.tag)}
            className={cn(
              "absolute top-3 left-3",
              product.tag === "Low stock" && "bg-background/90"
            )}
          >
            {product.tag}
            {product.tag === "Sale" && discount ? ` −${discount}%` : null}
          </Badge>
        )}

        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute top-3 right-3 rounded-full bg-background/90 shadow-sm hover:bg-background"
          aria-pressed={wished}
          aria-label={
            wished
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={() => onToggleWish(product)}
        >
          <Heart
            className={cn(wished && "fill-rose-500 text-rose-500")}
            aria-hidden="true"
          />
        </Button>

        {/* Hover / focus actions. Always visible on touch devices (no hover). */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-200 motion-reduce:transition-none",
            "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
            "[@media(hover:hover)]:group-hover/product:translate-y-0 [@media(hover:hover)]:group-hover/product:opacity-100",
            "[@media(hover:hover)]:group-focus-within/product:translate-y-0 [@media(hover:hover)]:group-focus-within/product:opacity-100"
          )}
        >
          <Button
            type="button"
            size="sm"
            className="flex-1 shadow-sm"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingBag aria-hidden="true" />
            Add to cart
            <span className="sr-only">: {product.name}</span>
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="bg-background/90 shadow-sm hover:bg-background"
            aria-label={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
          >
            <Eye aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {product.category}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-balance sm:text-base">
          {product.name}
        </h3>
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-semibold tabular-nums">
            {currency.format(product.price)}
          </span>
          {product.compareAt && (
            <>
              <span className="text-sm text-muted-foreground tabular-nums line-through">
                <span className="sr-only">Original price </span>
                {currency.format(product.compareAt)}
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden p-0" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-6 w-20" />
      </div>
    </Card>
  );
}

const FILTERS = ["All", "Sale", "New", "Bestseller"] as const;
type Filter = (typeof FILTERS)[number];

export default function Page() {
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("All");
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const [cartCount, setCartCount] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = React.useCallback((ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = setTimeout(() => setLoading(false), ms);
  }, []);

  React.useEffect(() => {
    startLoading(1600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startLoading]);

  const visible = React.useMemo(
    () =>
      filter === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.tag === filter),
    [filter]
  );

  const toggleWish = React.useCallback((product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        toast(`Removed ${product.name} from your wishlist`);
      } else {
        next.add(product.id);
        toast.success(`Saved ${product.name} to your wishlist`);
      }
      return next;
    });
  }, []);

  const addToCart = React.useCallback((product: Product) => {
    setCartCount((c) => c + 1);
    toast.success(`Added ${product.name} to your cart`, {
      description: currency.format(product.price),
    });
  }, []);

  const quickView = React.useCallback((product: Product) => {
    toast(`${product.name}`, {
      description: `${product.category} · rated ${product.rating} from ${product.reviews.toLocaleString("en-US")} reviews`,
    });
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Spring home collection
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Pieces for a calmer home
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => startLoading(1400)}
            disabled={loading}
          >
            <RefreshCw className={cn(loading && "animate-spin")} aria-hidden="true" />
            Reload
          </Button>
          <div
            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium"
            role="status"
            aria-live="polite"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span>
              Cart: <span className="tabular-nums">{cartCount}</span>
              <span className="sr-only"> {cartCount === 1 ? "item" : "items"}</span>
            </span>
          </div>
        </div>
      </header>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter products by tag"
      >
        {FILTERS.map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={filter === f ? "default" : "outline"}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className="rounded-full"
          >
            {f}
          </Button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {loading
          ? "Loading products"
          : `${visible.length} ${visible.length === 1 ? "product" : "products"} shown`}
      </p>

      <section
        aria-label="Products"
        aria-busy={loading}
        className="mt-6"
      >
        {loading ? (
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No products match this filter</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setFilter("All")}>
              Show all products
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <li key={product.id} className="h-full">
                <ProductCard
                  product={product}
                  wished={wishlist.has(product.id)}
                  onToggleWish={toggleWish}
                  onAddToCart={addToCart}
                  onQuickView={quickView}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
