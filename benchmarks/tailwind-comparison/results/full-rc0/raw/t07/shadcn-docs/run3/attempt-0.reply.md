Writing the page now.

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  EyeIcon,
  HeartIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  StarIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Category = "Kitchen" | "Lighting" | "Bags" | "Desk";
type ArtKind = "mug" | "lamp" | "tote" | "bottle" | "notebook" | "bowl" | "backpack" | "speaker";
type Tag = "New" | "Sale" | "Bestseller" | "Low stock";

interface Product {
  id: string;
  name: string;
  maker: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  art: ArtKind;
  /** hue used to tint the illustrated backdrop */
  hue: number;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Stoneware Pour-Over Mug",
    maker: "Kiln & Co.",
    category: "Kitchen",
    price: 34,
    rating: 4.8,
    reviews: 214,
    tag: "Bestseller",
    art: "mug",
    hue: 28,
  },
  {
    id: "p2",
    name: "Arc Task Lamp",
    maker: "Northlight",
    category: "Lighting",
    price: 89,
    compareAt: 120,
    rating: 4.6,
    reviews: 98,
    tag: "Sale",
    art: "lamp",
    hue: 85,
  },
  {
    id: "p3",
    name: "Waxed Canvas Tote",
    maker: "Field Goods",
    category: "Bags",
    price: 58,
    rating: 4.7,
    reviews: 143,
    tag: "New",
    art: "tote",
    hue: 140,
  },
  {
    id: "p4",
    name: "Insulated Steel Bottle 750ml",
    maker: "Trailhead",
    category: "Kitchen",
    price: 42,
    rating: 4.9,
    reviews: 506,
    art: "bottle",
    hue: 215,
  },
  {
    id: "p5",
    name: "Linen Dot-Grid Notebook",
    maker: "Paper Mill Press",
    category: "Desk",
    price: 18,
    rating: 4.5,
    reviews: 77,
    tag: "Low stock",
    art: "notebook",
    hue: 12,
  },
  {
    id: "p6",
    name: "Hand-Glazed Serving Bowl",
    maker: "Kiln & Co.",
    category: "Kitchen",
    price: 64,
    compareAt: 78,
    rating: 4.8,
    reviews: 61,
    tag: "Sale",
    art: "bowl",
    hue: 190,
  },
  {
    id: "p7",
    name: "Commuter Roll-Top Backpack",
    maker: "Field Goods",
    category: "Bags",
    price: 148,
    rating: 4.7,
    reviews: 322,
    tag: "New",
    art: "backpack",
    hue: 250,
  },
  {
    id: "p8",
    name: "Bookshelf Bluetooth Speaker",
    maker: "Northlight",
    category: "Desk",
    price: 129,
    rating: 4.4,
    reviews: 189,
    art: "speaker",
    hue: 320,
  },
];

