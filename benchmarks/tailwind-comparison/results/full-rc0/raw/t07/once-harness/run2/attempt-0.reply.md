```tsx
"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  IconButton,
  Row,
  SegmentedControl,
  Select,
  Skeleton,
  Tag,
  Text,
  VisuallyHidden,
  useToast,
} from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

type Category = "bags" | "apparel" | "home" | "accessories";
type ArtKind = "tote" | "jacket" | "mug" | "watch" | "lamp" | "sneaker" | "bottle" | "scarf";
type TagScheme = "brand" | "success" | "danger" | "warning" | "info" | "accent";

type Product = {
  id: string;
  name: string;
  maker: string;
  category: Category;
  art: ArtKind;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: { label: string; scheme: TagScheme };
  colors: string;
  /** background tone for the image well */
  tone: "brand" | "accent" | "info" | "success" | "warning" | "danger" | "neutral";
  soldOut?: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Harbor Waxed Canvas Tote",
    maker: "Northline Goods",
    category: "bags",
    art: "tote",
    price: 84,
    rating: 4.8,
    reviews: 312,
    tag: { label: "Bestseller", scheme: "brand" },
    colors: "3 colors",
    tone: "brand",
  },
  {
    id: "p2",
    name: "Alder Quilted Field Jacket",
    maker: "Fenwick & Co.",
    category: "apparel",
    art: "jacket",
    price: 148,
    compareAt: 189,
    rating: 4.6,
    reviews: 128,
    tag: { label: "-22%", scheme: "danger" },
    colors: "2 colors",
    tone: "warning",
  },
  {
    id: "p3",
    name: "Kiln Stoneware Mug, Set of 2",
    maker: "Studio Marlowe",
    category: "home",
    art: "mug",
    price: 38,
    rating: 4.9,
    reviews: 541,
    tag: { label: "New", scheme: "success" },
    colors: "4 glazes",
    tone: "accent",
  },
  {
    id: "p4",
    name: "Meridian Automatic Watch",
    maker: "Calder Instruments",
    category: "accessories",
    art: "watch",
    price: 295,
    rating: 4.7,
    reviews: 87,
    colors: "2 straps",
    tone: "neutral",
  },
  {
    id: "p5",
    name: "Pebble Dimmable Table Lamp",
    maker: "Lumen Works",
    category: "home",
    art: "lamp",
    price: 112,
    compareAt: 135,
    rating: 4.5,
    reviews: 203,
    tag: { label: "Low stock", scheme: "warning" },
    colors: "3 finishes",
    tone: "warning",
  },
  {
    id: "p6",
    name: "Tidewater Leather Sneaker",
    maker: "Fenwick & Co.",
    category: "apparel",
    art: "sneaker",
    price: 129,
    rating: 4.4,
    reviews: 466,
    colors: "5 colors",
    tone: "info",
  },
  {
    id: "p7",
    name: "Summit Insulated Bottle 750ml",
    maker: "Northline Goods",
    category: "accessories",
    art: "bottle",
    price: 36,
    rating: 4.8,
    reviews: 1024,
    tag: { label: "Eco pick", scheme: "success" },
    colors: "6 colors",
    tone: "success",
  },
  {
    id: "p8",
    name: "Juniper Merino Wool Scarf",
    maker: "Studio Marlowe",
    category: "apparel",
    art: "scarf",
    price: 62,
    rating: 4.7,
    reviews: 159,
    tag: { label: "Sold out", scheme: "info" },
    colors: "3 colors",
    tone: "danger",
    soldOut: true,
  },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "bags", label: "Bags" },
  { value: "apparel", label: "Apparel" },
  { value: "home", label: "Home" },
  { value: "accessories", label: "Accessories" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const SKELETON_COUNT = 8;

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

/* ----------------------------------------------------------------------------
 * Product art (inline SVG, themed via CSS variables / currentColor)
 * ------------------------------------------------------------------------- */

function ProductArt({ kind }: { kind: ArtKind }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const soft = { fill: "currentColor", fillOpacity: 0.14, stroke: "none" as const };

  return (
    <svg
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
      role="img"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx="60" cy="108" rx="34" ry="4" {...soft} />
      {kind === "tote" && (
        <g>
          <path d="M28 44h64l6 58H22z" {...soft} />
          <path d="M28 44h64l6 58H22z" {...common} />
          <path d="M44 44c0-16 6-26 16-26s16 10 16 26" {...common} />
          <path d="M40 70h40" {...common} strokeOpacity={0.5} />
        </g>
      )}
      {kind === "jacket" && (
        <g>
          <path d="M42 24l-22 14 8 22 10-4v46h44V56l10 4 8-22-22-14-12 10h-12z" {...soft} />
          <path d="M42 24l-22 14 8 22 10-4v46h44V56l10 4 8-22-22-14-12 10h-12z" {...common} />
          <path d="M60 34v68" {...common} />
          <path d="M44 74h10M66 74h10" {...common} strokeOpacity={0.5} />
        </g>
      )}
      {kind === "mug" && (
        <g>
          <path d="M30 38h48v46a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14z" {...soft} />
          <path d="M30 38h48v46a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14z" {...common} />
          <path d="M78 48h6a10 10 0 0 1 0 22h-6" {...common} />
          <path d="M44 24c-3 4 3 6 0 10M56 24c-3 4 3 6 0 10" {...common} strokeOpacity={0.5} />
        </g>
      )}
      {kind === "watch" && (
        <g>
          <path d="M48 14h24l3 22H45zM45 84h30l-3 22H48z" {...soft} />
          <path d="M48 14h24l3 22H45zM45 84h30l-3 22H48z" {...common} />
          <circle cx="60" cy="60" r="26" {...soft} />
          <circle cx="60" cy="60" r="26" {...common} />
          <path d="M60 44v17l11 7" {...common} />
        </g>
      )}
      {kind === "lamp" && (
        <g>
          <path d="M36 28h48l12 34H24z" {...soft} />
          <path d="M36 28h48l12 34H24z" {...common} />
          <path d="M60 62v32" {...common} />
          <path d="M42 100h36" {...common} />
          <path d="M50 100c0-4 4-6 10-6s10 2 10 6" {...common} strokeOpacity={0.5} />
        </g>
      )}
      {kind === "sneaker" && (
        <g>
          <path d="M14 78V58l22 4 12-14 14 10c8 6 22 8 36 14v14c0 4-3 6-6 6H20c-4 0-6-4-6-6z" {...soft} />
          <path d="M14 78V58l22 4 12-14 14 10c8 6 22 8 36 14v14c0 4-3 6-6 6H20c-4 0-6-4-6-6z" {...common} />
          <path d="M14 82h92" {...common} strokeOpacity={0.5} />
          <path d="M50 58l6 6M58 62l6 6" {...common} />
        </g>
      )}
      {kind === "bottle" && (
        <g>
          <path d="M48 22h24v10l6 8v56a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V40l6-8z" {...soft} />
          <path d="M48 22h24v10l6 8v56a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V40l6-8z" {...common} />
          <path d="M48 12h24v10H48z" {...common} />
          <path d="M42 62h36" {...common} strokeOpacity={0.5} />
        </g>
      )}
      {kind === "scarf" && (
        <g>
          <path d="M32 24c14-6 42-6 56 0v16c-14 6-42 6-56 0z" {...soft} />
          <path d="M32 24c14-6 42-6 56 0v16c-14 6-42 6-56 0z" {...common} />
          <path d="M46 40v52h16V42M62 42v44h16V42" {...common} />
          <path d="M46 92v6M54 92v6M62 86v6M70 86v6M78 86v6" {...common} strokeOpacity={0.5} />
        </g>
      )}
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Hover-actions behaviour. Revealed on hover and keyboard focus, always shown
 * on devices that cannot hover. Scoped class names; no external CSS needed.
 * ------------------------------------------------------------------------- */

const PAGE_CSS = `
.pcard-actions {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 180ms ease, transform 180ms ease;
  pointer-events: none;
}
.pcard:hover .pcard-actions,
.pcard:focus-within .pcard-actions {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.pcard-art {
  transition: transform 320ms ease;
}
.pcard:hover .pcard-art {
  transform: scale(1.05);
}
.pcard-wish {
  transition: opacity 180ms ease;
}
@media (hover: none) {
  .pcard-actions {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pcard-actions, .pcard-art, .pcard-wish { transition: none; }
  .pcard:hover .pcard-art { transform: none; }
}
`;

/* ----------------------------------------------------------------------------
 * Product card
 * ------------------------------------------------------------------------- */

type ProductCardProps = {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
};

function ProductCard({ product, wished, onToggleWish, onQuickAdd }: ProductCardProps) {
  const { name, maker, price, compareAt, rating, reviews, tag, colors, tone, soldOut } = product;
  const titleId = `${product.id}-title`;
  const priceId = `${product.id}-price`;

  return (
    <Column
      as="article"
      className="pcard"
      aria-labelledby={titleId}
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
    >
      <Row
        fillWidth
        aspectRatio="1 / 1"
        background={`${tone}-alpha-weak`}
        onBackground={`${tone}-strong`}
        overflow="hidden"
        position="relative"
        center
      >
        <Row className="pcard-art" fill padding="32" center>
          <ProductArt kind={product.art} />
        </Row>

        {tag && (
          <Row position="absolute" top="12" left="12">
            <Tag size="s" scheme={tag.scheme}>
              {tag.label}
            </Tag>
          </Row>
        )}

        <Row position="absolute" top="8" right="8">
          <IconButton
            className="pcard-wish"
            icon={wished ? "heart" : "heart"}
            variant={wished ? "primary" : "secondary"}
            size="m"
            rounded
            aria-pressed={wished}
            ariaLabel={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            tooltip={wished ? "Saved" : "Save"}
            onClick={() => onToggleWish(product)}
          />
        </Row>

        <Row
          className="pcard-actions"
          position="absolute"
          bottom="12"
          left="12"
          right="12"
          gap="8"
        >
          <Button
            fillWidth
            size="m"
            variant="primary"
            prefixIcon="cart"
            disabled={soldOut}
            onClick={() => onQuickAdd(product)}
            aria-label={soldOut ? `${name} is sold out` : `Quick add ${name} to cart`}
          >
            {soldOut ? "Sold out" : "Quick add"}
          </Button>
          <IconButton
            icon="eye"
            variant="secondary"
            size="l"
            ariaLabel={`Preview ${name}`}
            tooltip="Preview"
            onClick={() => undefined}
          />
        </Row>
      </Row>

      <Column padding="16" gap="12" fillWidth>
        <Column gap="4">
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {maker}
          </Text>
          <Heading as="h3" variant="heading-strong-s" id={titleId}>
            {name}
          </Heading>
        </Column>

        <Row gap="8" vertical="center" wrap>
          <Row gap="4" vertical="center">
            <Text as="span" onBackground="warning-strong" aria-hidden="true">
              ★
            </Text>
            <Text variant="label-default-s">{rating.toFixed(1)}</Text>
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            ({reviews.toLocaleString("en-US")} reviews)
          </Text>
          <VisuallyHidden>{`Rated ${rating.toFixed(1)} out of 5 from ${reviews} reviews`}</VisuallyHidden>
        </Row>

        <Row fillWidth horizontal="between" vertical="end" gap="8">
          <Row gap="8" vertical="end" wrap id={priceId}>
            <Text variant="heading-strong-m">{priceFormat.format(price)}</Text>
            {compareAt !== undefined && (
              <>
                <Text
                  variant="body-default-s"
                  onBackground="neutral-weak"
                  style={{ textDecoration: "line-through" }}
                  aria-hidden="true"
                >
                  {priceFormat.format(compareAt)}
                </Text>
                <VisuallyHidden>{`Was ${priceFormat.format(compareAt)}`}</VisuallyHidden>
              </>
            )}
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {colors}
          </Text>
        </Row>
      </Column>
    </Column>
  );
}

/* ----------------------------------------------------------------------------
 * Skeleton card (mirrors the real card's structure to avoid layout shift)
 * ------------------------------------------------------------------------- */

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = index * 80;
  return (
    <Column background="surface" border radius="l" overflow="hidden" fillWidth aria-hidden="true">
      <Skeleton shape="block" delay={delay} fillWidth style={{ aspectRatio: "1 / 1", borderRadius: 0 }} />
      <Column padding="16" gap="12" fillWidth>
        <Column gap="8">
          <Skeleton shape="line" size="xs" delay={delay} width={7} />
          <Skeleton shape="line" size="m" delay={delay} fillWidth />
        </Column>
        <Row gap="8" vertical="center">
          <Skeleton shape="line" size="s" delay={delay} width={10} />
        </Row>
        <Row fillWidth horizontal="between" vertical="center">
          <Skeleton shape="line" size="l" delay={delay} width={8} />
          <Skeleton shape="line" size="xs" delay={delay} width={6} />
        </Row>
      </Column>
    </Column>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function Page() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 1800);
  }, []);

  useEffect(() => {
    startLoading();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startLoading]);

  const visible = useMemo(() => {
    const list = PRODUCTS.filter((p) => filter === "all" || p.category === filter);
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [filter, sort]);

  const toggleWish = useCallback(
    (product: Product) => {
      const isSaved = wishlist.has(product.id);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(product.id)) next.delete(product.id);
        else next.add(product.id);
        return next;
      });
      addToast({
        variant: "success",
        message: isSaved ? `Removed ${product.name} from your wishlist` : `Saved ${product.name} to your wishlist`,
        duration: 2500,
      });
    },
    [addToast, wishlist],
  );

  const quickAdd = useCallback(
    (product: Product) => {
      setCartCount((c) => c + 1);
      addToast({
        variant: "success",
        message: `Added ${product.name} to your cart`,
        duration: 2500,
      });
    },
    [addToast],
  );

  const statusMessage = loading
    ? "Loading products"
    : `${visible.length} ${visible.length === 1 ? "product" : "products"} shown`;

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <style>{PAGE_CSS}</style>

      <Column maxWidth="xl" gap="32">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Autumn collection
            </Text>
            <Heading as="h1" variant="display-strong-s">
              Everyday objects, made to last
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
              Small-batch bags, layers and home pieces from independent makers. Free returns for 30 days.
            </Text>
          </Column>
          <Row gap="12" vertical="center">
            <Button
              variant="secondary"
              prefixIcon="refresh"
              onClick={startLoading}
              disabled={loading}
              aria-label="Reload products to preview the loading state"
            >
              Reload
            </Button>
            <Row gap="8" vertical="center" background="neutral-alpha-weak" radius="full" paddingX="12" paddingY="8">
              <Text as="span" onBackground="neutral-strong" aria-hidden="true">
                🛒
              </Text>
              <Text variant="label-default-s" aria-live="polite">
                {cartCount} {cartCount === 1 ? "item" : "items"} in cart
              </Text>
            </Row>
          </Row>
        </Row>

        <Row
          fillWidth
          gap="16"
          vertical="end"
          horizontal="between"
          s={{ direction: "column", vertical: "start", horizontal: "start" }}
        >
          <Column minWidth={0} s={{ fillWidth: true }}>
            <SegmentedControl
              fillWidth={false}
              value={filter}
              onChange={(value) => setFilter(value)}
              buttons={FILTERS}
            />
          </Column>
          <Column width={16} s={{ fillWidth: true, width: "100%" as never }}>
            <Select
              id="sort"
              label="Sort by"
              value={sort}
              options={SORT_OPTIONS}
              onSelect={(value) => setSort(Array.isArray(value) ? (value[0] ?? "featured") : value)}
            />
          </Column>
        </Row>

        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {statusMessage}
          </span>
        </VisuallyHidden>

        {loading ? (
          <Grid
            columns="4"
            l={{ columns: 3 }}
            m={{ columns: 3 }}
            s={{ columns: 2 }}
            xs={{ columns: 1 }}
            gap="24"
            s-gap="16"
            fillWidth
            aria-busy="true"
          >
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProductCardSkeleton key={i} index={i} />
            ))}
          </Grid>
        ) : visible.length === 0 ? (
          <Column
            background="surface"
            border
            borderStyle="dashed"
            radius="l"
            padding="48"
            center
            gap="12"
          >
            <Text variant="heading-strong-m">No products in this category</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Try another category to keep browsing.
            </Text>
            <Button variant="secondary" size="s" onClick={() => setFilter("all")}>
              Show all products
            </Button>
          </Column>
        ) : (
          <Grid
            as="ul"
            columns="4"
            l={{ columns: 3 }}
            m={{ columns: 3 }}
            s={{ columns: 2 }}
            xs={{ columns: 1 }}
            gap="24"
            fillWidth
            aria-busy="false"
            aria-label="Products"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {visible.map((product) => (
              <li key={product.id} style={{ display: "flex" }}>
                <ProductCard
                  product={product}
                  wished={wishlist.has(product.id)}
                  onToggleWish={toggleWish}
                  onQuickAdd={quickAdd}
                />
              </li>
            ))}
          </Grid>
        )}
      </Column>
    </Column>
  );
}
```