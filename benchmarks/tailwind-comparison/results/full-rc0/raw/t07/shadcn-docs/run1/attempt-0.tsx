"use client";

import * as React from "react";
import {
  CheckIcon,
  EyeIcon,
  HeartIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  StarIcon,
  type LucideIcon,
  HeadphonesIcon,
  WatchIcon,
  CameraIcon,
  LampDeskIcon,
  CoffeeIcon,
  BackpackIcon,
  FootprintsIcon,
  SpeakerIcon,
  KeyboardIcon,
  GlassesIcon,
  PackageSearchIcon,
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
  CardDescription,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Tag = "New" | "Sale" | "Bestseller" | "Low stock" | null;

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag: Tag;
  icon: LucideIcon;
  /** Tailwind gradient classes using theme-agnostic chart tokens */
  tone: string;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aurora Wireless Headphones",
    brand: "Northwave",
    category: "Audio",
    price: 189,
    compareAt: 249,
    rating: 4.7,
    reviews: 1284,
    tag: "Sale",
    icon: HeadphonesIcon,
    tone: "from-chart-1/25 via-chart-1/10 to-muted",
  },
  {
    id: "p2",
    name: "Meridian Automatic Watch",
    brand: "Halden & Co.",
    category: "Watches",
    price: 420,
    rating: 4.9,
    reviews: 312,
    tag: "New",
    icon: WatchIcon,
    tone: "from-chart-2/25 via-chart-2/10 to-muted",
  },
  {
    id: "p3",
    name: "Field 35 Mirrorless Camera",
    brand: "Lumio",
    category: "Cameras",
    price: 1149,
    rating: 4.6,
    reviews: 506,
    tag: "Bestseller",
    icon: CameraIcon,
    tone: "from-chart-3/25 via-chart-3/10 to-muted",
  },
  {
    id: "p4",
    name: "Arc Adjustable Desk Lamp",
    brand: "Oslo Studio",
    category: "Home",
    price: 74.5,
    rating: 4.4,
    reviews: 689,
    tag: null,
    icon: LampDeskIcon,
    tone: "from-chart-4/25 via-chart-4/10 to-muted",
  },
  {
    id: "p5",
    name: "Pour-Over Ceramic Set",
    brand: "Kiln & Kettle",
    category: "Kitchen",
    price: 58,
    compareAt: 72,
    rating: 4.8,
    reviews: 947,
    tag: "Sale",
    icon: CoffeeIcon,
    tone: "from-chart-5/25 via-chart-5/10 to-muted",
  },
  {
    id: "p6",
    name: "Trailhead 24L Daypack",
    brand: "Ridgeline",
    category: "Bags",
    price: 96,
    rating: 4.5,
    reviews: 421,
    tag: "Low stock",
    icon: BackpackIcon,
    tone: "from-chart-1/25 via-chart-2/10 to-muted",
  },
  {
    id: "p7",
    name: "Stride Knit Running Shoes",
    brand: "Pacer",
    category: "Footwear",
    price: 128,
    rating: 4.3,
    reviews: 2210,
    tag: "Bestseller",
    icon: FootprintsIcon,
    tone: "from-chart-2/25 via-chart-3/10 to-muted",
  },
  {
    id: "p8",
    name: "Cube Portable Speaker",
    brand: "Northwave",
    category: "Audio",
    price: 79,
    compareAt: 99,
    rating: 4.2,
    reviews: 833,
    tag: "Sale",
    icon: SpeakerIcon,
    tone: "from-chart-3/25 via-chart-4/10 to-muted",
  },
  {
    id: "p9",
    name: "Tactile 75 Mechanical Keyboard",
    brand: "Keyforge",
    category: "Computing",
    price: 139,
    rating: 4.8,
    reviews: 1560,
    tag: "New",
    icon: KeyboardIcon,
    tone: "from-chart-4/25 via-chart-5/10 to-muted",
  },
  {
    id: "p10",
    name: "Clarity Blue-Light Glasses",
    brand: "Optika",
    category: "Accessories",
    price: 65,
    rating: 4.1,
    reviews: 274,
    tag: null,
    icon: GlassesIcon,
    tone: "from-chart-5/25 via-chart-1/10 to-muted",
  },
];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const SKELETON_COUNT = 8;

function tagVariant(tag: Exclude<Tag, null>) {
  switch (tag) {
    case "Sale":
      return "destructive" as const;
    case "New":
      return "default" as const;
    case "Low stock":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function ProductCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </Card>
  );
}

