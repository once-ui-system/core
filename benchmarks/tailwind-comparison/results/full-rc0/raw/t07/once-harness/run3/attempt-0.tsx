"use client";

import {
  Background,
  Button,
  Column,
  Grid,
  Heading,
  IconButton,
  Icon,
  Row,
  SegmentedControl,
  Select,
  Skeleton,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type IconName = ComponentProps<typeof Icon>["name"];
type Scheme = "brand" | "accent" | "info" | "success" | "warning" | "danger" | "neutral";
type Category = "all" | "audio" | "wearables" | "home" | "bags";
type Sort = "featured" | "price-asc" | "price-desc" | "rating";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: Exclude<Category, "all">;
  categoryLabel: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: { label: string; scheme: Scheme; icon?: IconName };
  art: { icon: IconName; scheme: Scheme; x: number; y: number };
  swatches: string;
  stock: "in" | "low" | "out";
};

const PRODUCTS: Product[] = [
  {
    id: "aria-nc-headphones",
    name: "Aria NC Wireless Headphones",
    brand: "Northwave",
    category: "audio",
    categoryLabel: "Audio",
    price: 249,
    compareAt: 329,
    rating: 4.7,
    reviews: 1284,
    tag: { label: "Save 24%", scheme: "danger", icon: "tag" },
    art: { icon: "volume", scheme: "brand", x: 25, y: 20 },
    swatches: "Graphite, Sand",
    stock: "in",
  },
  {
    id: "pulse-s2-watch",
    name: "Pulse S2 Fitness Watch",
    brand: "Kestrel",
    category: "wearables",
    categoryLabel: "Wearables",
    price: 189,
    rating: 4.5,
    reviews: 862,
    tag: { label: "New", scheme: "brand", icon: "sparkle" },
    art: { icon: "time", scheme: "accent", x: 75, y: 25 },
    swatches: "Black, Moss, Silver",
    stock: "in",
  },
  {
    id: "lumen-desk-lamp",
    name: "Lumen Adjustable Desk Lamp",
    brand: "Halden",
    category: "home",
    categoryLabel: "Home",
    price: 74,
    rating: 4.8,
    reviews: 2310,
    tag: { label: "Best seller", scheme: "success", icon: "trendUp" },
    art: { icon: "bolt", scheme: "warning", x: 50, y: 15 },
    swatches: "White, Brass",
    stock: "in",
  },
  {
    id: "trail-daypack-22",
    name: "Trailhead Daypack 22L",
    brand: "Fjord & Co.",
    category: "bags",
    categoryLabel: "Bags",
    price: 98,
    compareAt: 120,
    rating: 4.6,
    reviews: 540,
    tag: { label: "Only 3 left", scheme: "warning", icon: "warning" },
    art: { icon: "organization", scheme: "success", x: 20, y: 80 },
    swatches: "Olive, Charcoal",
    stock: "low",
  },
  {
    id: "orbit-earbuds",
    name: "Orbit Mini True Wireless Earbuds",
    brand: "Northwave",
    category: "audio",
    categoryLabel: "Audio",
    price: 129,
    rating: 4.3,
    reviews: 3102,
    art: { icon: "play", scheme: "info", x: 80, y: 75 },
    swatches: "Ivory, Midnight",
    stock: "in",
  },
  {
    id: "terra-ceramic-kettle",
    name: "Terra Ceramic Pour-Over Kettle",
    brand: "Halden",
    category: "home",
    categoryLabel: "Home",
    price: 62,
    rating: 4.9,
    reviews: 418,
    tag: { label: "Staff pick", scheme: "accent", icon: "star" },
    art: { icon: "food", scheme: "danger", x: 30, y: 60 },
    swatches: "Clay, Oat",
    stock: "in",
  },
  {
    id: "loop-band-pro",
    name: "Loop Band Pro Heart-Rate Strap",
    brand: "Kestrel",
    category: "wearables",
    categoryLabel: "Wearables",
    price: 59,
    compareAt: 79,
    rating: 4.2,
    reviews: 276,
    tag: { label: "Sold out", scheme: "neutral" },
    art: { icon: "trend", scheme: "neutral", x: 65, y: 30 },
    swatches: "Black",
    stock: "out",
  },
  {
    id: "metro-weekender",
    name: "Metro Waxed Canvas Weekender",
    brand: "Fjord & Co.",
    category: "bags",
    categoryLabel: "Bags",
    price: 168,
    rating: 4.7,
    reviews: 693,
    tag: { label: "New", scheme: "brand", icon: "sparkle" },
    art: { icon: "store", scheme: "accent", x: 55, y: 70 },
    swatches: "Tan, Navy",
    stock: "in",
  },
];

