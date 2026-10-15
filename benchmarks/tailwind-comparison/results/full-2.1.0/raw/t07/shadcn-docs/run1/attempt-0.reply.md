```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  Heart,
  RefreshCw,
  ShoppingBag,
  Star,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Category = "Lighting" | "Ceramics" | "Textiles" | "Desk" | "Kitchen";
type Shape = "lamp" | "vase" | "throw" | "tray" | "mug" | "board" | "pot" | "clock";
type Tag = "New" | "Bestseller" | "Sale" | "Low stock";

interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  shape: Shape;
  /** Tailwind gradient classes for the image backdrop */
  bg: string;
  /** Tailwind text colour class used by the SVG artwork (currentColor) */
  ink: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Arc Table Lamp",
    category: "Lighting",
    price: 89,
    rating: 4.8,
    reviews: 214,
    tag: "Bestseller",
    shape: "lamp",
    bg: "from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-900",
    ink: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "p2",
    name: "Stoneware Bud Vase",
    category: "Ceramics",
    price: 34,
    rating: 4.6,
    reviews: 98,
    tag: "New",
    shape: "vase",
    bg: "from-stone-100 to-stone-300 dark:from-stone-900 dark:to-stone-700",
    ink: "text-stone-600 dark:text-stone-300",
  },
  {
    id: "p3",
    name: "Waffle Knit Throw",
    category: "Textiles",
    price: 62,
    compareAt: 84,
    rating: 4.7,
    reviews: 341,
    tag: "Sale",
    shape: "throw",
    bg: "from-sky-100 to-blue-200 dark:from-sky-950 dark:to-blue-900",
    ink: "text-sky-700 dark:text-sky-300",
  },
  {
    id: "p4",
    name: "Walnut Desk Tray",
    category: "Desk",
    price: 48,
    rating: 4.5,
    reviews: 77,
    shape: "tray",
    bg: "from-orange-100 to-amber-300 dark:from-orange-950 dark:to-amber-800",
    ink: "text-orange-800 dark:text-orange-300",
  },
  {
    id: "p5",
    name: "Speckled Pour-Over Mug",
    category: "Kitchen",
    price: 26,
    rating: 4.9,
    reviews: 512,
    tag: "Bestseller",
    shape: "mug",
    bg: "from-rose-100 to-pink-200 dark:from-rose-950 dark:to-pink-900",
    ink: "text-rose-700 dark:text-rose-300",
  },
  {
    id: "p6",
    name: "Oak Serving Board",
    category: "Kitchen",
    price: 54,
    rating: 4.4,
    reviews: 63,
    tag: "Low stock",
    shape: "board",
    bg: "from-yellow-100 to-amber-200 dark:from-yellow-950 dark:to-amber-900",
    ink: "text-yellow-800 dark:text-yellow-300",
  },
  {
    id: "p7",
    name: "Glazed Planter, Medium",
    category: "Ceramics",
    price: 41,
    compareAt: 52,
    rating: 4.3,
    reviews: 129,
    tag: "Sale",
    shape: "pot",
    bg: "from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900",
    ink: "text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "p8",
    name: "Brass Desk Clock",
    category: "Desk",
    price: 72,
    rating: 4.6,
    reviews: 88,
    tag: "New",
    shape: "clock",
    bg: "from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-700",
    ink: "text-zinc-700 dark:text-zinc-300",
  },
];

const FILTERS: Array<"All" | Category> = [
  "All",
  "Lighting",
  "Ceramics",
  "Textiles",
  "Desk",
  "Kitchen",
];

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
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const TAG_STYLES: Record<Tag, string> = {
  New: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950",
  Bestseller: "bg-foreground text-background",
  Sale: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
  "Low stock":
    "bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950",
};

/** Simple inline SVG artwork so no network image is needed. */
function ProductArt({ shape, className }: { shape: Shape; className?: string }) {
  const common = {
    viewBox: "0 0 120 120",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
    focusable: false,
  };
  switch (shape) {
    case "lamp":
      return (
        <svg {...common}>
          <path d="M40 58 L52 24 H68 L80 58 Z" fill="currentColor" fillOpacity="0.18" />
          <path d="M60 58 V92" />
          <ellipse cx="60" cy="98" rx="20" ry="5" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case "vase":
      return (
        <svg {...common}>
          <path d="M52 20 H68 M54 20 C54 38 38 44 38 70 C38 90 48 100 60 100 C72 100 82 90 82 70 C82 44 66 38 66 20" fill="currentColor" fillOpacity="0.18" />
          <path d="M60 20 C58 10 66 6 70 4" />
        </svg>
      );
    case "throw":
      return (
        <svg {...common}>
          <rect x="22" y="30" width="76" height="60" rx="6" fill="currentColor" fillOpacity="0.15" />
          <path d="M22 46 H98 M22 62 H98 M22 78 H98 M42 30 V90 M62 30 V90 M82 30 V90" strokeWidth="1.8" />
          <path d="M30 90 V102 M42 90 V102 M54 90 V102 M66 90 V102 M78 90 V102 M90 90 V102" strokeWidth="2" />
        </svg>
      );
    case "tray":
      return (
        <svg {...common}>
          <path d="M20 54 H100 L92 90 H28 Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M30 62 H90" strokeWidth="1.8" />
          <rect x="46" y="38" width="28" height="10" rx="2" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "mug":
      return (
        <svg {...common}>
          <path d="M34 40 H80 V80 C80 92 72 98 62 98 H52 C42 98 34 92 34 80 Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M80 50 H88 C96 50 96 74 88 74 H80" />
          <path d="M48 28 C46 22 52 20 50 14 M62 28 C60 22 66 20 64 14" strokeWidth="2" />
        </svg>
      );
    case "board":
      return (
        <svg {...common}>
          <rect x="22" y="42" width="62" height="44" rx="8" fill="currentColor" fillOpacity="0.2" />
          <circle cx="92" cy="64" r="6" />
          <path d="M34 56 H72 M34 68 H62" strokeWidth="1.8" />
        </svg>
      );
    case "pot":
      return (
        <svg {...common}>
          <path d="M34 58 H86 L80 96 H40 Z" fill="currentColor" fillOpacity="0.22" />
          <path d="M30 58 H90" />
          <path d="M60 58 C60 40 48 34 40 30 M60 58 C60 38 72 30 82 28 M60 58 V26" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="60" cy="58" r="32" fill="currentColor" fillOpacity="0.15" />
          <path d="M60 58 V38 M60 58 L74 66" />
          <path d="M44 98 L50 88 M76 98 L70 88" />
        </svg>
      );
  }
}

function RatingStars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      <span aria-hidden="true">({reviews})</span>
      <span className="sr-only">{`rated ${rating.toFixed(1)} out of 5 from ${reviews} reviews`}</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: (p: Product) => void;
  onAdd: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

function ProductCard({
  product,
  wished,
  inCart,
  onToggleWish,
  onAdd,
  onQuickView,
}: ProductCardProps) {
  const { name, price, compareAt, tag, category, shape, bg, ink, rating, reviews } = product;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <li className="list-none">
      <Card className="group/product h-full gap-0 overflow-hidden py-0 transition-shadow focus-within:shadow-md hover:shadow-md">
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden bg-gradient-to-br",
            bg,
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center p-10 transition-transform duration-500 ease-out group-hover/product:scale-105 group-focus-within/product:scale-105 motion-reduce:transition-none">
            <ProductArt shape={shape} className={cn("size-full max-w-[200px]", ink)} />
          </div>

          {tag && (
            <Badge
              className={cn(
                "absolute top-3 left-3 border-transparent shadow-sm",
                TAG_STYLES[tag],
              )}
            >
              {tag === "Sale" && discount > 0 ? `Sale −${discount}%` : tag}
            </Badge>
          )}

          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-pressed={wished}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            onClick={() => onToggleWish(product)}
            className="absolute top-3 right-3 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
          >
            <Heart
              className={cn(
                "transition-colors",
                wished && "fill-red-500 text-red-500",
              )}
              aria-hidden="true"
            />
          </Button>

          {/* Hover actions: always visible on touch devices, revealed on hover/focus for pointer devices */}
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-200 motion-reduce:transition-none",
              "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover/product:translate-y-0 [@media(hover:hover)]:group-hover/product:opacity-100",
              "[@media(hover:hover)]:group-focus-within/product:translate-y-0 [@media(hover:hover)]:group-focus-within/product:opacity-100",
            )}
          >
            <Button
              type="button"
              size="sm"
              className="flex-1 shadow-sm"
              onClick={() => onAdd(product)}
              aria-label={`Add ${name} to cart`}
            >
              {inCart ? <Check aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
              {inCart ? "Added" : "Add to cart"}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="bg-background/90 shadow-sm backdrop-blur hover:bg-background"
              onClick={() => onQuickView(product)}
              aria-label={`Quick view ${name}`}
            >
              <Eye aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">{category}</p>
          <h3 className="leading-snug font-semibold text-balance">{name}</h3>
          <RatingStars rating={rating} reviews={reviews} />
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-lg font-semibold tabular-nums">{currency.format(price)}</span>
            {compareAt && (
              <>
                <span className="text-sm text-muted-foreground tabular-nums line-through" aria-hidden="true">
                  {currency.format(compareAt)}
                </span>
                <span className="sr-only">{`was ${currency.format(compareAt)}`}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}

function ProductCardSkeleton() {
  return (
    <li className="list-none" aria-hidden="true">
      <Card className="h-full gap-0 overflow-hidden py-0">
        <Skeleton className="aspect-[4/5] w-full rounded-none" />
        <div className="flex flex-col gap-2.5 p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-2 h-6 w-20" />
        </div>
      </Card>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<ReadonlySet<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), 1800);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), 1800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const visible = useMemo(() => {
    const list = PRODUCTS.filter((p) => filter === "All" || p.category === filter);
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [filter, sort]);

  const toggleWish = useCallback((p: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) {
        next.delete(p.id);
        toast(`Removed ${p.name} from your wishlist`);
      } else {
        next.add(p.id);
        toast.success(`Saved ${p.name} to your wishlist`);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      if (prev.has(p.id)) {
        toast(`${p.name} is already in your cart`);
        return prev;
      }
      const next = new Set(prev);
      next.add(p.id);
      toast.success(`Added ${p.name} to your cart`);
      return next;
    });
  }, []);

  const quickView = useCallback((p: Product) => {
    toast(p.name, {
      description: `${p.category} · ${currency.format(p.price)} · ${p.rating.toFixed(1)} stars from ${p.reviews} reviews`,
    });
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Spring collection</p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Objects for a calmer home
            </h1>
            <p className="max-w-xl text-muted-foreground text-pretty">
              Small-batch ceramics, warm lighting and everyday pieces made to be used, not just
              looked at.
            </p>
          </div>
          <div className="flex items-center gap-2" aria-label="Cart and wishlist summary">
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-sm">
              <Heart aria-hidden="true" />
              <span className="tabular-nums">{wishlist.size}</span>
              <span className="sr-only">saved items</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-sm">
              <ShoppingBag aria-hidden="true" />
              <span className="tabular-nums">{cart.size}</span>
              <span className="sr-only">items in cart</span>
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(v) => {
                if (v) setFilter(v as "All" | Category);
              }}
              variant="outline"
              spacing={2}
              aria-label="Filter by category"
              className="w-max"
            >
              {FILTERS.map((f) => (
                <ToggleGroupItem
                  key={f}
                  value={f}
                  className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {f}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-full sm:w-[200px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SORT_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={startLoading}
              disabled={loading}
              aria-label="Reload products"
            >
              <RefreshCw className={cn(loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />
              <span className="hidden sm:inline">Reload</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="results-heading" aria-busy={loading}>
        <h2 id="results-heading" className="sr-only">
          Products
        </h2>
        <p className="mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">
          {loading
            ? "Loading products…"
            : `${visible.length} ${visible.length === 1 ? "product" : "products"}${
                filter === "All" ? "" : ` in ${filter}`
              }`}
        </p>

        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wished={wishlist.has(p.id)}
                  inCart={cart.has(p.id)}
                  onToggleWish={toggleWish}
                  onAdd={addToCart}
                  onQuickView={quickView}
                />
              ))}
        </ul>
      </section>
    </main>
  );
}
```