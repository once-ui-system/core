```tsx
"use client";

import * as React from "react";
import {
  Eye,
  Heart,
  PackageSearch,
  RotateCw,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Category = "Audio" | "Home" | "Wearables" | "Desk";
type Shape = "headphones" | "lamp" | "watch" | "bottle" | "speaker" | "keyboard" | "mug" | "plant";
type Tag = "New" | "Sale" | "Best seller" | "Low stock";

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
  /** CSS gradient colors for the image backdrop */
  from: string;
  to: string;
  ink: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Halo Wireless Headphones",
    category: "Audio",
    price: 189,
    compareAt: 239,
    rating: 4.7,
    reviews: 1284,
    tag: "Sale",
    shape: "headphones",
    from: "#fde8d7",
    to: "#f9c8a4",
    ink: "#7c2d12",
  },
  {
    id: "p2",
    name: "Arc Adjustable Desk Lamp",
    category: "Desk",
    price: 74,
    rating: 4.5,
    reviews: 612,
    tag: "New",
    shape: "lamp",
    from: "#fef3c7",
    to: "#fcd979",
    ink: "#78350f",
  },
  {
    id: "p3",
    name: "Meridian Smartwatch S2",
    category: "Wearables",
    price: 299,
    rating: 4.6,
    reviews: 903,
    tag: "Best seller",
    shape: "watch",
    from: "#dbeafe",
    to: "#a9c8f5",
    ink: "#1e3a8a",
  },
  {
    id: "p4",
    name: "Terra Insulated Bottle 750ml",
    category: "Home",
    price: 32,
    rating: 4.8,
    reviews: 2210,
    shape: "bottle",
    from: "#dcfce7",
    to: "#a7e3bd",
    ink: "#14532d",
  },
  {
    id: "p5",
    name: "Pebble Bluetooth Speaker",
    category: "Audio",
    price: 59,
    compareAt: 79,
    rating: 4.3,
    reviews: 458,
    tag: "Sale",
    shape: "speaker",
    from: "#ede9fe",
    to: "#c9bdf7",
    ink: "#4c1d95",
  },
  {
    id: "p6",
    name: "Lattice 75% Mechanical Keyboard",
    category: "Desk",
    price: 129,
    rating: 4.9,
    reviews: 377,
    tag: "Low stock",
    shape: "keyboard",
    from: "#e2e8f0",
    to: "#b8c4d6",
    ink: "#0f172a",
  },
  {
    id: "p7",
    name: "Kiln Stoneware Mug Set (4)",
    category: "Home",
    price: 46,
    rating: 4.6,
    reviews: 189,
    tag: "New",
    shape: "mug",
    from: "#ffe4e6",
    to: "#f8b4bd",
    ink: "#881337",
  },
  {
    id: "p8",
    name: "Fern Self-Watering Planter",
    category: "Home",
    price: 38,
    rating: 4.4,
    reviews: 264,
    shape: "plant",
    from: "#ecfccb",
    to: "#c3e58a",
    ink: "#365314",
  },
];

const CATEGORIES: Array<"All" | Category> = ["All", "Audio", "Desk", "Home", "Wearables"];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

const TAG_STYLES: Record<Tag, string> = {
  New: "bg-emerald-600 text-white",
  Sale: "bg-rose-600 text-white",
  "Best seller": "bg-amber-500 text-amber-950",
  "Low stock": "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
/* Illustrations (inline SVG, no network)                              */
/* ------------------------------------------------------------------ */

function ProductArt({ shape, ink }: { shape: Shape; ink: string }) {
  const common = {
    fill: "none",
    stroke: ink,
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-3/5 w-3/5 transition-transform duration-500 ease-out group-hover/product:scale-110 motion-reduce:transition-none"
      aria-hidden="true"
      focusable="false"
    >
      {shape === "headphones" && (
        <g {...common}>
          <path d="M26 74V62a34 34 0 0 1 68 0v12" />
          <rect x="18" y="70" width="18" height="28" rx="8" fill={ink} fillOpacity="0.18" />
          <rect x="84" y="70" width="18" height="28" rx="8" fill={ink} fillOpacity="0.18" />
        </g>
      )}
      {shape === "lamp" && (
        <g {...common}>
          <path d="M34 100h36" />
          <path d="M52 100V64l22-26" />
          <path d="M62 30l26 14-10 18-26-14z" fill={ink} fillOpacity="0.18" />
          <circle cx="52" cy="64" r="3" fill={ink} />
        </g>
      )}
      {shape === "watch" && (
        <g {...common}>
          <path d="M45 30l4-14h22l4 14" />
          <path d="M45 90l4 14h22l4-14" />
          <rect x="36" y="30" width="48" height="60" rx="14" fill={ink} fillOpacity="0.14" />
          <path d="M60 46v14l10 6" />
        </g>
      )}
      {shape === "bottle" && (
        <g {...common}>
          <rect x="50" y="14" width="20" height="12" rx="4" fill={ink} fillOpacity="0.3" />
          <path d="M52 26v8c-10 6-14 12-14 22v42a8 8 0 0 0 8 8h28a8 8 0 0 0 8-8V56c0-10-4-16-14-22v-8" />
          <path d="M38 66h44" />
        </g>
      )}
      {shape === "speaker" && (
        <g {...common}>
          <rect x="20" y="34" width="80" height="56" rx="26" fill={ink} fillOpacity="0.14" />
          <circle cx="60" cy="62" r="14" />
          <circle cx="60" cy="62" r="4" fill={ink} />
          <path d="M96 22c6 4 10 10 12 18" />
        </g>
      )}
      {shape === "keyboard" && (
        <g {...common}>
          <rect x="12" y="34" width="96" height="54" rx="10" fill={ink} fillOpacity="0.14" />
          <path d="M26 50h4M40 50h4M54 50h4M68 50h4M82 50h4" />
          <path d="M26 62h4M40 62h4M54 62h4M68 62h4M82 62h4" />
          <path d="M34 76h52" />
        </g>
      )}
      {shape === "mug" && (
        <g {...common}>
          <path d="M28 40h54v34a20 20 0 0 1-20 20H48a20 20 0 0 1-20-20z" fill={ink} fillOpacity="0.14" />
          <path d="M82 50h6a10 10 0 0 1 0 20h-6" />
          <path d="M44 22c-4 4 4 6 0 12M60 22c-4 4 4 6 0 12" />
        </g>
      )}
      {shape === "plant" && (
        <g {...common}>
          <path d="M40 74h40l-5 26a6 6 0 0 1-6 5H51a6 6 0 0 1-6-5z" fill={ink} fillOpacity="0.18" />
          <path d="M60 74V44" />
          <path d="M60 58c-14 0-22-8-22-20 14 0 22 8 22 20z" />
          <path d="M60 50c0-14 8-22 22-22 0 14-8 22-22 22z" />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      <span className="sr-only">out of 5 stars,</span>
      <span>({reviews.toLocaleString("en-US")}<span className="sr-only"> reviews</span>)</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onAdd: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({ product, wished, onToggleWish, onAdd, onQuickView }: ProductCardProps) {
  const titleId = `${product.id}-title`;
  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : null;

  return (
    <li className="list-none">
      <Card
        className="group/product h-full gap-0 overflow-hidden py-0 transition-shadow duration-300 hover:shadow-lg focus-within:shadow-lg"
        aria-labelledby={titleId}
        role="group"
      >
        {/* Image area */}
        <div
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
          style={{ backgroundImage: `linear-gradient(145deg, ${product.from}, ${product.to})` }}
        >
          <ProductArt shape={product.shape} ink={product.ink} />

          {product.tag && (
            <Badge
              className={cn(
                "absolute top-3 left-3 border-0 shadow-sm",
                TAG_STYLES[product.tag],
              )}
            >
              {product.tag}
            </Badge>
          )}

          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-3 right-3 rounded-full bg-white/90 text-zinc-900 shadow-sm hover:bg-white dark:bg-white/90 dark:hover:bg-white"
            aria-pressed={wished}
            aria-label={`${wished ? "Remove" : "Add"} ${product.name} ${wished ? "from" : "to"} wishlist`}
            onClick={() => onToggleWish(product)}
          >
            <Heart
              className={cn(
                "transition-colors",
                wished && "fill-rose-500 text-rose-500",
              )}
              aria-hidden="true"
            />
          </Button>

          {/* Hover actions: visible on hover/focus on pointer devices, always on touch */}
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 flex gap-2",
              "transition-all duration-300 motion-reduce:transition-none",
              "[@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover/product:translate-y-0 [@media(hover:hover)]:group-hover/product:opacity-100",
              "[@media(hover:hover)]:group-focus-within/product:translate-y-0 [@media(hover:hover)]:group-focus-within/product:opacity-100",
            )}
          >
            <Button
              type="button"
              size="sm"
              className="flex-1 shadow-md"
              onClick={() => onAdd(product)}
            >
              <ShoppingBag aria-hidden="true" />
              Add to cart
              <span className="sr-only">: {product.name}</span>
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="bg-white/95 text-zinc-900 shadow-md hover:bg-white dark:bg-white/95 dark:hover:bg-white"
              aria-label={`Quick view ${product.name}`}
              onClick={() => onQuickView(product)}
            >
              <Eye aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {product.category}
          </p>
          <h3 id={titleId} className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold sm:text-base sm:leading-5">
            {product.name}
          </h3>
          <Stars rating={product.rating} reviews={product.reviews} />
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
            <span className="text-lg font-bold tabular-nums">{currency.format(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-sm text-muted-foreground tabular-nums line-through">
                  <span className="sr-only">Original price </span>
                  {currency.format(product.compareAt)}
                </span>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  −{discount}%
                </span>
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
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-1 h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-20" />
        </div>
      </Card>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const LOAD_DELAY_MS = 1600;

export default function Page() {
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<"All" | Category>("All");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), LOAD_DELAY_MS);
  }, []);

  React.useEffect(() => {
    startLoading();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startLoading]);

  const visible = React.useMemo(() => {
    const list = PRODUCTS.filter((p) => category === "All" || p.category === category);
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
  }, [category, sort]);

  const handleToggleWish = React.useCallback((product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        toast(`Removed from wishlist`, { description: product.name });
      } else {
        next.add(product.id);
        toast.success(`Saved to wishlist`, { description: product.name });
      }
      return next;
    });
  }, []);

  const handleAdd = React.useCallback((product: Product) => {
    setCartCount((c) => c + 1);
    toast.success("Added to cart", {
      description: `${product.name} · ${currency.format(product.price)}`,
    });
  }, []);

  const handleQuickView = React.useCallback((product: Product) => {
    toast(product.name, {
      description: `${product.rating.toFixed(1)} stars from ${product.reviews.toLocaleString("en-US")} reviews. Quick view is a demo action.`,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-base font-bold tracking-tight">Fieldwork Goods</span>
          <div
            className="flex items-center gap-2 text-sm"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span className="font-medium tabular-nums">{cartCount}</span>
            <span className="sr-only">{cartCount === 1 ? "item" : "items"} in cart</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shop everyday essentials</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Considered gear for your desk, your home and your commute.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ToggleGroup
              type="single"
              variant="outline"
              value={category}
              onValueChange={(v) => {
                if (v) setCategory(v as "All" | Category);
              }}
              aria-label="Filter by category"
              className="w-max"
            >
              {CATEGORIES.map((c) => (
                <ToggleGroupItem key={c} value={c} aria-label={`${c} products`}>
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-full sm:w-52" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_LABELS[key]}
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
              <RotateCw className={cn(loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />
              <span className="hidden sm:inline">Reload</span>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground" role="status" aria-live="polite">
          {loading
            ? "Loading products…"
            : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </p>

        {/* Grid */}
        <section aria-label="Products" aria-busy={loading} className="mt-4">
          {loading ? (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ul>
          ) : visible.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wished={wishlist.has(product.id)}
                  onToggleWish={handleToggleWish}
                  onAdd={handleAdd}
                  onQuickView={handleQuickView}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No products match this filter.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setCategory("All")}>
                <Plus className="size-4" aria-hidden="true" />
                Show all products
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
```