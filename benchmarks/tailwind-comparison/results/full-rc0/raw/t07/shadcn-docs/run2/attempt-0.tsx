"use client";

import * as React from "react";
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
} from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Category = "Bags" | "Footwear" | "Home" | "Accessories";
type Shape = "tote" | "sneaker" | "mug" | "lamp" | "watch" | "bottle" | "pouch" | "chair";
type Tag = "New" | "Bestseller" | "Sale" | "Low stock" | "Eco";

interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: Tag;
  color: string;
  shape: Shape;
  hue: number;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Harbor Canvas Tote", category: "Bags", price: 64, rating: 4.8, reviews: 312, tag: "Bestseller", color: "Natural oat", shape: "tote", hue: 75 },
  { id: "p2", name: "Stride Low Leather Sneaker", category: "Footwear", price: 128, compareAt: 160, rating: 4.6, reviews: 187, tag: "Sale", color: "Chalk white", shape: "sneaker", hue: 250 },
  { id: "p3", name: "Kiln Stoneware Mug", category: "Home", price: 24, rating: 4.9, reviews: 540, tag: "Bestseller", color: "Moss glaze", shape: "mug", hue: 150 },
  { id: "p4", name: "Arc Desk Lamp", category: "Home", price: 89, rating: 4.5, reviews: 96, tag: "New", color: "Matte graphite", shape: "lamp", hue: 40 },
  { id: "p5", name: "Meridian Field Watch", category: "Accessories", price: 215, rating: 4.7, reviews: 142, tag: "Low stock", color: "Brushed steel", shape: "watch", hue: 220 },
  { id: "p6", name: "Trail Insulated Bottle 750ml", category: "Accessories", price: 36, rating: 4.8, reviews: 421, tag: "Eco", color: "Sage green", shape: "bottle", hue: 170 },
  { id: "p7", name: "Fold Zip Travel Pouch", category: "Bags", price: 28, compareAt: 35, rating: 4.4, reviews: 73, tag: "Sale", color: "Terracotta", shape: "pouch", hue: 30 },
  { id: "p8", name: "Nook Oak Lounge Chair", category: "Home", price: 340, rating: 4.9, reviews: 58, tag: "New", color: "Natural oak", shape: "chair", hue: 60 },
  { id: "p9", name: "Cove Slip-On Canvas Shoe", category: "Footwear", price: 58, rating: 4.3, reviews: 209, color: "Indigo", shape: "sneaker", hue: 265 },
  { id: "p10", name: "Pioneer Weekender Duffel", category: "Bags", price: 149, rating: 4.7, reviews: 164, tag: "Eco", color: "Olive waxed", shape: "tote", hue: 110 },
  { id: "p11", name: "Dune Ceramic Table Lamp", category: "Home", price: 72, compareAt: 96, rating: 4.6, reviews: 81, tag: "Sale", color: "Sand", shape: "lamp", hue: 55 },
  { id: "p12", name: "Tide Sport Watch", category: "Accessories", price: 159, rating: 4.5, reviews: 118, color: "Midnight", shape: "watch", hue: 235 },
];

