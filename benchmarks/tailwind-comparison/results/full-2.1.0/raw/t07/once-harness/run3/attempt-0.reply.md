```tsx
"use client";

import {
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

type Category = "all" | "audio" | "desk" | "wearables" | "home";
type TagScheme = "brand" | "success" | "danger" | "accent" | "info" | "warning";

type Product = {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, "all">;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: { label: string; scheme: TagScheme };
  icon: IconName;
  /** Token-based tint so the art placeholder follows the theme. */
  tint: "brand" | "accent" | "info" | "success" | "warning" | "danger";
};

const PRODUCTS: Product[] = [
  {
    id: "aurora-headphones",
    name: "Aurora Wireless Headphones",
    description: "Over-ear, 40 hr battery, adaptive noise cancelling",
    category: "audio",
    price: 249,
    compareAt: 299,
    rating: 4.7,
    reviews: 1284,
    tag: { label: "Best seller", scheme: "brand" },
    icon: "volume",
    tint: "brand",
  },
  {
    id: "pebble-speaker",
    name: "Pebble Portable Speaker",
    description: "Waterproof, 360° sound, 18 hr playtime",
    category: "audio",
    price: 89,
    rating: 4.5,
    reviews: 642,
    tag: { label: "New", scheme: "success" },
    icon: "play",
    tint: "success",
  },
  {
    id: "lumen-lamp",
    name: "Lumen Desk Lamp",
    description: "Dimmable LED, warm to daylight, USB-C charging port",
    category: "desk",
    price: 74,
    rating: 4.8,
    reviews: 391,
    icon: "bolt",
    tint: "warning",
  },
  {
    id: "folio-notebook",
    name: "Folio Dot-Grid Notebook",
    description: "A5, 120 gsm paper, lay-flat binding",
    category: "desk",
    price: 18,
    compareAt: 24,
    rating: 4.6,
    reviews: 2210,
    tag: { label: "-25%", scheme: "danger" },
    icon: "book",
    tint: "accent",
  },
  {
    id: "tempo-watch",
    name: "Tempo Fitness Watch",
    description: "GPS, heart-rate tracking, 7-day battery",
    category: "wearables",
    price: 179,
    rating: 4.4,
    reviews: 873,
    tag: { label: "Limited", scheme: "accent" },
    icon: "time",
    tint: "info",
  },
  {
    id: "orbit-ring",
    name: "Orbit Sleep Ring",
    description: "Titanium smart ring with sleep and recovery scores",
    category: "wearables",
    price: 299,
    rating: 4.3,
    reviews: 215,
    icon: "sparkle",
    tint: "brand",
  },
  {
    id: "haven-diffuser",
    name: "Haven Ultrasonic Diffuser",
    description: "Whisper-quiet, 8 hr runtime, ambient light ring",
    category: "home",
    price: 42,
    compareAt: 55,
    rating: 4.6,
    reviews: 1530,
    tag: { label: "Sale", scheme: "danger" },
    icon: "heart",
    tint: "success",
  },
  {
    id: "nest-plug",
    name: "Nest Smart Plug (2-pack)",
    description: "Voice control, scheduling and energy monitoring",
    category: "home",
    price: 29,
    rating: 4.2,
    reviews: 3402,
    icon: "settings",
    tint: "info",
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All products",
  audio: "Audio",
  desk: "Desk",
  wearables: "Wearables",
  home: "Home",
};

const SKELETON_COUNT = 8;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Hover/focus reveal for card actions. Always visible on touch devices. */
const CARD_STYLES = `
.pcard-actions { opacity: 0; transform: translateY(8px); transition: opacity .2s ease, transform .2s ease; }
.pcard:hover .pcard-actions,
.pcard:focus-within .pcard-actions { opacity: 1; transform: translateY(0); }
.pcard-art { transition: transform .4s ease; }
.pcard:hover .pcard-art { transform: scale(1.04); }
.pcard { transition: box-shadow .2s ease, border-color .2s ease; }
@media (hover: none) {
  .pcard-actions { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pcard-actions, .pcard-art, .pcard { transition: none; }
  .pcard:hover .pcard-art { transform: none; }
}
`;

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <Row gap="4" vertical="center">
      <Icon name="starFill" size="xs" onBackground="warning-strong" />
      <Text variant="label-default-s">{value.toFixed(1)}</Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        ({reviews.toLocaleString("en-US")})
        <VisuallyHidden> reviews, rated {value.toFixed(1)} out of 5</VisuallyHidden>
      </Text>
    </Row>
  );
}

type CardProps = {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

function ProductCard({ product, wished, onToggleWish, onAddToCart, onQuickView }: CardProps) {
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <Column
      as="article"
      className="pcard"
      fill
      background="surface"
      border
      radius="l"
      overflow="hidden"
      aria-label={product.name}
    >
      <Row
        fillWidth
        aspectRatio="4 / 3"
        overflow="hidden"
        background={`${product.tint}-alpha-weak`}
        center
      >
        <Row
          className="pcard-art"
          fill
          center
          background={`${product.tint}-alpha-weak`}
          aria-hidden="true"
        >
          <Row
            width={80}
            height={80}
            radius="full"
            background={`${product.tint}-alpha-medium`}
            center
          >
            <Icon name={product.icon} size="xl" onBackground={`${product.tint}-strong`} />
          </Row>
        </Row>

        {product.tag && (
          <Row position="absolute" top="12" left="12">
            <Tag size="m" scheme={product.tag.scheme} label={product.tag.label} />
          </Row>
        )}

        <Row position="absolute" top="8" right="8">
          <IconButton
            icon={wished ? "heart" : "heart"}
            variant={wished ? "primary" : "secondary"}
            size="s"
            rounded
            tooltip={wished ? "Remove from wishlist" : "Add to wishlist"}
            ariaLabel={
              wished
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={wished}
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
            size="s"
            prefixIcon="cart"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </Button>
          <IconButton
            icon="eye"
            variant="secondary"
            size="m"
            tooltip="Quick view"
            ariaLabel={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
          />
        </Row>
      </Row>

      <Column padding="16" gap="8" flex={1}>
        <Text variant="label-default-xs" onBackground="neutral-weak">
          {CATEGORY_LABELS[product.category]}
        </Text>
        <Heading as="h3" variant="heading-strong-s">
          {product.name}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {product.description}
        </Text>
        <Rating value={product.rating} reviews={product.reviews} />
        <Row gap="8" vertical="end" paddingTop="4">
          <Text variant="heading-strong-m">{currency.format(product.price)}</Text>
          {product.compareAt && (
            <>
              <Text
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ textDecoration: "line-through" }}
              >
                {currency.format(product.compareAt)}
                <VisuallyHidden> original price</VisuallyHidden>
              </Text>
              <Text variant="label-default-s" onBackground="danger-strong">
                Save {discount}%
              </Text>
            </>
          )}
        </Row>
      </Column>
    </Column>
  );
}

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = index * 80;
  return (
    <Column fill background="surface" border radius="l" overflow="hidden" aria-hidden="true">
      <Skeleton shape="block" delay={delay} fillWidth aspectRatio="4 / 3" radius="none" />
      <Column padding="16" gap="12">
        <Skeleton shape="line" size="xs" delay={delay} width={8} />
        <Skeleton shape="line" size="l" delay={delay} fillWidth />
        <Skeleton shape="line" size="s" delay={delay} fillWidth />
        <Skeleton shape="line" size="s" delay={delay} width={16} />
        <Row gap="8" paddingTop="4">
          <Skeleton shape="line" size="xl" delay={delay} width={8} />
          <Skeleton shape="line" size="m" delay={delay} width={6} />
        </Row>
      </Column>
    </Column>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback((ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setStatus("Products loaded");
    }, ms);
  }, []);

  useEffect(() => {
    startLoading(1600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startLoading]);

  const visible = useMemo(
    () => PRODUCTS.filter((product) => category === "all" || product.category === category),
    [category],
  );

  const toggleWish = useCallback((product: Product) => {
    setWishlist((current) => {
      const has = current.includes(product.id);
      setStatus(
        has ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`,
      );
      return has ? current.filter((id) => id !== product.id) : [...current, product.id];
    });
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartCount((count) => count + 1);
    setStatus(`${product.name} added to cart`);
  }, []);

  const quickView = useCallback((product: Product) => {
    setStatus(
      `${product.name}: ${currency.format(product.price)}. ${product.description}`,
    );
  }, []);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <style>{CARD_STYLES}</style>

      <Column maxWidth="l" gap="32">
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
              Free shipping over $75 and 30-day returns on every order.
            </Text>
          </Column>
          <Row gap="12" vertical="center">
            <Button
              variant="secondary"
              size="s"
              prefixIcon="refresh"
              disabled={loading}
              onClick={() => startLoading(1600)}
            >
              Reload
            </Button>
            <Row gap="8" vertical="center" background="neutral-alpha-weak" radius="full" paddingX="12" paddingY="8">
              <Icon name="cart" size="s" />
              <Text variant="label-default-s">
                Cart
                <VisuallyHidden>, {cartCount} items</VisuallyHidden>
              </Text>
              <Tag size="s" scheme={cartCount > 0 ? "brand" : "neutral"} label={String(cartCount)} />
            </Row>
          </Row>
        </Row>

        <Row fillWidth horizontal="between" vertical="center" gap="16" s={{ direction: "column", horizontal: "start", vertical: "start" }}>
          <SegmentedControl
            fillWidth={false}
            value={category}
            onChange={(value) => {
              setCategory(value as Category);
              startLoading(700);
            }}
            buttons={(Object.keys(CATEGORY_LABELS) as Category[]).map((key) => ({
              value: key,
              label: CATEGORY_LABELS[key],
            }))}
          />
          <Text variant="body-default-s" onBackground="neutral-weak" aria-hidden="true">
            {loading ? "Loading products…" : `${visible.length} products`}
          </Text>
        </Row>

        <div aria-busy={loading}>
          {loading ? (
            <Grid columns="4" gap="24" l={{ columns: 3 }} m={{ columns: 3 }} s={{ columns: 2, gap: "16" }} xs={{ columns: 1 }}>
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <ProductCardSkeleton key={index} index={index} />
              ))}
            </Grid>
          ) : visible.length > 0 ? (
            <Grid
              as="ul"
              columns="4"
              gap="24"
              l={{ columns: 3 }}
              m={{ columns: 3 }}
              s={{ columns: 2, gap: "16" }}
              xs={{ columns: 1 }}
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {visible.map((product) => (
                <li key={product.id} style={{ display: "flex" }}>
                  <ProductCard
                    product={product}
                    wished={wishlist.includes(product.id)}
                    onToggleWish={toggleWish}
                    onAddToCart={addToCart}
                    onQuickView={quickView}
                  />
                </li>
              ))}
            </Grid>
          ) : (
            <Column fillWidth center gap="16" padding="64" background="surface" border radius="l">
              <Icon name="search" size="l" onBackground="neutral-weak" />
              <Text variant="body-default-m" onBackground="neutral-weak">
                No products in this category yet.
              </Text>
              <Button variant="secondary" size="s" onClick={() => setCategory("all")}>
                Show all products
              </Button>
            </Column>
          )}
        </div>

        <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
          {status}
        </div>
      </Column>
    </Column>
  );
}
```