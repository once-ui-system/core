"use client";

import * as React from "react";
import {
  Check,
  Heart,
  PackageSearch,
  RotateCcw,
  ShoppingBag,
  Star,
  Eye,
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
import { cn } from "@/lib/utils";

type Category = "Footwear" | "Bags" | "Home" | "Tech" | "Apparel";
type TagKind = "New" | "Sale" | "Bestseller" | "Low stock";
type Shape = "sneaker" | "bag" | "mug" | "headphones" | "jacket" | "lamp" | "bottle" | "watch";

type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: TagKind;
  shape: Shape;
  /** [background from, background to, object color, accent color] */
  palette: [string, string, string, string];
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Stride Runner 2.0",
    category: "Footwear",
    price: 128,
    rating: 4.7,
    reviews: 412,
    tag: "Bestseller",
    shape: "sneaker",
    palette: ["#fde8d7", "#f9c9a6", "#1f2937", "#f97316"],
  },
  {
    id: "p2",
    name: "Harbor Weekender Bag",
    category: "Bags",
    price: 94,
    compareAt: 129,
    rating: 4.5,
    reviews: 218,
    tag: "Sale",
    shape: "bag",
    palette: ["#e3ecdf", "#c3d6bb", "#3f5d45", "#d6b370"],
  },
  {
    id: "p3",
    name: "Stoneware Pour-Over Mug",
    category: "Home",
    price: 28,
    rating: 4.8,
    reviews: 903,
    shape: "mug",
    palette: ["#ece7f4", "#d4cbe6", "#6b5b95", "#f5f1fa"],
  },
  {
    id: "p4",
    name: "Aria Wireless Headphones",
    category: "Tech",
    price: 189,
    rating: 4.6,
    reviews: 1284,
    tag: "New",
    shape: "headphones",
    palette: ["#dcebf7", "#b5d3ee", "#1e3a5f", "#60a5fa"],
  },
  {
    id: "p5",
    name: "Alpine Shell Jacket",
    category: "Apparel",
    price: 149,
    compareAt: 199,
    rating: 4.4,
    reviews: 156,
    tag: "Sale",
    shape: "jacket",
    palette: ["#f7dede", "#eebcbc", "#9b2c2c", "#fbd5d5"],
  },
  {
    id: "p6",
    name: "Glow Desk Lamp",
    category: "Home",
    price: 64,
    rating: 4.3,
    reviews: 87,
    tag: "Low stock",
    shape: "lamp",
    palette: ["#fbf3d0", "#f5e08e", "#4b4b4b", "#f59e0b"],
  },
  {
    id: "p7",
    name: "Summit Insulated Bottle",
    category: "Home",
    price: 36,
    rating: 4.9,
    reviews: 2210,
    tag: "Bestseller",
    shape: "bottle",
    palette: ["#d9f0ee", "#a9ddd8", "#0f766e", "#ccfbf1"],
  },
  {
    id: "p8",
    name: "Meridian Field Watch",
    category: "Tech",
    price: 215,
    rating: 4.6,
    reviews: 340,
    tag: "New",
    shape: "watch",
    palette: ["#e7e5e4", "#d1cfcc", "#292524", "#a8a29e"],
  },
  {
    id: "p9",
    name: "Cloud Court Sneakers",
    category: "Footwear",
    price: 110,
    compareAt: 140,
    rating: 4.2,
    reviews: 531,
    tag: "Sale",
    shape: "sneaker",
    palette: ["#e0e7ff", "#c0cbfa", "#312e81", "#ffffff"],
  },
  {
    id: "p10",
    name: "Metro Commuter Backpack",
    category: "Bags",
    price: 82,
    rating: 4.5,
    reviews: 698,
    shape: "bag",
    palette: ["#e5e7eb", "#cbd0d8", "#111827", "#9ca3af"],
  },
  {
    id: "p11",
    name: "Drift Studio Headphones",
    category: "Tech",
    price: 249,
    rating: 4.8,
    reviews: 129,
    tag: "Low stock",
    shape: "headphones",
    palette: ["#fce7f3", "#f9c4e0", "#831843", "#f472b6"],
  },
  {
    id: "p12",
    name: "Trail Merino Crew",
    category: "Apparel",
    price: 72,
    rating: 4.7,
    reviews: 374,
    tag: "New",
    shape: "jacket",
    palette: ["#e8efe0", "#cfdcbd", "#4d5f2f", "#eef3e6"],
  },
];

const CATEGORIES: ("All" | Category)[] = ["All", "Footwear", "Bags", "Home", "Tech", "Apparel"];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const TAG_STYLES: Record<TagKind, string> = {
  New: "bg-emerald-600 text-white",
  Sale: "bg-rose-600 text-white",
  Bestseller: "bg-amber-500 text-amber-950",
  "Low stock": "bg-background text-foreground border-border",
};

/* ---------- Product illustration (inline SVG, no network) ---------- */