const CATEGORIES: ReadonlyArray<"All" | Category> = [
  "All",
  "Bags",
  "Footwear",
  "Home",
  "Accessories",
];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function ProductIllustration({ shape, hue }: { shape: Shape; hue: number }) {
  const bg = `oklch(0.94 0.035 ${hue})`;
  const bgDeep = `oklch(0.88 0.06 ${hue})`;
  const main = `oklch(0.55 0.09 ${hue})`;
  const light = `oklch(0.75 0.08 ${hue})`;
  const dark = `oklch(0.32 0.05 ${hue})`;
  const gradId = `g-${shape}-${hue}`;

  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg} />
          <stop offset="1" stopColor={bgDeep} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradId})`} />
      <ellipse cx="100" cy="162" rx="52" ry="7" fill={dark} opacity="0.14" />
      {shape === "tote" && (
        <g>
          <path d="M72 78c0-30 56-30 56 0" fill="none" stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <path d="M54 78h92l8 80H46z" fill={main} />
          <path d="M54 78h92l2 18H52z" fill={light} opacity="0.6" />
          <rect x="84" y="112" width="32" height="22" rx="3" fill={dark} opacity="0.25" />
        </g>
      )}
      {shape === "sneaker" && (
        <g>
          <path d="M34 128c0-8 4-12 10-14l22-6 14-22 16 10 18 6c18 4 34 10 36 22v8H34z" fill={main} />
          <path d="M34 128h122v14a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6z" fill={dark} opacity="0.85" />
          <path d="M82 94l8 8M94 98l8 8M106 102l8 8" stroke={bg} strokeWidth="3" strokeLinecap="round" />
          <path d="M44 114l22-6" stroke={light} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {shape === "mug" && (
        <g>
          <path d="M142 90h10a14 14 0 0 1 0 28h-10" fill="none" stroke={main} strokeWidth="8" strokeLinecap="round" />
          <path d="M58 78h86v52a22 22 0 0 1-22 22H80a22 22 0 0 1-22-22z" fill={main} />
          <ellipse cx="101" cy="78" rx="43" ry="7" fill={dark} opacity="0.55" />
          <path d="M70 100c4 20 4 34 0 44" stroke={light} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      )}
      {shape === "lamp" && (
        <g>
          <ellipse cx="100" cy="154" rx="30" ry="6" fill={dark} />
          <path d="M100 154V96l36-38" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M118 44l36 22-14 22z" fill={main} />
          <circle cx="146" cy="82" r="5" fill={light} />
        </g>
      )}
      {shape === "watch" && (
        <g>
          <rect x="82" y="30" width="36" height="140" rx="10" fill={dark} opacity="0.8" />
          <circle cx="100" cy="100" r="40" fill={main} />
          <circle cx="100" cy="100" r="33" fill={bg} />
          <path d="M100 100V76M100 100l16 8" stroke={dark} strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="100" r="3.5" fill={dark} />
          <path d="M100 70v4M100 126v4M70 100h4M126 100h4" stroke={main} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {shape === "bottle" && (
        <g>
          <rect x="88" y="34" width="24" height="16" rx="4" fill={dark} />
          <path d="M90 50h20v10c14 8 18 18 18 30v58a10 10 0 0 1-10 10H82a10 10 0 0 1-10-10V90c0-12 4-22 18-30z" fill={main} />
          <rect x="72" y="104" width="56" height="26" fill={light} opacity="0.55" />
          <path d="M84 78v62" stroke={bg} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </g>
      )}
      {shape === "pouch" && (
        <g>
          <path d="M48 76h104l6 74a8 8 0 0 1-8 9H50a8 8 0 0 1-8-9z" fill={main} />
          <rect x="46" y="68" width="108" height="16" rx="6" fill={light} />
          <path d="M60 76h80" stroke={dark} strokeWidth="2.5" strokeDasharray="5 4" opacity="0.55" />
          <path d="M100 76v-6l10-8" stroke={dark} strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}
      {shape === "chair" && (
        <g>
          <path d="M62 52h66l10 66H58z" fill={main} />
          <path d="M52 112h96l-6 22H58z" fill={light} />
          <path d="M60 134l-10 28M140 134l10 28M80 134l-4 28M120 134l4 28" stroke={dark} strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <StarIcon className="size-3.5 fill-current text-foreground" aria-hidden="true" />
      <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      <span aria-hidden="true">({reviews})</span>
      <span className="sr-only">out of 5 stars, {reviews} reviews</span>
    </p>
  );
}

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({
  product,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <Card
      className="group/card gap-0 overflow-hidden py-0 transition-shadow focus-within:shadow-md hover:shadow-md"
      aria-label={product.name}
    >
      <CardHeader className="relative block p-0">
        <div className="relative aspect-square w-full overflow-hidden">
          <div className="size-full transition-transform duration-500 ease-out group-focus-within/card:scale-105 group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100 motion-reduce:group-focus-within/card:scale-100">
            <ProductIllustration shape={product.shape} hue={product.hue} />
          </div>

          {product.tag && (
            <Badge
              variant={product.tag === "Sale" ? "destructive" : "secondary"}
              className="absolute top-3 left-3"
            >
              {product.tag}
              {product.tag === "Sale" && discount > 0 ? ` −${discount}%` : null}
            </Badge>
          )}

          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-3 right-3 rounded-full shadow-sm"
            aria-pressed={wishlisted}
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            onClick={() => onToggleWishlist(product)}
          >
            <HeartIcon className={cn(wishlisted && "fill-current text-destructive")} />
          </Button>

          <div
            className={cn(
              "absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-200",
              "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100",
              "[@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100",
              "motion-reduce:transition-none"
            )}
          >
            <Button
              type="button"
              size="sm"
              className="flex-1 shadow-sm"
              onClick={() => onAddToCart(product)}
            >
              <ShoppingBagIcon data-icon="inline-start" />
              Add to cart
              <span className="sr-only">: {product.name}</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="shadow-sm"
                    aria-label={`Quick view ${product.name}`}
                    onClick={() => onQuickView(product)}
                  >
                    <EyeIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quick view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5 px-4 pt-4">
        <p className="text-xs text-muted-foreground">
          {product.category} · {product.color}
        </p>
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold text-balance">
          {product.name}
        </h3>
        <Rating value={product.rating} reviews={product.reviews} />
      </CardContent>

      <CardFooter className="items-baseline gap-2 px-4 pt-2 pb-4">
        <p className="text-base font-semibold tabular-nums">
          <span className="sr-only">Price: </span>
          {currency.format(product.price)}
        </p>
        {product.compareAt && (
          <p className="text-sm text-muted-foreground tabular-nums line-through">
            <span className="sr-only">Was </span>
            {currency.format(product.compareAt)}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="flex flex-col gap-2 px-4 pt-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="mt-1 h-3 w-1/4" />
      </CardContent>
      <CardFooter className="px-4 pt-3 pb-4">
        <Skeleton className="h-5 w-16" />
      </CardFooter>
    </Card>
  );
}

export default function Page() {
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<"All" | Category>("All");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = React.useCallback((duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = setTimeout(() => setLoading(false), duration);
  }, []);

  React.useEffect(() => {
    startLoading(1600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startLoading]);

  const visible = React.useMemo(() => {
    const filtered =
      category === "All"
        ? [...PRODUCTS]
        : PRODUCTS.filter((p) => p.category === category);
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

  const handleToggleWishlist = React.useCallback((product: Product) => {
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

  const handleAddToCart = React.useCallback((product: Product) => {
    toast.success("Added to cart", {
      description: `${product.name} · ${currency.format(product.price)}`,
    });
  }, []);

  const handleQuickView = React.useCallback((product: Product) => {
    toast.info(product.name, {
      description: `${product.color} · ${product.rating.toFixed(1)} stars from ${product.reviews} reviews`,
    });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Spring collection
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Everyday objects, made to last
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Bags, shoes, and home pieces built from durable materials and
              designed to age well. Free returns within 30 days.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            disabled={loading}
            onClick={() => startLoading(1800)}
          >
            <RefreshCwIcon
              data-icon="inline-start"
              className={cn(loading && "animate-spin motion-reduce:animate-none")}
            />
            {loading ? "Loading…" : "Reload products"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={category}
              onValueChange={(value) => {
                if (value) setCategory(value as "All" | Category);
              }}
              aria-label="Filter by category"
            >
              {CATEGORIES.map((c) => (
                <ToggleGroupItem key={c} value={c}>
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-3">
            <p
              className="text-sm text-muted-foreground tabular-nums"
              role="status"
              aria-live="polite"
            >
              {loading
                ? "Loading products…"
                : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
            </p>
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <NativeSelect
              id="sort"
              size="sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <NativeSelectOption value="featured">Featured</NativeSelectOption>
              <NativeSelectOption value="price-asc">Price: low to high</NativeSelectOption>
              <NativeSelectOption value="price-desc">Price: high to low</NativeSelectOption>
              <NativeSelectOption value="rating">Top rated</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      </header>

      <section aria-label="Products" aria-busy={loading}>
        {loading ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visible.map((product) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  wishlisted={wishlist.has(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