type ProductCardProps = {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

function ProductCard({
  product,
  wished,
  inCart,
  onToggleWish,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const Icon = product.icon;
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const titleId = `product-${product.id}-title`;

  return (
    <li className="list-none">
      <Card
        className="group/product h-full gap-0 overflow-hidden py-0 transition-shadow focus-within:shadow-md hover:shadow-md"
        role="group"
        aria-labelledby={titleId}
      >
        <div
          className={cn(
            "relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br",
            product.tone,
          )}
        >
          <Icon
            className="size-20 text-foreground/70 transition-transform duration-300 group-hover/product:scale-105 group-focus-within/product:scale-105 motion-reduce:transition-none sm:size-24"
            strokeWidth={1.25}
            aria-hidden="true"
          />

          {product.tag && (
            <Badge
              variant={tagVariant(product.tag)}
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
            aria-pressed={wished}
            aria-label={
              wished
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            onClick={() => onToggleWish(product)}
          >
            <HeartIcon
              className={cn(wished && "fill-destructive text-destructive")}
              aria-hidden="true"
            />
          </Button>

          {/* Hover / focus actions. Always visible on touch devices (no hover). */}
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-200 motion-reduce:transition-none",
              "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover/product:translate-y-0 [@media(hover:hover)]:group-hover/product:opacity-100",
              "[@media(hover:hover)]:group-focus-within/product:translate-y-0 [@media(hover:hover)]:group-focus-within/product:opacity-100",
            )}
          >
            <Button
              type="button"
              size="sm"
              className="flex-1 shadow-sm"
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              {inCart ? (
                <CheckIcon data-icon="inline-start" aria-hidden="true" />
              ) : (
                <ShoppingBagIcon data-icon="inline-start" aria-hidden="true" />
              )}
              {inCart ? "Added" : "Add to cart"}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="shadow-sm"
                  aria-label={`Quick view ${product.name}`}
                  onClick={() => onQuickView(product)}
                >
                  <EyeIcon aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Quick view</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <CardHeader className="gap-1 px-4 pt-4">
          <CardDescription className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate">
              {product.brand} · {product.category}
            </span>
          </CardDescription>
          <CardTitle id={titleId} className="text-base leading-snug text-balance">
            <h3>{product.name}</h3>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-2">
          <div
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
            role="img"
            aria-label={`Rated ${product.rating} out of 5 from ${product.reviews.toLocaleString("en-US")} reviews`}
          >
            <StarIcon
              className="size-3.5 fill-chart-4 text-chart-4"
              aria-hidden="true"
            />
            <span className="font-medium text-foreground" aria-hidden="true">
              {product.rating.toFixed(1)}
            </span>
            <span aria-hidden="true">
              ({product.reviews.toLocaleString("en-US")})
            </span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto items-baseline gap-2 px-4 pt-3 pb-4">
          <span className="text-lg font-semibold tabular-nums">
            {currency.format(product.price)}
          </span>
          {product.compareAt ? (
            <>
              <span className="text-sm text-muted-foreground tabular-nums line-through">
                <span className="sr-only">Original price </span>
                {currency.format(product.compareAt)}
              </span>
            </>
          ) : null}
        </CardFooter>
      </Card>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [cart, setCart] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  React.useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  const categories = React.useMemo(
    () => Array.from(new Set(PRODUCTS.map((p) => p.category))).sort(),
    [],
  );

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = PRODUCTS.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [query, category, sort]);

  const toggleWish = React.useCallback((product: Product) => {
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

  const addToCart = React.useCallback((product: Product) => {
    setCart((prev) => {
      if (prev.has(product.id)) {
        toast(`Already in your cart`, { description: product.name });
        return prev;
      }
      const next = new Set(prev);
      next.add(product.id);
      toast.success(`Added to cart`, {
        description: `${product.name} · ${currency.format(product.price)}`,
      });
      return next;
    });
  }, []);

  const quickView = React.useCallback((product: Product) => {
    toast(product.name, {
      description: `${product.brand} · rated ${product.rating.toFixed(1)} by ${product.reviews.toLocaleString("en-US")} shoppers`,
    });
  }, []);

  const reload = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1200);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("featured");
  };

  return (
    <TooltipProvider>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Spring collection
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everyday gear, thoughtfully made
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" aria-live="polite">
              <HeartIcon aria-hidden="true" />
              {wishlist.size} saved
            </Badge>
            <Badge variant="secondary" aria-live="polite">
              <ShoppingBagIcon aria-hidden="true" />
              {cart.size} in cart
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reload}
              disabled={loading}
            >
              <RefreshCwIcon
                data-icon="inline-start"
                className={cn(loading && "animate-spin")}
                aria-hidden="true"
              />
              Reload
            </Button>
          </div>
        </header>

        <section
          aria-label="Filter and sort products"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <Input
              id="product-search"
              type="search"
              inputMode="search"
              placeholder="Search by product or brand"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div>
              <label htmlFor="product-category" className="sr-only">
                Category
              </label>
              <NativeSelect
                id="product-category"
                className="w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <NativeSelectOption value="all">All categories</NativeSelectOption>
                {categories.map((c) => (
                  <NativeSelectOption key={c} value={c}>
                    {c}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div>
              <label htmlFor="product-sort" className="sr-only">
                Sort by
              </label>
              <NativeSelect
                id="product-sort"
                className="w-full"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                disabled={loading}
              >
                <NativeSelectOption value="featured">Featured</NativeSelectOption>
                <NativeSelectOption value="price-asc">
                  Price: low to high
                </NativeSelectOption>
                <NativeSelectOption value="price-desc">
                  Price: high to low
                </NativeSelectOption>
                <NativeSelectOption value="rating">Top rated</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        </section>

        <p
          className="text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {loading
            ? "Loading products…"
            : `Showing ${visible.length} of ${PRODUCTS.length} products`}
        </p>

        {loading ? (
          <ul
            className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <li key={i} className="list-none">
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        ) : visible.length > 0 ? (
          <ul
            className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Products"
          >
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wished={wishlist.has(product.id)}
                inCart={cart.has(product.id)}
                onToggleWish={toggleWish}
                onAddToCart={addToCart}
                onQuickView={quickView}
              />
            ))}
          </ul>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageSearchIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No products match your filters</EmptyTitle>
              <EmptyDescription>
                Try a different search term or browse all categories.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </main>
    </TooltipProvider>
  );
}
