The product visual is built from theme tokens and icons, with no external images.

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
import { useEffect, useMemo, useState } from "react";

type Category = "audio" | "desk" | "carry" | "home";
type TagScheme = "brand" | "success" | "danger" | "warning" | "neutral";
type Surface = "brand-alpha-weak" | "accent-alpha-weak" | "success-alpha-weak" | "warning-alpha-weak" | "danger-alpha-weak" | "neutral-alpha-weak";

type Product = {
  id: string;
  name: string;
  maker: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: { label: string; scheme: TagScheme };
  icon: IconName;
  surface: Surface;
  colorways: string;
};

const products: Product[] = [
  {
    id: "halo-anc",
    name: "Halo ANC Headphones",
    maker: "Northwind Audio",
    category: "audio",
    price: 249,
    compareAt: 299,
    rating: 4.7,
    reviews: 1284,
    badge: { label: "Sale", scheme: "danger" },
    icon: "volume",
    surface: "brand-alpha-weak",
    colorways: "Graphite, Sand",
  },
  {
    id: "pebble-speaker",
    name: "Pebble Portable Speaker",
    maker: "Northwind Audio",
    category: "audio",
    price: 89,
    rating: 4.5,
    reviews: 642,
    badge: { label: "New", scheme: "brand" },
    icon: "play",
    surface: "accent-alpha-weak",
    colorways: "Moss, Clay, Ink",
  },
  {
    id: "lumen-lamp",
    name: "Lumen Desk Lamp",
    maker: "Studio Fjord",
    category: "desk",
    price: 74,
    rating: 4.8,
    reviews: 913,
    badge: { label: "Best seller", scheme: "success" },
    icon: "light",
    surface: "warning-alpha-weak",
    colorways: "Oak, White",
  },
  {
    id: "arc-stand",
    name: "Arc Laptop Stand",
    maker: "Studio Fjord",
    category: "desk",
    price: 58,
    compareAt: 72,
    rating: 4.4,
    reviews: 377,
    badge: { label: "Sale", scheme: "danger" },
    icon: "computer",
    surface: "neutral-alpha-weak",
    colorways: "Silver, Black",
  },
  {
    id: "drift-keyboard",
    name: "Drift Wireless Keyboard",
    category: "desk",
    maker: "Keywright",
    price: 129,
    rating: 4.6,
    reviews: 2051,
    icon: "code",
    surface: "accent-alpha-weak",
    colorways: "Slate, Cream",
  },
  {
    id: "trail-pack",
    name: "Trailhead 22L Daypack",
    maker: "Ridgeline",
    category: "carry",
    price: 112,
    rating: 4.9,
    reviews: 488,
    badge: { label: "Low stock", scheme: "warning" },
    icon: "bookmark",
    surface: "success-alpha-weak",
    colorways: "Forest, Charcoal",
  },
  {
    id: "commuter-sleeve",
    name: "Commuter Laptop Sleeve",
    category: "carry",
    maker: "Ridgeline",
    price: 46,
    rating: 4.3,
    reviews: 219,
    icon: "folder",
    surface: "brand-alpha-weak",
    colorways: "Navy, Oat",
  },
  {
    id: "brew-kettle",
    name: "Brew Gooseneck Kettle",
    category: "home",
    maker: "Hearth & Co.",
    price: 95,
    compareAt: 120,
    rating: 4.7,
    reviews: 760,
    badge: { label: "Sale", scheme: "danger" },
    icon: "food",
    surface: "danger-alpha-weak",
    colorways: "Matte black, Copper",
  },
  {
    id: "terra-planter",
    name: "Terra Self-Watering Planter",
    category: "home",
    maker: "Hearth & Co.",
    price: 38,
    rating: 4.2,
    reviews: 154,
    badge: { label: "New", scheme: "brand" },
    icon: "paw",
    surface: "success-alpha-weak",
    colorways: "Terracotta, Stone",
  },
  {
    id: "ember-candle",
    name: "Ember Soy Candle Set",
    category: "home",
    maker: "Hearth & Co.",
    price: 32,
    rating: 4.6,
    reviews: 530,
    icon: "sparkle",
    surface: "warning-alpha-weak",
    colorways: "Cedar, Fig, Linen",
  },
  {
    id: "tilt-mouse",
    name: "Tilt Ergonomic Mouse",
    category: "desk",
    maker: "Keywright",
    price: 64,
    rating: 4.5,
    reviews: 1108,
    icon: "adjustments",
    surface: "neutral-alpha-weak",
    colorways: "Graphite, Mist",
  },
  {
    id: "voyage-duffel",
    name: "Voyage Weekend Duffel",
    category: "carry",
    maker: "Ridgeline",
    price: 148,
    rating: 4.8,
    reviews: 301,
    badge: { label: "Low stock", scheme: "warning" },
    icon: "globe",
    surface: "accent-alpha-weak",
    colorways: "Olive, Black",
  },
];