function ProductArt({ shape, palette }: { shape: Shape; palette: Product["palette"] }) {
  const [, , main, accent] = palette;
  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx="100" cy="168" rx="58" ry="7" fill="#000" opacity="0.12" />
      {shape === "sneaker" && (
        <g>
          <path
            d="M30 140 L30 112 C30 104 36 100 44 100 L66 100 C74 100 78 94 84 88 L96 76 C100 72 106 72 110 76 C122 92 138 100 160 106 C172 109 176 118 176 132 L176 140 Z"
            fill={main}
          />
          <path d="M28 140 H178 V150 C178 154 174 156 170 156 H36 C31 156 28 153 28 148 Z" fill="#fff" />
          <path d="M96 84 L128 104" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M88 94 L118 112" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M44 124 H72" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
      {shape === "bag" && (
        <g>
          <path
            d="M74 70 C74 46 126 46 126 70"
            fill="none"
            stroke={accent}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="44" y="66" width="112" height="94" rx="14" fill={main} />
          <rect x="44" y="66" width="112" height="28" rx="14" fill="#000" opacity="0.12" />
          <rect x="84" y="100" width="32" height="26" rx="5" fill={accent} />
          <circle cx="100" cy="113" r="3.5" fill={main} />
        </g>
      )}
      {shape === "mug" && (
        <g>
          <path
            d="M138 86 C168 82 168 128 134 126"
            fill="none"
            stroke={main}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path d="M44 74 H140 V132 C140 152 126 162 108 162 H76 C58 162 44 152 44 132 Z" fill={main} />
          <ellipse cx="92" cy="74" rx="48" ry="8" fill={accent} opacity="0.6" />
          <path d="M60 100 H124" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </g>
      )}
      {shape === "headphones" && (
        <g>
          <path
            d="M44 112 C44 50 156 50 156 112"
            fill="none"
            stroke={main}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <rect x="34" y="100" width="30" height="56" rx="14" fill={main} />
          <rect x="136" y="100" width="30" height="56" rx="14" fill={main} />
          <rect x="40" y="112" width="12" height="32" rx="6" fill={accent} />
          <rect x="148" y="112" width="12" height="32" rx="6" fill={accent} />
        </g>
      )}
      {shape === "jacket" && (
        <g>
          <path
            d="M70 56 L100 70 L130 56 L172 78 L160 120 L140 112 V160 H60 V112 L40 120 L28 78 Z"
            fill={main}
          />
          <path d="M70 56 L100 70 L130 56 L120 48 H80 Z" fill={accent} opacity="0.5" />
          <path d="M100 70 V160" stroke={accent} strokeWidth="4" />
          <rect x="68" y="128" width="20" height="5" rx="2.5" fill={accent} opacity="0.7" />
          <rect x="112" y="128" width="20" height="5" rx="2.5" fill={accent} opacity="0.7" />
        </g>
      )}
      {shape === "lamp" && (
        <g>
          <path d="M62 84 L86 40 H126 L146 84 Z" fill={accent} />
          <path d="M104 84 V150" stroke={main} strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="104" cy="156" rx="34" ry="8" fill={main} />
          <ellipse cx="104" cy="86" rx="42" ry="6" fill="#fff" opacity="0.5" />
        </g>
      )}
      {shape === "bottle" && (
        <g>
          <rect x="88" y="34" width="34" height="18" rx="6" fill={accent} />
          <rect x="92" y="50" width="26" height="14" fill={main} opacity="0.8" />
          <rect x="72" y="62" width="66" height="100" rx="20" fill={main} />
          <rect x="72" y="96" width="66" height="22" fill={accent} opacity="0.75" />
          <rect x="82" y="70" width="6" height="84" rx="3" fill="#fff" opacity="0.25" />
        </g>
      )}
      {shape === "watch" && (
        <g>
          <rect x="82" y="22" width="36" height="46" rx="8" fill={accent} />
          <rect x="82" y="132" width="36" height="46" rx="8" fill={accent} />
          <circle cx="100" cy="100" r="46" fill={main} />
          <circle cx="100" cy="100" r="37" fill="#f5f5f4" />
          <path d="M100 100 V74" stroke={main} strokeWidth="4" strokeLinecap="round" />
          <path d="M100 100 L118 110" stroke={main} strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="100" r="4" fill="#dc2626" />
        </g>
      )}
    </svg>
  );
}

/* ---------- Rating ---------- */

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      <span aria-hidden="true">({reviews.toLocaleString("en-US")})</span>
      <span className="sr-only">
        rated {value.toFixed(1)} out of 5 from {reviews.toLocaleString("en-US")} reviews
      </span>
    </div>
  );
}

/* ---------- Product card ---------- */

type ProductCardProps = {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
};

