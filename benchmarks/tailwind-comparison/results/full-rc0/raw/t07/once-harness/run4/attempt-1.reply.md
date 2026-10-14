```tsx
"use client";

import {
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  IconButton,
  Row,
  SegmentedControl,
  Skeleton,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Category = "all" | "audio" | "wearables" | "home" | "desk";

type TagScheme = "neutral" | "brand" | "success" | "danger" | "warning" | "info" | "accent";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: Exclude<Category, "all">;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: { label: string; scheme: TagScheme; icon?: IconName };
  icon: IconName;
  swatches: { label: string; color: string }[];
  gradient: { x: number; y: number; start: string; end: string };
  inStock: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: "aurora-anc",
    name: "Aurora ANC Headphones",
    brand: "Northwind Audio",
    category: "audio",
    price: 249,
    compareAt: 329,
    rating: 4.7,
    reviews: 1284,
    tag: { label: "Save 24%", scheme: "danger", icon: "tag" },
    icon: "volume",
    swatches: [
      { label: "Graphite", color: "#2b2d33" },
      { label: "Sand", color: "#d6c8b0" },
      { label: "Sage", color: "#9bb09a" },
    ],
    gradient: { x: 30, y: 25, start: "brand-alpha-medium", end: "accent-alpha-weak" },
    inStock: true,
  },
  {
    id: "pulse-buds",
    name: "Pulse Wireless Earbuds",
    brand: "Northwind Audio",
    category: "audio",
    price: 129,
    rating: 4.4,
    reviews: 862,
    tag: { label: "New", scheme: "brand", icon: "sparkle" },
    icon: "play",
    swatches: [
      { label: "Chalk", color: "#ecebe6" },
      { label: "Ink", color: "#1c1d22" },
    ],
    gradient: { x: 70, y: 30, start: "accent-alpha-medium", end: "brand-alpha-weak" },
    inStock: true,
  },
  {
    id: "ridge-watch",
    name: "Ridge GPS Trail Watch",
    brand: "Kestrel",
    category: "wearables",
    price: 379,
    rating: 4.8,
    reviews: 413,
    tag: { label: "Best seller", scheme: "success", icon: "trendUp" },
    icon: "time",
    swatches: [
      { label: "Moss", color: "#5d6b4a" },
      { label: "Slate", color: "#4a5563" },
      { label: "Ember", color: "#b4522f" },
    ],
    gradient: { x: 50, y: 70, start: "success-alpha-medium", end: "brand-alpha-weak" },
    inStock: true,
  },
  {
    id: "loop-band",
    name: "Loop Fitness Band 3",
    brand: "Kestrel",
    category: "wearables",
    price: 79,
    compareAt: 99,
    rating: 4.2,
    reviews: 2210,
    tag: { label: "Save 20%", scheme: "danger", icon: "tag" },
    icon: "bolt",
    swatches: [
      { label: "Coral", color: "#e0705a" },
      { label: "Mist", color: "#b9c7d3" },
    ],
    gradient: { x: 25, y: 60, start: "warning-alpha-medium", end: "danger-alpha-weak" },
    inStock: true,
  },
  {
    id: "lumen-lamp",
    name: "Lumen Ceramic Table Lamp",
    brand: "Hearth & Oak",
    category: "home",
    price: 94,
    rating: 4.6,
    reviews: 307,
    tag: { label: "Only 3 left", scheme: "warning", icon: "warning" },
    icon: "sparkle",
    swatches: [
      { label: "Bone", color: "#e8e2d4" },
      { label: "Clay", color: "#b98568" },
    ],
    gradient: { x: 60, y: 35, start: "warning-alpha-medium", end: "accent-alpha-weak" },
    inStock: true,
  },
  {
    id: "mist-diffuser",
    name: "Mist Ultrasonic Diffuser",
    brand: "Hearth & Oak",
    category: "home",
    price: 56,
    rating: 4.1,
    reviews: 598,
    tag: { label: "Sold out", scheme: "neutral", icon: "info" },
    icon: "opacity",
    swatches: [
      { label: "Walnut", color: "#6b4c36" },
      { label: "Ash", color: "#c9c2b6" },
    ],
    gradient: { x: 40, y: 40, start: "info-alpha-medium", end: "brand-alpha-weak" },
    inStock: false,
  },
  {
    id: "vertex-desk",
    name: "Vertex Standing Desk Frame",
    brand: "Fieldwork",
    category: "desk",
    price: 489,
    compareAt: 549,
    rating: 4.9,
    reviews: 176,
    tag: { label: "Editor's pick", scheme: "accent", icon: "star" },
    icon: "screen",
    swatches: [
      { label: "Black", color: "#16171b" },
      { label: "White", color: "#f1f1ee" },
    ],
    gradient: { x: 75, y: 65, start: "accent-alpha-medium", end: "info-alpha-weak" },
    inStock: true,
  },
  {
    id: "grid-keyboard",
    name: "Grid 75 Mechanical Keyboard",
    brand: "Fieldwork",
    category: "desk",
    price: 159,
    rating: 4.5,
    reviews: 941,
    tag: { label: "New", scheme: "brand", icon: "sparkle" },
    icon: "computer",
    swatches: [
      { label: "Fog", color: "#c8ccd1" },
      { label: "Night", color: "#22252b" },
      { label: "Rose", color: "#d9a5a5" },
    ],
    gradient: { x: 35, y: 70, start: "brand-alpha-medium", end: "info-alpha-weak" },
    inStock: true,
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All products",
  audio: "Audio",
  wearables: "Wearables",
  home: "Home",
  desk: "Desk setup",
};

const CATEGORY_BUTTONS = (Object.keys(CATEGORY_LABELS) as Category[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => priceFormatter.format(value);

const SKELETON_COUNT = 8;
const LOAD_DURATION_MS = 1400;

const CARD_STYLES = `
.pc-media .pc-actions,
.pc-media .pc-cta {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 180ms ease, transform 180ms ease;
}
.pc-card:hover .pc-actions,
.pc-card:hover .pc-cta,
.pc-card:focus-within .pc-actions,
.pc-card:focus-within .pc-cta {
  opacity: 1;
  transform: translateY(0);
}
.pc-card {
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.pc-card:hover {
  transform: translateY(-2px);
}
.pc-art {
  transition: transform 400ms ease;
}
.pc-card:hover .pc-art {
  transform: scale(1.05);
}
@media (hover: none) {
  .pc-media .pc-actions,
  .pc-media .pc-cta {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pc-media .pc-actions,
  .pc-media .pc-cta,
  .pc-card,
  .pc-art {
    transition: none;
  }
  .pc-card:hover,
  .pc-card:hover .pc-art {
    transform: none;
  }
}
`;

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <Row gap="4" vertical="center">
      <Icon name="starFill" size="xs" onBackground="warning-strong" />
      <Text variant="label-default-s">
        <VisuallyHidden>Rated </VisuallyHidden>
        {rating.toFixed(1)}
        <VisuallyHidden> out of 5 stars</VisuallyHidden>
      </Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        ({reviews.toLocaleString("en-US")}
        <VisuallyHidden> reviews</VisuallyHidden>)
      </Text>
    </Row>
  );
}

type ProductCardProps = {
  product: Product;
  wishlisted: boolean;
  inCart: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

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
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  return (
    <Column
      as="article"
      aria-labelledby={titleId}
      className="pc-card"
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
    >
      <Column className="pc-media" position="relative" aspectRatio="4 / 3" overflow="hidden" fillWidth>
        <Column
          className="pc-art"
          position="absolute"
          top="0"
          left="0"
          fill
          background="neutral-alpha-weak"
          pointerEvents="none"
        >
          <Background
            position="absolute"
            top="0"
            left="0"
            fill
            gradient={{
              display: true,
              x: product.gradient.x,
              y: product.gradient.y,
              width: 180,
              height: 180,
              tilt: 0,
              colorStart: product.gradient.start,
              colorEnd: product.gradient.end,
              opacity: 100,
            }}
            dots={{ display: true, size: "24", opacity: 30, color: "neutral-alpha-medium" }}
          />
          <Row fill center>
            <Row center padding="24" radius="full" background="surface" border shadow="m">
              <Icon name={product.icon} size="xl" onBackground="neutral-strong" decorative />
            </Row>
          </Row>
        </Column>

        {product.tag && (
          <Row position="absolute" top="12" left="12">
            <Tag size="m" scheme={product.tag.scheme} prefixIcon={product.tag.icon}>
              {product.tag.label}
            </Tag>
          </Row>
        )}

        <Column className="pc-actions" position="absolute" top="12" right="12" gap="8">
          <IconButton
            icon={wishlisted ? "like" : "heart"}
            variant={wishlisted ? "primary" : "secondary"}
            rounded
            tooltip={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            tooltipPosition="left"
            ariaLabel={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={wishlisted}
            onClick={() => onToggleWishlist(product)}
          />
          <IconButton
            icon="eye"
            variant="secondary"
            rounded
            tooltip="Quick view"
            tooltipPosition="left"
            ariaLabel={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
          />
        </Column>

        <Row className="pc-cta" position="absolute" bottom="12" left="12" right="12">
          <Button
            fillWidth
            size="m"
            variant={inCart ? "secondary" : "primary"}
            prefixIcon={inCart ? "check" : "cart"}
            disabled={!product.inStock}
            onClick={() => onAddToCart(product)}
            aria-label={
              !product.inStock
                ? `${product.name} is sold out`
                : inCart
                  ? `${product.name} added to cart. Add another`
                  : `Add ${product.name} to cart`
            }
          >
            {!product.inStock ? "Sold out" : inCart ? "Added" : "Add to cart"}
          </Button>
        </Row>
      </Column>

      <Column padding="16" gap="12" flex={1}>
        <Column gap="4">
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {product.brand}
          </Text>
          <Heading as="h3" id={titleId} variant="heading-strong-s" wrap="pretty">
            {product.name}
          </Heading>
        </Column>

        <Rating rating={product.rating} reviews={product.reviews} />

        <Row gap="4" vertical="center" aria-label="Available colors" role="list">
          {product.swatches.map((swatch) => (
            <Row
              key={swatch.label}
              role="listitem"
              aria-label={swatch.label}
              title={swatch.label}
              width="16"
              height="16"
              radius="full"
              border
              style={{ background: swatch.color }}
            />
          ))}
        </Row>

        <Row
          fillWidth
          vertical="end"
          horizontal="between"
          gap="8"
          wrap
          style={{ marginTop: "auto" }}
        >
          <Row gap="8" vertical="end" wrap>
            <Text variant="heading-strong-m">
              <VisuallyHidden>Price </VisuallyHidden>
              {formatPrice(product.price)}
            </Text>
            {product.compareAt && (
              <Text
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ textDecoration: "line-through" }}
              >
                <VisuallyHidden>Was </VisuallyHidden>
                {formatPrice(product.compareAt)}
              </Text>
            )}
          </Row>
          {discount > 0 && (
            <Text variant="label-default-s" onBackground="success-strong">
              {discount}% off
            </Text>
          )}
        </Row>
      </Column>
    </Column>
  );
}

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = index * 80;
  return (
    <Column background="surface" border radius="l" overflow="hidden" fillWidth aria-hidden="true">
      <Skeleton shape="block" fillWidth style={{ aspectRatio: "4 / 3" }} delay={delay} />
      <Column padding="16" gap="12">
        <Column gap="8">
          <Skeleton shape="line" size="xs" width="8" delay={delay} />
          <Skeleton shape="line" size="l" fillWidth delay={delay} />
        </Column>
        <Skeleton shape="line" size="s" width="12" delay={delay} />
        <Row gap="4">
          <Skeleton shape="circle" size="xs" delay={delay} />
          <Skeleton shape="circle" size="xs" delay={delay} />
          <Skeleton shape="circle" size="xs" delay={delay} />
        </Row>
        <Row fillWidth horizontal="between" vertical="center">
          <Skeleton shape="line" size="l" width="8" delay={delay} />
          <Skeleton shape="line" size="s" width="4" delay={delay} />
        </Row>
      </Column>
    </Column>
  );
}

export default function Page() {
  const [category, setCategory] = useState<Category>("all");
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(() => new Set());
  const [cart, setCart] = useState<Readonly<Record<string, number>>>({});
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      timer.current = null;
    }, LOAD_DURATION_MS);
  }, []);

  useEffect(() => {
    startLoading();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startLoading]);

  const visible = useMemo(
    () => PRODUCTS.filter((product) => category === "all" || product.category === category),
    [category],
  );

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0),
    [cart],
  );

  const handleToggleWishlist = useCallback(
    (product: Product) => {
      const adding = !wishlist.has(product.id);
      setWishlist((current) => {
        const next = new Set(current);
        if (adding) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
      setAnnouncement(
        adding ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`,
      );
    },
    [wishlist],
  );

  const handleAddToCart = useCallback((product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setAnnouncement(`${product.name} added to cart`);
  }, []);

  const handleQuickView = useCallback((product: Product) => {
    setAnnouncement(
      `Quick view: ${product.name}, ${formatPrice(product.price)}, rated ${product.rating.toFixed(1)} out of 5`,
    );
  }, []);

  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategory(value as Category);
      startLoading();
    },
    [startLoading],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16">
      <style>{CARD_STYLES}</style>

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
              Everyday tech, thoughtfully made
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Audio, wearables and desk gear with free returns for 60 days.
            </Text>
          </Column>

          <Row gap="12" vertical="center" wrap>
            <Row gap="8" vertical="center" aria-label="Cart summary">
              <Icon name="cart" size="s" onBackground="neutral-weak" />
              <Text variant="label-default-s">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </Text>
            </Row>
            <Button
              variant="secondary"
              size="s"
              prefixIcon="refresh"
              onClick={startLoading}
              disabled={loading}
            >
              Reload products
            </Button>
          </Row>
        </Row>

        <Row fillWidth vertical="center" horizontal="between" gap="16" wrap>
          <SegmentedControl
            fillWidth={false}
            value={category}
            onChange={handleCategoryChange}
            buttons={CATEGORY_BUTTONS}
          />
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {loading
              ? "Loading products…"
              : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
          </Text>
        </Row>

        <Grid
          as="ul"
          columns="4"
          l={{ columns: "3" }}
          m={{ columns: "2" }}
          s={{ columns: "2" }}
          xs={{ columns: "1" }}
          gap="16"
          fillWidth
          aria-busy={loading}
          aria-label="Products"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <li key={`skeleton-${index}`} style={{ display: "flex" }}>
                  <ProductCardSkeleton index={index} />
                </li>
              ))
            : visible.map((product) => (
                <li key={product.id} style={{ display: "flex" }}>
                  <ProductCard
                    product={product}
                    wishlisted={wishlist.has(product.id)}
                    inCart={(cart[product.id] ?? 0) > 0}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                  />
                </li>
              ))}
        </Grid>

        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {loading ? "Loading products" : announcement}
          </span>
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
```