const CATEGORY_BUTTONS = [
  { value: "all", label: "All" },
  { value: "audio", label: "Audio" },
  { value: "wearables", label: "Wearables" },
  { value: "home", label: "Home" },
  { value: "bags", label: "Bags" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const LOADING_MS = 1600;
const SKELETON_COUNT = 8;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Hover actions are revealed on hover and on keyboard focus. Touch devices
// (no hover) keep them visible so they remain reachable.
const HOVER_CSS = `
.pc-actions { opacity: 0; transform: translateY(6px); pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease; }
.pc-card:hover .pc-actions,
.pc-card:focus-within .pc-actions { opacity: 1; transform: none; pointer-events: auto; }
.pc-wish-idle { opacity: 0; transition: opacity 160ms ease; }
.pc-card:hover .pc-wish-idle,
.pc-card:focus-within .pc-wish-idle { opacity: 1; }
@media (hover: none) {
  .pc-actions, .pc-wish-idle { opacity: 1; transform: none; pointer-events: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .pc-actions, .pc-wish-idle { transition: none; }
}
`;

function Stars({ rating }: { rating: number }) {
  return (
    <Row gap="4" vertical="center">
      <Icon name="starFill" size="xs" onBackground="warning-strong" />
      <Text variant="label-default-s">{rating.toFixed(1)}</Text>
    </Row>
  );
}

type CardProps = {
  product: Product;
  wished: boolean;
  onToggleWish: (id: string) => void;
  onAdd: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

function ProductCard({ product, wished, onToggleWish, onAdd, onQuickView }: CardProps) {
  const soldOut = product.stock === "out";
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <Column
      as="li"
      className="pc-card"
      fill
      background="surface"
      border
      radius="l"
      overflow="hidden"
      style={{ listStyle: "none" }}
    >
      <Row
        position="relative"
        fillWidth
        aspectRatio="4 / 3"
        overflow="hidden"
        background="neutral-alpha-weak"
      >
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: `${product.art.scheme}-alpha-medium`,
            colorEnd: "static-transparent",
            x: product.art.x,
            y: product.art.y,
            width: 160,
            height: 160,
            opacity: soldOut ? 40 : 100,
          }}
        />
        <Row fill center pointerEvents="none" opacity={soldOut ? 50 : 100}>
          <Icon
            name={product.art.icon}
            size="xl"
            onBackground={`${product.art.scheme}-strong`}
            style={{ width: "34%", height: "34%" }}
            decorative
          />
        </Row>

        {product.tag && (
          <Row position="absolute" top="12" left="12">
            <Tag size="s" scheme={product.tag.scheme} prefixIcon={product.tag.icon}>
              {product.tag.label}
            </Tag>
          </Row>
        )}

        <Row
          position="absolute"
          top="8"
          right="8"
          className={wished ? undefined : "pc-wish-idle"}
        >
          <IconButton
            icon={wished ? "heart" : "heart"}
            variant={wished ? "primary" : "secondary"}
            size="m"
            rounded
            aria-pressed={wished}
            ariaLabel={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            tooltip={wished ? "Saved" : "Save for later"}
            onClick={() => onToggleWish(product.id)}
          />
        </Row>

        <Row
          className="pc-actions"
          position="absolute"
          left="12"
          right="12"
          bottom="12"
          gap="8"
        >
          <Button
            fillWidth
            size="m"
            prefixIcon="cart"
            disabled={soldOut}
            onClick={() => onAdd(product)}
          >
            {soldOut ? "Unavailable" : "Add to cart"}
          </Button>
          <IconButton
            icon="eye"
            variant="secondary"
            size="l"
            ariaLabel={`Quick view ${product.name}`}
            tooltip="Quick view"
            onClick={() => onQuickView(product)}
          />
        </Row>
      </Row>

      <Column padding="16" gap="8" flex={1}>
        <Row fillWidth horizontal="between" vertical="center" gap="8">
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {product.brand} · {product.categoryLabel}
          </Text>
          <Stars rating={product.rating} />
        </Row>

        <Heading as="h3" variant="heading-strong-s">
          {product.name}
        </Heading>

        <Text variant="body-default-xs" onBackground="neutral-weak">
          {product.swatches} · {product.reviews.toLocaleString("en-US")} reviews
        </Text>

        <Row gap="8" vertical="end" paddingTop="4" wrap>
          <Text variant="heading-strong-m">{money.format(product.price)}</Text>
          {product.compareAt && (
            <>
              <Text
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ textDecoration: "line-through" }}
              >
                <VisuallyHidden>Original price </VisuallyHidden>
                {money.format(product.compareAt)}
              </Text>
              <Text variant="label-default-s" onBackground="danger-strong">
                −{discount}%
              </Text>
            </>
          )}
        </Row>
      </Column>
    </Column>
  );
}