function ProductCard({
  product,
  wished,
  inCart,
  onToggleWish,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const { name, price, compareAt, tag, category, palette, shape, rating, reviews } = product;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <li className="list-none">
      <Card className="group/card h-full gap-0 overflow-hidden py-0 transition-shadow focus-within:shadow-md hover:shadow-md">
        <div
          className="relative aspect-[4/3] overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
          }}
        >
          <div className="absolute inset-0 p-6 transition-transform duration-300 ease-out group-hover/card:scale-105 group-focus-within/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100 motion-reduce:group-focus-within/card:scale-100">
            <ProductArt shape={shape} palette={palette} />
          </div>

          {tag && (
            <Badge className={cn("absolute top-3 left-3 shadow-xs", TAG_STYLES[tag])}>
              {tag}
              {tag === "Sale" && discount > 0 ? ` -${discount}%` : ""}
            </Badge>
          )}

          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-pressed={wished}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            onClick={() => onToggleWish(product)}
            className="absolute top-3 right-3 rounded-full bg-background/90 shadow-xs backdrop-blur hover:bg-background"
          >
            <Heart
              className={cn("size-4", wished && "fill-rose-500 text-rose-500")}
              aria-hidden="true"
            />
          </Button>

          {/* Hover actions: always visible on touch devices, revealed on hover/focus on pointer devices */}
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-200 motion-reduce:transition-none",
              "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100",
              "[@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100"
            )}
          >
            <Button
              type="button"
              size="sm"
              className="flex-1 shadow-sm"
              onClick={() => onAddToCart(product)}
              aria-label={inCart ? `${name} is in your cart, add another` : `Add ${name} to cart`}
            >
              {inCart ? (
                <Check aria-hidden="true" />
              ) : (
                <ShoppingBag aria-hidden="true" />
              )}
              {inCart ? "Added" : "Add to cart"}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="bg-background/90 shadow-sm backdrop-blur hover:bg-background"
              aria-label={`Quick view ${name}`}
              onClick={() => onQuickView(product)}
            >
              <Eye aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {category}
          </p>
          <h3 className="text-sm leading-snug font-semibold text-balance sm:text-base">{name}</h3>
          <Rating value={rating} reviews={reviews} />
          <p className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-lg font-semibold tabular-nums">
              {priceFormatter.format(price)}
            </span>
            {compareAt && (
              <>
                <span className="text-sm text-muted-foreground tabular-nums line-through" aria-hidden="true">
                  {priceFormatter.format(compareAt)}
                </span>
                <span className="sr-only">
                  was {priceFormatter.format(compareAt)}
                </span>
              </>
            )}
          </p>
        </div>
      </Card>
    </li>
  );
}

/* ---------- Skeleton card ---------- */

function ProductCardSkeleton() {
  return (
    <li className="list-none" aria-hidden="true">
      <Card className="h-full gap-0 overflow-hidden py-0">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <div className="flex flex-col gap-2.5 p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-2 h-6 w-20" />
        </div>
      </Card>
    </li>
  );
}

/* ---------- Page ---------- */

export default function Page() {
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<"All" | Category>("All");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = React.useState<Readonly<Record<string, number>>>({});

  React.useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = React.useMemo(() => {
    const filtered =
      category === "All" ? [...PRODUCTS] : PRODUCTS.filter((p) => p.category === category);
    switch (sort) {
      case "price-asc":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-desc":
        return filtered.sort((a, b) => b.price - a.price);
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [category, sort]);

  const cartCount = Object.values(cart).reduce((sum, n) => sum + n, 0);

  const handleToggleWish = React.useCallback((p: Product) => {
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

  const handleAddToCart = React.useCallback((p: Product) => {
    setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }));
    toast.success(`${p.name} added to your cart`, {
      description: priceFormatter.format(p.price),
    });
  }, []);

  const handleQuickView = React.useCallback((p: Product) => {
    toast(p.name, {
      description: `${p.category} · ${priceFormatter.format(p.price)} · ${p.rating.toFixed(1)} stars from ${p.reviews.toLocaleString("en-US")} reviews`,
    });
  }, []);

  const reload = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1200);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">Spring collection</p>
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Everyday gear, built to last
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-8 gap-1.5 px-3 text-sm" role="status">
              <ShoppingBag aria-hidden="true" />
              <span>
                Cart: <span className="tabular-nums">{cartCount}</span>
                <span className="sr-only"> {cartCount === 1 ? "item" : "items"}</span>
              </span>
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reload}
              disabled={loading}
              aria-label="Reload products to preview the loading state"
            >
              <RotateCcw aria-hidden="true" className={cn(loading && "animate-spin")} />
              Reload
            </Button>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-4 sm:mt-8 md:flex-row md:items-center md:justify-between">
          <div
            role="group"
            aria-label="Filter by category"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
          >
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => setCategory(c)}
                  className="rounded-full"
                >
                  {c}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-trigger" className="text-sm whitespace-nowrap text-muted-foreground">
              Sort by
            </label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger id="sort-trigger" size="sm" className="w-44">
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
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {loading
            ? "Loading products…"
            : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </p>

        <section aria-label="Products" aria-busy={loading} className="mt-3">
          {loading ? (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ul>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">No products match this filter</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setCategory("All")}>
                Show all products
              </Button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wished={wishlist.has(p.id)}
                  inCart={(cart[p.id] ?? 0) > 0}
                  onToggleWish={handleToggleWish}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