const CATEGORIES = ["All", "Kitchen", "Lighting", "Bags", "Desk"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

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

/* ------------------------------------------------------------------ */
/* Illustrations (inline SVG, no network)                              */
/* ------------------------------------------------------------------ */

function ProductArt({ kind, hue }: { kind: ArtKind; hue: number }): ReactElement {
  const body = `oklch(0.72 0.09 ${hue})`;
  const bodyDark = `oklch(0.52 0.09 ${hue})`;
  const light = `oklch(0.93 0.03 ${hue})`;
  const accent = `oklch(0.35 0.05 ${hue})`;

  let shapes: ReactElement;
  switch (kind) {
    case "mug":
      shapes = (
        <>
          <ellipse cx="100" cy="162" rx="58" ry="8" fill="black" opacity="0.12" />
          <path d="M56 70h88v70a22 22 0 0 1-22 22H78a22 22 0 0 1-22-22z" fill={body} />
          <path d="M144 88h10a16 16 0 0 1 0 32h-10" fill="none" stroke={bodyDark} strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="100" cy="70" rx="44" ry="8" fill={bodyDark} />
          <ellipse cx="100" cy="70" rx="36" ry="5" fill={accent} />
          <path d="M70 90v44" stroke={light} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        </>
      );
      break;
    case "lamp":
      shapes = (
        <>
          <ellipse cx="100" cy="166" rx="38" ry="6" fill="black" opacity="0.12" />
          <rect x="68" y="156" width="64" height="9" rx="4" fill={accent} />
          <path d="M100 156V96L138 52" fill="none" stroke={bodyDark} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="96" r="5" fill={accent} />
          <path d="M124 44l32 22-12 14z" fill={body} />
          <path d="M130 70l20 12" stroke={light} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </>
      );
      break;
    case "tote":
      shapes = (
        <>
          <ellipse cx="100" cy="168" rx="56" ry="6" fill="black" opacity="0.12" />
          <path d="M76 78V62a24 24 0 0 1 48 0v16" fill="none" stroke={bodyDark} strokeWidth="7" strokeLinecap="round" />
          <path d="M52 78h96l8 86H44z" fill={body} />
          <rect x="76" y="108" width="48" height="32" rx="4" fill={light} opacity="0.85" />
          <path d="M84 122h32M84 130h20" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </>
      );
      break;
    case "bottle":
      shapes = (
        <>
          <ellipse cx="100" cy="168" rx="30" ry="5" fill="black" opacity="0.12" />
          <rect x="88" y="34" width="24" height="16" rx="4" fill={accent} />
          <path d="M90 50h20v12c14 8 20 20 20 36v58a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8V98c0-16 6-28 20-36z" fill={body} />
          <rect x="70" y="112" width="60" height="26" fill={light} opacity="0.85" />
          <path d="M82 125h36" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <path d="M80 92v56" stroke={light} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </>
      );
      break;
    case "notebook":
      shapes = (
        <>
          <ellipse cx="100" cy="168" rx="50" ry="6" fill="black" opacity="0.12" />
          <rect x="56" y="30" width="88" height="132" rx="6" fill={body} />
          <rect x="56" y="30" width="12" height="132" rx="4" fill={bodyDark} />
          <rect x="80" y="54" width="48" height="34" rx="3" fill={light} opacity="0.9" />
          <path d="M88 66h32M88 76h20" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <path d="M120 30v40l7-6 7 6V30" fill={accent} />
        </>
      );
      break;
    case "bowl":
      shapes = (
        <>
          <ellipse cx="100" cy="158" rx="62" ry="8" fill="black" opacity="0.12" />
          <path d="M34 90h132a66 58 0 0 1-132 0z" fill={body} />
          <ellipse cx="100" cy="90" rx="66" ry="12" fill={bodyDark} />
          <ellipse cx="100" cy="90" rx="58" ry="8" fill={light} />
          <path d="M52 112a56 44 0 0 0 30 28" fill="none" stroke={light} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        </>
      );
      break;
    case "backpack":
      shapes = (
        <>
          <ellipse cx="100" cy="170" rx="50" ry="6" fill="black" opacity="0.12" />
          <path d="M82 44a18 18 0 0 1 36 0" fill="none" stroke={bodyDark} strokeWidth="6" strokeLinecap="round" />
          <rect x="54" y="44" width="92" height="120" rx="26" fill={body} />
          <rect x="70" y="100" width="60" height="42" rx="10" fill={bodyDark} />
          <path d="M70 114h60" stroke={light} strokeWidth="3" opacity="0.7" />
          <rect x="94" y="108" width="12" height="10" rx="2" fill={light} />
          <path d="M72 66h56" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        </>
      );
      break;
    case "speaker":
      shapes = (
        <>
          <ellipse cx="100" cy="158" rx="58" ry="6" fill="black" opacity="0.12" />
          <rect x="46" y="62" width="108" height="92" rx="14" fill={body} />
          <circle cx="100" cy="108" r="30" fill={accent} />
          <circle cx="100" cy="108" r="22" fill={bodyDark} />
          <circle cx="100" cy="108" r="8" fill={light} opacity="0.85" />
          <circle cx="62" cy="76" r="3" fill={light} />
          <circle cx="138" cy="76" r="3" fill={light} />
        </>
      );
      break;
  }

  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(100 100) scale(0.82) translate(-100 -100)">{shapes}</g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Rating                                                              */
/* ------------------------------------------------------------------ */

function Rating({ value, count }: { value: number; count: number }): ReactElement {
  return (
    <div
      className="flex items-center gap-1.5 text-xs text-muted-foreground"
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5 from ${count} reviews`}
    >
      <StarIcon className="size-3.5 fill-current text-foreground" aria-hidden="true" />
      <span className="font-medium text-foreground" aria-hidden="true">
        {value.toFixed(1)}
      </span>
      <span aria-hidden="true">({count})</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

interface ProductCardProps {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({
  product,
  wished,
  onToggleWish,
  onAddToCart,
  onQuickView,
}: ProductCardProps): ReactElement {
  const { name, maker, price, compareAt, tag, rating, reviews, art, hue } = product;
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const titleId = `${product.id}-title`;

  return (
    <li className="list-none">
      <Card
        aria-labelledby={titleId}
        role="group"
        className="group/card h-full gap-0 overflow-hidden py-0 transition-shadow focus-within:shadow-md hover:shadow-md"
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={{
            background: `linear-gradient(145deg, oklch(0.97 0.025 ${hue}), oklch(0.9 0.05 ${hue}))`,
          }}
        >
          <div className="size-full p-6 transition-transform duration-300 ease-out group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
            <ProductArt kind={art} hue={hue} />
          </div>

          {tag ? (
            <Badge
              variant={tag === "Sale" ? "destructive" : tag === "Low stock" ? "outline" : "secondary"}
              className={cn("absolute top-3 left-3 shadow-xs", tag === "Low stock" && "bg-background")}
            >
              {tag === "Sale" && discount > 0 ? `Sale · ${discount}% off` : tag}
            </Badge>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-3 right-3 rounded-full shadow-xs"
            aria-pressed={wished}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            onClick={() => onToggleWish(product)}
          >
            <HeartIcon className={cn(wished && "fill-destructive text-destructive")} />
          </Button>

          {/* Hover / focus actions. Always visible on touch devices. */}
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 flex gap-2",
              "transition-all duration-200 motion-reduce:transition-none",
              "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100",
              "[@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100"
            )}
          >
            <Button
              type="button"
              size="sm"
              className="flex-1 shadow-xs"
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${name} to cart`}
            >
              <ShoppingBagIcon data-icon="inline-start" />
              Add to cart
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="shadow-xs"
              onClick={() => onQuickView(product)}
              aria-label={`Quick view ${name}`}
            >
              <EyeIcon />
            </Button>
          </div>
        </div>

        <CardHeader className="gap-1 px-4 pt-4">
          <p className="truncate text-xs text-muted-foreground">{maker}</p>
          <CardTitle id={titleId} className="text-base leading-snug">
            <h3 className="line-clamp-2 min-h-[2.75em]">{name}</h3>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-2">
          <Rating value={rating} count={reviews} />
        </CardContent>

        <CardFooter className="mt-auto items-baseline gap-2 px-4 pt-3 pb-4">
          <p className="text-lg font-semibold tabular-nums">
            <span className="sr-only">Price: </span>
            {currency.format(price)}
          </p>
          {compareAt ? (
            <p className="text-sm text-muted-foreground tabular-nums line-through">
              <span className="sr-only">Was </span>
              {currency.format(compareAt)}
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton card                                                       */
/* ------------------------------------------------------------------ */

function ProductCardSkeleton(): ReactElement {
  return (
    <li className="list-none" aria-hidden="true">
      <Card className="h-full gap-0 overflow-hidden py-0">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="flex flex-col gap-2 px-4 pt-4">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="px-4 pt-3">
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-baseline gap-2 px-4 pt-4 pb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      </Card>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const LOAD_DELAY_MS = 1600;

export default function Page(): ReactElement {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), LOAD_DELAY_MS);
  }, []);

  useEffect(() => {
    startLoading();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startLoading]);

  const visible = useMemo(() => {
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

  const handleToggleWish = useCallback((product: Product) => {
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

  const handleAddToCart = useCallback((product: Product) => {
    setCartCount((c) => c + 1);
    toast.success(`Added ${product.name} to your cart`, {
      description: `${currency.format(product.price)} · ${product.maker}`,
    });
  }, []);

  const handleQuickView = useCallback((product: Product) => {
    toast(product.name, {
      description: `${product.category} · rated ${product.rating.toFixed(1)} from ${product.reviews} reviews`,
    });
  }, []);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Spring collection</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everyday objects, made to last
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Small-batch kitchenware, lighting and carry goods from independent makers. Free returns
            within 30 days.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm" aria-live="polite">
          <ShoppingBagIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="tabular-nums">
            {cartCount} {cartCount === 1 ? "item" : "items"} in cart
          </span>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <HeartIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="tabular-nums">{wishlist.size} saved</span>
        </div>
      </header>

      <Separator />

      <section aria-label="Product filters" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ToggleGroup
            type="single"
            variant="outline"
            value={category}
            onValueChange={(v) => {
              if (v) setCategory(v as CategoryFilter);
            }}
            aria-label="Filter by category"
            disabled={loading}
          >
            {CATEGORIES.map((c) => (
              <ToggleGroupItem key={c} value={c} aria-label={`Show ${c === "All" ? "all products" : c}`}>
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)} disabled={loading}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Sort products">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={startLoading}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCwIcon data-icon="inline-start" className={cn(loading && "animate-spin")} />
            Reload
          </Button>
        </div>
      </section>

      <section aria-labelledby="results-heading" className="flex flex-col gap-4" aria-busy={loading}>
        <h2 id="results-heading" className="sr-only">
          Products
        </h2>
        <p className="text-sm text-muted-foreground" role="status">
          {loading ? "Loading products…" : `Showing ${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </p>

        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wished={wishlist.has(product.id)}
                  onToggleWish={handleToggleWish}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
        </ul>
      </section>
    </main>
  );
}
```