function ProductSkeleton({ index }: { index: number }) {
  const delay = index * 80;
  return (
    <Column
      as="li"
      fill
      background="surface"
      border
      radius="l"
      overflow="hidden"
      aria-hidden="true"
      style={{ listStyle: "none" }}
    >
      <Skeleton shape="block" fillWidth aspectRatio="4 / 3" radius="none" delay={delay} />
      <Column padding="16" gap="12">
        <Row fillWidth horizontal="between" gap="16">
          <Skeleton shape="line" size="xs" width={8} delay={delay + 40} />
          <Skeleton shape="line" size="xs" width={4} delay={delay + 40} />
        </Row>
        <Skeleton shape="line" size="m" fillWidth delay={delay + 80} />
        <Skeleton shape="line" size="s" width={14} delay={delay + 120} />
        <Skeleton shape="line" size="l" width={6} delay={delay + 160} />
      </Column>
    </Column>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    setStatus("Loading products");
    timer.current = setTimeout(() => {
      setLoading(false);
      setStatus("Products loaded");
    }, LOADING_MS);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => {
      setLoading(false);
      setStatus("Products loaded");
    }, LOADING_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const visible = useMemo(() => {
    const list = PRODUCTS.filter((p) => category === "all" || p.category === category);
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

  const cartCount = Object.values(cart).reduce((sum, n) => sum + n, 0);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      const product = PRODUCTS.find((p) => p.id === id);
      if (next.has(id)) {
        next.delete(id);
        setStatus(`${product?.name ?? "Item"} removed from wishlist`);
      } else {
        next.add(id);
        setStatus(`${product?.name ?? "Item"} saved to wishlist`);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
    setStatus(`${product.name} added to cart`);
  }, []);

  const quickView = useCallback((product: Product) => {
    setStatus(`Quick view opened for ${product.name}`);
  }, []);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <style>{HOVER_CSS}</style>

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
              Spring collection
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Gear for everyday carry
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Audio, wearables, home and bags — chosen for build quality and long warranties.
            </Text>
          </Column>

          <Row gap="12" vertical="center">
            <Button
              variant="secondary"
              size="m"
              prefixIcon="refresh"
              onClick={startLoading}
              disabled={loading}
            >
              Reload
            </Button>
            <Row gap="8" vertical="center" aria-label={`Cart, ${cartCount} items`} role="group">
              <Icon name="cart" size="m" />
              <Text variant="label-default-m">
                Cart
                {cartCount > 0 ? ` (${cartCount})` : ""}
              </Text>
            </Row>
          </Row>
        </Row>

        <Row
          fillWidth
          gap="16"
          vertical="center"
          horizontal="between"
          s={{ direction: "column", vertical: "stretch" }}
        >
          <SegmentedControl
            fillWidth={false}
            value={category}
            onChange={(value) => {
              setCategory(value as Category);
              startLoading();
            }}
            buttons={CATEGORY_BUTTONS}
          />
          <Row maxWidth={16} s={{ maxWidth: 1000 }} fillWidth>
            <Select
              id="sort"
              label="Sort by"
              value={sort}
              options={SORT_OPTIONS}
              onSelect={(value) => setSort(value as Sort)}
            />
          </Row>
        </Row>

        <Column gap="16" aria-busy={loading}>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {loading ? "Loading products…" : `${visible.length} products`}
          </Text>

          {loading ? (
            <Grid
              as="ul"
              fillWidth
              columns="4"
              gap="24"
              margin="0"
              padding="0"
              l={{ columns: 3 }}
              m={{ columns: 2 }}
              s={{ columns: 2, gap: "12" }}
              xs={{ columns: 1 }}
              aria-label="Loading products"
              style={{ listStyle: "none" }}
            >
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <ProductSkeleton key={i} index={i} />
              ))}
            </Grid>
          ) : visible.length > 0 ? (
            <Grid
              as="ul"
              fillWidth
              columns="4"
              gap="24"
              margin="0"
              padding="0"
              l={{ columns: 3 }}
              m={{ columns: 2 }}
              s={{ columns: 2, gap: "12" }}
              xs={{ columns: 1 }}
              aria-label="Products"
              style={{ listStyle: "none" }}
            >
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wished={wishlist.has(product.id)}
                  onToggleWish={toggleWish}
                  onAdd={addToCart}
                  onQuickView={quickView}
                />
              ))}
            </Grid>
          ) : (
            <Column center gap="12" padding="48" background="surface" border radius="l">
              <Text variant="body-default-m" onBackground="neutral-weak">
                No products match this filter.
              </Text>
              <Button size="s" variant="secondary" onClick={() => setCategory("all")}>
                Show all products
              </Button>
            </Column>
          )}
        </Column>

        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {status}
          </span>
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
