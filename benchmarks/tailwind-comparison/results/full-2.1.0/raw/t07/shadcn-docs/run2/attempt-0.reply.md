```tsx
"use client";

import * as React from "react";
import {
  Eye,
  Heart,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

type Category = "Audio" | "Wearables" | "Home" | "Bags" | "Desk";
type ProductTag = "New" | "Sale" | "Bestseller" | "Low stock";
type ArtShape = "headphones" | "watch" | "lamp" | "backpack" | "keyboard" | "mug" | "speaker" | "bottle";

interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: ProductTag;
  shape: ArtShape;
  /** Tailwind gradient classes for the image backdrop */
  tone: string;
  /** Accent colour used for the inline artwork */
  accent: string;
  colors: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aria Wireless Headphones",
    category: "Audio",
    price: 189,
    compareAt: 239,
    rating: 4.7,
    reviews: 1284,
    tag: "Sale",
    shape: "headphones",
    tone: "from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-900",
    accent: "#c2410c",
    colors: "Terracotta",
  },
  {
    id: "p2",
    name: "Meridian Smartwatch 2",
    category: "Wearables",
    price: 329,
    rating: 4.5,
    reviews: 642,
    tag: "New",
    shape: "watch",
    tone: "from-sky-100 to-indigo-200 dark:from-sky-950 dark:to-indigo-900",
    accent: "#3730a3",
    colors: "Midnight",
  },
  {
    id: "p3",
    name: "Halo Adjustable Desk Lamp",
    category: "Desk",
    price: 74,
    rating: 4.8,
    reviews: 903,
    tag: "Bestseller",
    shape: "lamp",
    tone: "from-yellow-100 to-lime-200 dark:from-yellow-950 dark:to-lime-900",
    accent: "#4d7c0f",
    colors: "Sage",
  },
  {
    id: "p4",
    name: "Trailhead 24L Daypack",
    category: "Bags",
    price: 98,
    rating: 4.6,
    reviews: 417,
    shape: "backpack",
    tone: "from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900",
    accent: "#0f766e",
    colors: "Forest",
  },
  {
    id: "p5",
    name: "Keystone Mechanical Keyboard",
    category: "Desk",
    price: 149,
    compareAt: 179,
    rating: 4.9,
    reviews: 2210,
    tag: "Sale",
    shape: "keyboard",
    tone: "from-zinc-100 to-slate-300 dark:from-zinc-900 dark:to-slate-800",
    accent: "#334155",
    colors: "Graphite",
  },
  {
    id: "p6",
    name: "Hearth Stoneware Mug Set",
    category: "Home",
    price: 42,
    rating: 4.4,
    reviews: 288,
    tag: "Low stock",
    shape: "mug",
    tone: "from-rose-100 to-pink-200 dark:from-rose-950 dark:to-pink-900",
    accent: "#be185d",
    colors: "Blush",
  },
  {
    id: "p7",
    name: "Pebble Portable Speaker",
    category: "Audio",
    price: 119,
    rating: 4.3,
    reviews: 756,
    tag: "New",
    shape: "speaker",
    tone: "from-violet-100 to-purple-200 dark:from-violet-950 dark:to-purple-900",
    accent: "#6d28d9",
    colors: "Lilac",
  },
  {
    id: "p8",
    name: "Summit Insulated Bottle 750ml",
    category: "Home",
    price: 36,
    rating: 4.7,
    reviews: 1530,
    tag: "Bestseller",
    shape: "bottle",
    tone: "from-cyan-100 to-sky-200 dark:from-cyan-950 dark:to-sky-900",
    accent: "#0369a1",
    colors: "Glacier",
  },
];

const CATEGORIES: ("All" | Category)[] = ["All", "Audio", "Wearables", "Desk", "Home", "Bags"];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const TAG_STYLES: Record<ProductTag, string> = {
  New: "bg-primary text-primary-foreground",
  Sale: "bg-destructive text-white dark:bg-destructive/80",
  Bestseller: "bg-amber-500 text-amber-950",
  "Low stock": "bg-background text-foreground border-border",
};

/* -------------------------------------------------------------------------- */
/*  Inline artwork (no network assets)                                         */
/* -------------------------------------------------------------------------- */

function ProductArt({ shape, accent }: { shape: ArtShape; accent: string }) {
  const common = {
    fill: "none",
    stroke: accent,
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const soft = { fill: accent, fillOpacity: 0.18 };

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-3/5 w-3/5 drop-shadow-sm transition-transform duration-500 ease-out group-hover/card:scale-105 group-focus-within/card:scale-105 motion-reduce:transition-none"
      aria-hidden="true"
      focusable="false"
    >
      {shape === "headphones" && (
        <>
          <path d="M45 120V100a55 55 0 0 1 110 0v20" {...common} />
          <rect x="32" y="115" width="32" height="52" rx="14" {...common} {...soft} />
          <rect x="136" y="115" width="32" height="52" rx="14" {...common} {...soft} />
        </>
      )}
      {shape === "watch" && (
        <>
          <path d="M78 20h44l6 34H72zM72 146h56l-6 34H78z" {...common} {...soft} />
          <rect x="56" y="52" width="88" height="96" rx="26" {...common} {...soft} />
          <path d="M100 78v24l16 10" {...common} />
        </>
      )}
      {shape === "lamp" && (
        <>
          <path d="M60 176h60" {...common} />
          <path d="M90 176l10-66 42-48" {...common} />
          <path d="M126 40l46 30-26 28z" {...common} {...soft} />
          <circle cx="100" cy="110" r="7" {...common} {...soft} />
        </>
      )}
      {shape === "backpack" && (
        <>
          <path d="M80 42a20 20 0 0 1 40 0" {...common} />
          <rect x="50" y="42" width="100" height="134" rx="34" {...common} {...soft} />
          <rect x="72" y="112" width="56" height="42" rx="12" {...common} />
          <path d="M72 80h56" {...common} />
        </>
      )}
      {shape === "keyboard" && (
        <>
          <rect x="16" y="64" width="168" height="84" rx="14" {...common} {...soft} />
          <path d="M36 88h8M60 88h8M84 88h8M108 88h8M132 88h8M156 88h8M36 108h8M60 108h8M84 108h8M108 108h8M132 108h8M156 108h8M60 128h80" {...common} />
        </>
      )}
      {shape === "mug" && (
        <>
          <path d="M44 66h96v70a34 34 0 0 1-34 34H78a34 34 0 0 1-34-34z" {...common} {...soft} />
          <path d="M140 84h8a20 20 0 0 1 0 40h-8" {...common} />
          <path d="M72 40c-6 8 6 12 0 20M100 40c-6 8 6 12 0 20" {...common} />
        </>
      )}
      {shape === "speaker" && (
        <>
          <rect x="52" y="30" width="96" height="140" rx="30" {...common} {...soft} />
          <circle cx="100" cy="104" r="28" {...common} />
          <circle cx="100" cy="104" r="8" {...common} {...soft} />
          <circle cx="100" cy="58" r="5" {...common} />
        </>
      )}
      {shape === "bottle" && (
        <>
          <rect x="84" y="20" width="32" height="22" rx="6" {...common} />
          <path d="M84 42h32l16 22v100a14 14 0 0 1-14 14H82a14 14 0 0 1-14-14V64z" {...common} {...soft} />
          <path d="M68 100h64M68 130h64" {...common} />
        </>
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product card                                                               */
/* -------------------------------------------------------------------------- */

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  inCart: number;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

function ProductCard({
  product,
  wishlisted,
  inCart,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const titleId = `product-${product.id}-title`;
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <article
      aria-labelledby={titleId}
      className="group/card relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-lg focus-within:shadow-lg"
    >
      {/* Image area */}
      <div
        className={cn(
          "relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br",
          product.tone,
        )}
      >
        <ProductArt shape={product.shape} accent={product.accent} />

        {product.tag && (
          <Badge
            className={cn(
              "absolute top-3 left-3 shadow-xs",
              TAG_STYLES[product.tag],
            )}
          >
            {product.tag === "Sale" && discount > 0
              ? `Sale −${discount}%`
              : product.tag}
          </Badge>
        )}

        {/* Wishlist — always available, also on touch devices */}
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          aria-pressed={wishlisted}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={() => onToggleWishlist(product)}
          className="absolute top-3 right-3 rounded-full bg-background/90 shadow-xs backdrop-blur hover:bg-background"
        >
          <Heart
            className={cn(
              "transition-colors",
              wishlisted && "fill-destructive text-destructive",
            )}
            aria-hidden="true"
          />
        </Button>

        {/* Hover / focus actions (always visible on touch screens) */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 flex items-center gap-2",
            "transition-all duration-300 motion-reduce:transition-none",
            "[@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0",
            "[@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100",
            "[@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100",
          )}
        >
          <Button
            type="button"
            size="sm"
            onClick={() => onAddToCart(product)}
            className="flex-1 shadow-md"
          >
            <ShoppingCart aria-hidden="true" />
            Add to cart
            {inCart > 0 && (
              <span className="sr-only">, {inCart} already in cart</span>
            )}
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-label={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
            className="bg-background/90 shadow-md backdrop-blur hover:bg-background"
          >
            <Eye aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {product.category} · {product.colors}
        </p>
        <h3 id={titleId} className="leading-snug font-semibold text-balance">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star
            className="size-4 fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
          <span className="font-medium text-foreground">
            {product.rating.toFixed(1)}
          </span>
          <span className="sr-only">out of 5 stars,</span>
          <span aria-hidden="true">
            ({product.reviews.toLocaleString("en-US")})
          </span>
          <span className="sr-only">
            {product.reviews.toLocaleString("en-US")} reviews
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-semibold tabular-nums">
            {currency.format(product.price)}
          </span>
          {product.compareAt && (
            <>
              <span className="sr-only">Original price</span>
              <s className="text-sm text-muted-foreground tabular-nums">
                {currency.format(product.compareAt)}
              </s>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton card                                                              */
/* -------------------------------------------------------------------------- */

function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-6 w-1/4" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<"All" | Category>("All");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(["p5"]),
  );
  const [cart, setCart] = React.useState<Readonly<Record<string, number>>>({});

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Show the skeleton for a short, simulated fetch. */
  const simulateLoad = React.useCallback((ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), ms);
  }, []);

  React.useEffect(() => {
    simulateLoad(1600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [simulateLoad]);

  const visible = React.useMemo(() => {
    const list =
      category === "All"
        ? [...PRODUCTS]
        : PRODUCTS.filter((p) => p.category === category);
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
  }, [category, sort]);

  const cartCount = Object.values(cart).reduce((sum, n) => sum + n, 0);

  const handleCategory = (next: "All" | Category) => {
    if (next === category) return;
    setCategory(next);
    simulateLoad(600);
  };

  const handleSort = (next: string) => {
    setSort(next as SortKey);
    simulateLoad(500);
  };

  const toggleWishlist = (p: Product) => {
    const has = wishlist.has(p.id);
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
    toast(has ? "Removed from wishlist" : "Saved to wishlist", {
      description: p.name,
    });
  };

  const addToCart = (p: Product) => {
    setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }));
    toast.success("Added to cart", {
      description: `${p.name} · ${currency.format(p.price)}`,
    });
  };

  const quickView = (p: Product) => {
    toast(p.name, {
      description: `${p.category} · ${p.colors} · rated ${p.rating.toFixed(1)} by ${p.reviews.toLocaleString("en-US")} customers.`,
    });
  };

  const resetFilters = () => {
    setCategory("All");
    setSort("featured");
    simulateLoad(500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
            Northfield Supply
          </div>
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            <span>
              Cart:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {cartCount}
              </span>{" "}
              {cartCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Spring collection
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Everyday gear, built to last
          </h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            Thoughtfully made audio, desk and home essentials with free
            returns for 30 days.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filter by category"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
          >
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                type="button"
                size="sm"
                variant={category === c ? "default" : "outline"}
                aria-pressed={category === c}
                onClick={() => handleCategory(c)}
                className="rounded-full"
              >
                {c}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p
              className="text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {loading
                ? "Loading products…"
                : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
            </p>
            <Select value={sort} onValueChange={handleSort}>
              <SelectTrigger size="sm" className="w-[11.5rem]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <section aria-label="Products" aria-busy={loading}>
          {loading ? (
            <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: Math.max(4, Math.min(visible.length, 8)) }).map(
                (_, i) => (
                  <ProductCardSkeleton key={i} />
                ),
              )}
            </div>
          ) : visible.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <li key={p.id} className="flex">
                  <div className="flex w-full">
                    <ProductCard
                      product={p}
                      wishlisted={wishlist.has(p.id)}
                      inCart={cart[p.id] ?? 0}
                      onToggleWishlist={toggleWishlist}
                      onAddToCart={addToCart}
                      onQuickView={quickView}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <p className="font-medium">No products match this filter</p>
              <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw aria-hidden="true" />
                Reset filters
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
```