type CategoryFilter = "all" | Category;
type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const categoryButtons: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "audio", label: "Audio" },
  { value: "desk", label: "Desk" },
  { value: "carry", label: "Carry" },
  { value: "home", label: "Home" },
];

const sortButtons: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rating", label: "Top rated" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const SKELETON_COUNT = 8;

// Hover actions: revealed on hover and on keyboard focus, always visible on
// touch devices (where there is no hover) and unaffected by reduced motion.
const pageStyles = `
.pc-actions {
  opacity: 0;
  transform: translateY(0.5rem);
  transition: opacity 160ms ease, transform 160ms ease;
}
.pc-card:hover .pc-actions,
.pc-card:focus-within .pc-actions {
  opacity: 1;
  transform: none;
}
.pc-card .pc-media {
  transition: transform 240ms ease;
}
.pc-card:hover .pc-media {
  transform: scale(1.04);
}
@media (hover: none) {
  .pc-actions { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pc-actions, .pc-card .pc-media { transition: none; }
  .pc-card:hover .pc-media { transform: none; }
}
`;

function ProductCard({
  product,
  wished,
  inCart,
  onToggleWish,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  const onSale = product.compareAt !== undefined;
  const percentOff = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <Column
      as="article"
      className="pc-card"
      aria-labelledby={`${product.id}-name`}
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
    >
      <Column position="relative" fillWidth overflow="hidden" background={product.surface}>
        <Column className="pc-media" fillWidth center aspectRatio="4 / 3">
          <Icon name={product.icon} size="xl" onBackground="neutral-medium" />
        </Column>

        {product.badge && (
          <Row position="absolute" top="12" left="12">
            <Tag size="s" scheme={product.badge.scheme}>
              {product.badge.label}
            </Tag>
          </Row>
        )}

        <Row
          className="pc-actions"
          position="absolute"
          bottom="12"
          left="12"
          right="12"
          gap="8"
          horizontal="between"
          vertical="center"
        >
          <Button
            size="s"
            variant={inCart ? "secondary" : "primary"}
            prefixIcon={inCart ? "check" : "cart"}
            onClick={() => onAddToCart(product)}
            aria-label={
              inCart ? `${product.name} is in your cart` : `Add ${product.name} to cart`
            }
          >
            {inCart ? "In cart" : "Add to cart"}
          </Button>
          <Row gap="8">
            <IconButton
              icon="eye"
              size="s"
              variant="secondary"
              tooltip="Quick view"
              ariaLabel={`Quick view ${product.name}`}
              onClick={() => onQuickView(product)}
            />
            <IconButton
              icon={wished ? "heart" : "heart"}
              size="s"
              variant={wished ? "primary" : "secondary"}
              tooltip={wished ? "Remove from wishlist" : "Save to wishlist"}
              ariaLabel={
                wished
                  ? `Remove ${product.name} from wishlist`
                  : `Save ${product.name} to wishlist`
              }
              aria-pressed={wished}
              onClick={() => onToggleWish(product)}
            />
          </Row>
        </Row>
      </Column>

      <Column padding="16" gap="12" fillWidth>
        <Column gap="4">
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {product.maker}
          </Text>
          <Heading as="h3" variant="heading-strong-m" id={`${product.id}-name`}>
            {product.name}
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {product.colorways}
          </Text>
        </Column>

        <Row gap="4" vertical="center">
          <Icon name="starFill" size="xs" onBackground="warning-strong" />
          <Text variant="label-default-s">{product.rating.toFixed(1)}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            ({product.reviews.toLocaleString("en-US")} reviews)
          </Text>
          <VisuallyHidden>{`Rated ${product.rating} out of 5`}</VisuallyHidden>
        </Row>

        <Row gap="8" vertical="center" wrap>
          <Text variant="heading-strong-l">{currency.format(product.price)}</Text>
          {onSale && product.compareAt !== undefined && (
            <>
              <Text
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ textDecoration: "line-through" }}
              >
                <VisuallyHidden>Was </VisuallyHidden>
                {currency.format(product.compareAt)}
              </Text>
              <Text variant="label-default-s" onBackground="danger-medium">
                {percentOff}% off
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
    <Column background="surface" border radius="l" overflow="hidden" fillWidth aria-hidden="true">
      <Skeleton shape="block" fillWidth aspectRatio="4 / 3" delay={delay} radius="none" />
      <Column padding="16" gap="12" fillWidth>
        <Column gap="8">
          <Skeleton shape="line" size="xs" width={6} delay={delay} />
          <Skeleton shape="line" size="l" fillWidth delay={delay} />
          <Skeleton shape="line" size="xs" width={10} delay={delay} />
        </Column>
        <Skeleton shape="line" size="s" width={12} delay={delay} />
        <Row gap="8" vertical="center">
          <Skeleton shape="line" size="l" width={5} delay={delay} />
          <Skeleton shape="line" size="s" width={4} delay={delay} />
        </Row>
      </Column>
    </Column>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<ReadonlySet<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");

  // Simulated fetch: show skeletons first, then reveal products.
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const visible = useMemo(() => {
    const filtered = products.filter((p) => category === "all" || p.category === category);
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [category, sort]);

  const toggleWish = (product: Product) => {
    const next = new Set(wishlist);
    if (next.has(product.id)) {
      next.delete(product.id);
      setAnnouncement(`${product.name} removed from wishlist.`);
    } else {
      next.add(product.id);
      setAnnouncement(`${product.name} saved to wishlist.`);
    }
    setWishlist(next);
  };

  const addToCart = (product: Product) => {
    if (cart.has(product.id)) {
      setAnnouncement(`${product.name} is already in your cart.`);
      return;
    }
    const next = new Set(cart);
    next.add(product.id);
    setCart(next);
    setAnnouncement(`${product.name} added to cart.`);
  };

  const quickView = (product: Product) => {
    setAnnouncement(
      `${product.name} by ${product.maker}, ${currency.format(product.price)}. Available in ${product.colorways}.`,
    );
  };

  const reload = () => {
    setAnnouncement("Refreshing products.");
    setLoading(true);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <style>{pageStyles}</style>

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
            <Heading as="h1" variant="display-strong-s">
              Everyday gear, well made
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Audio, desk, carry and home essentials from independent makers.
            </Text>
          </Column>
          <Row gap="8" vertical="center">
            <Tag size="l" scheme="neutral" prefixIcon="heart">
              {`${wishlist.size} saved`}
            </Tag>
            <Tag size="l" scheme="brand" prefixIcon="cart">
              {`${cart.size} in cart`}
            </Tag>
          </Row>
        </Row>

        <Row fillWidth gap="16" vertical="center" s={{ direction: "column", vertical: "stretch" }}>
          <Column flex={1} gap="8">
            <VisuallyHidden id="category-label">Filter by category</VisuallyHidden>
            <SegmentedControl
              aria-labelledby="category-label"
              value={category}
              onChange={(value) => setCategory(value as CategoryFilter)}
              buttons={categoryButtons}
            />
          </Column>
          <Column flex={1} gap="8">
            <VisuallyHidden id="sort-label">Sort products</VisuallyHidden>
            <SegmentedControl
              aria-labelledby="sort-label"
              value={sort}
              onChange={(value) => setSort(value as SortKey)}
              buttons={sortButtons}
            />
          </Column>
          <Button
            variant="tertiary"
            prefixIcon="refresh"
            onClick={reload}
            disabled={loading}
            aria-label="Reload products to preview the loading state"
          >
            Preview loading
          </Button>
        </Row>

        <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
          {loading
            ? "Loading products…"
            : `Showing ${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </Text>

        {loading ? (
          <Grid
            as="div"
            columns="4"
            gap="24"
            fillWidth
            l={{ columns: 3 }}
            m={{ columns: 2 }}
            s={{ columns: 1 }}
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProductCardSkeleton key={i} index={i} />
            ))}
          </Grid>
        ) : visible.length > 0 ? (
          <Grid
            as="div"
            columns="4"
            gap="24"
            fillWidth
            l={{ columns: 3 }}
            m={{ columns: 2 }}
            s={{ columns: 1 }}
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
          </Grid>
        ) : (
          <Column background="surface" border radius="l" padding="48" center gap="16">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No products match this filter.
            </Text>
            <Button variant="secondary" onClick={() => setCategory("all")}>
              Show all products
            </Button>
          </Column>
        )}

        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {announcement}
          </span>
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
```