"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Column,
  Grid,
  Heading,
  IconButton,
  Row,
  SegmentedControl,
  Skeleton,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";

type Category = "all" | "audio" | "home" | "wearables" | "bags";
type SortKey = "featured" | "price-asc" | "price-desc" | "rating";
type TagScheme = "brand" | "success" | "danger" | "accent" | "info" | "warning";
type ArtKind = "headphones" | "lamp" | "watch" | "bag" | "speaker" | "mug" | "keyboard" | "bottle";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: Exclude<Category, "all">;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: { label: string; scheme: TagScheme };
  colorway: string;
  art: ArtKind;
  /** Two CSS custom-property colour stops for the placeholder artwork. */
  hue: [string, string];
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Halden Studio Headphones",
    brand: "Northwave",
    category: "audio",
    price: 249,
    compareAt: 299,
    rating: 4.8,
    reviews: 1284,
    tag: { label: "Save 17%", scheme: "danger" },
    colorway: "Graphite",
    art: "headphones",
    hue: ["var(--neutral-alpha-medium)", "var(--brand-alpha-weak)"],
  },
  {
    id: "p2",
    name: "Arc Desk Lamp",
    brand: "Lumen & Co.",
    category: "home",
    price: 129,
    rating: 4.6,
    reviews: 642,
    tag: { label: "New", scheme: "brand" },
    colorway: "Brushed brass",
    art: "lamp",
    hue: ["var(--warning-alpha-weak)", "var(--neutral-alpha-weak)"],
  },
  {
    id: "p3",
    name: "Meridian Field Watch",
    brand: "Kestrel",
    category: "wearables",
    price: 389,
    rating: 4.9,
    reviews: 417,
    tag: { label: "Bestseller", scheme: "success" },
    colorway: "Forest green",
    art: "watch",
    hue: ["var(--success-alpha-weak)", "var(--neutral-alpha-weak)"],
  },
  {
    id: "p4",
    name: "Tidewater Weekender",
    brand: "Oak & Rope",
    category: "bags",
    price: 168,
    compareAt: 210,
    rating: 4.5,
    reviews: 903,
    tag: { label: "Save 20%", scheme: "danger" },
    colorway: "Waxed canvas",
    art: "bag",
    hue: ["var(--accent-alpha-weak)", "var(--neutral-alpha-weak)"],
  },
  {
    id: "p5",
    name: "Pebble Bluetooth Speaker",
    brand: "Northwave",
    category: "audio",
    price: 89,
    rating: 4.4,
    reviews: 2210,
    colorway: "Sandstone",
    art: "speaker",
    hue: ["var(--neutral-alpha-weak)", "var(--info-alpha-weak)"],
  },
  {
    id: "p6",
    name: "Kiln Ceramic Mug Set",
    brand: "Fieldhouse",
    category: "home",
    price: 46,
    rating: 4.7,
    reviews: 358,
    tag: { label: "Low stock", scheme: "warning" },
    colorway: "Speckled white · set of 4",
    art: "mug",
    hue: ["var(--neutral-alpha-weak)", "var(--warning-alpha-weak)"],
  },
  {
    id: "p7",
    name: "Slate 75 Mechanical Keyboard",
    brand: "Typeform Labs",
    category: "wearables",
    price: 159,
    rating: 4.7,
    reviews: 776,
    tag: { label: "New", scheme: "brand" },
    colorway: "Slate / Linear switches",
    art: "keyboard",
    hue: ["var(--brand-alpha-weak)", "var(--neutral-alpha-medium)"],
  },
  {
    id: "p8",
    name: "Summit Insulated Bottle",
    brand: "Kestrel",
    category: "bags",
    price: 38,
    compareAt: 45,
    rating: 4.3,
    reviews: 1530,
    tag: { label: "Save 16%", scheme: "danger" },
    colorway: "Matte black · 750 ml",
    art: "bottle",
    hue: ["var(--info-alpha-weak)", "var(--neutral-alpha-weak)"],
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All products",
  audio: "Audio",
  home: "Home",
  wearables: "Wearables & tech",
  bags: "Bags & carry",
};

const SORT_BUTTONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rating", label: "Top rated" },
];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => priceFormatter.format(value);

const HOVER_CSS = `
.pc-card { transition: transform 200ms ease, box-shadow 200ms ease; }
.pc-card:hover { transform: translateY(-2px); }
.pc-card:focus-within { transform: translateY(-2px); }
.pc-actions { opacity: 0; transform: translateY(6px); transition: opacity 180ms ease, transform 180ms ease; }
.pc-card:hover .pc-actions,
.pc-card:focus-within .pc-actions { opacity: 1; transform: translateY(0); }
.pc-wish { opacity: 0; transition: opacity 180ms ease; }
.pc-card:hover .pc-wish,
.pc-card:focus-within .pc-wish,
.pc-wish[data-active="true"] { opacity: 1; }
.pc-link::after { content: ""; position: absolute; inset: 0; z-index: 0; border-radius: inherit; }
.pc-link:focus-visible { outline: none; }
.pc-card:has(.pc-link:focus-visible) { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.pc-art { transition: transform 400ms ease; }
.pc-card:hover .pc-art { transform: scale(1.04); }
@media (hover: none) {
  .pc-actions, .pc-wish { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pc-card, .pc-actions, .pc-wish, .pc-art { transition: none; }
  .pc-card:hover, .pc-card:focus-within { transform: none; }
  .pc-card:hover .pc-art { transform: none; }
}
`;

function ProductArt({ kind }: { kind: ArtKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      viewBox="0 0 200 200"
      width="58%"
      height="58%"
      aria-hidden="true"
      focusable="false"
      style={{ color: "var(--neutral-on-background-strong)", opacity: 0.85 }}
    >
      {kind === "headphones" && (
        <g {...common}>
          <path d="M40 120v-18a60 60 0 0 1 120 0v18" />
          <rect x="30" y="116" width="28" height="48" rx="12" />
          <rect x="142" y="116" width="28" height="48" rx="12" />
        </g>
      )}
      {kind === "lamp" && (
        <g {...common}>
          <path d="M60 168h60" />
          <path d="M90 168V96l36-48" />
          <path d="M110 40l46 30-26 20z" />
          <circle cx="90" cy="96" r="5" />
        </g>
      )}
      {kind === "watch" && (
        <g {...common}>
          <rect x="62" y="64" width="76" height="76" rx="22" />
          <path d="M78 64l6-30h32l6 30M78 140l6 30h32l6-30" />
          <path d="M100 86v16l12 8" />
        </g>
      )}
      {kind === "bag" && (
        <g {...common}>
          <path d="M44 84h112l10 80H34z" />
          <path d="M72 84V68a28 28 0 0 1 56 0v16" />
          <path d="M44 120h112" />
        </g>
      )}
      {kind === "speaker" && (
        <g {...common}>
          <rect x="54" y="40" width="92" height="124" rx="30" />
          <circle cx="100" cy="112" r="26" />
          <circle cx="100" cy="112" r="8" />
          <circle cx="100" cy="68" r="4" />
        </g>
      )}
      {kind === "mug" && (
        <g {...common}>
          <path d="M52 70h82v62a28 28 0 0 1-28 28H80a28 28 0 0 1-28-28z" />
          <path d="M134 84h12a16 16 0 0 1 0 32h-12" />
          <path d="M80 44c0 8 8 8 8 16M104 44c0 8 8 8 8 16" />
        </g>
      )}
      {kind === "keyboard" && (
        <g {...common}>
          <rect x="22" y="66" width="156" height="78" rx="12" />
          <path d="M42 88h8M62 88h8M82 88h8M102 88h8M122 88h8M142 88h16" />
          <path d="M42 106h14M68 106h8M88 106h8M108 106h8M128 106h8M148 106h10" />
          <path d="M56 124h88" />
        </g>
      )}
      {kind === "bottle" && (
        <g {...common}>
          <path d="M86 28h28v20H86z" />
          <path d="M80 48h40a14 14 0 0 1 14 14v94a16 16 0 0 1-16 16H82a16 16 0 0 1-16-16V62a14 14 0 0 1 14-14z" />
          <path d="M66 96h68" />
        </g>
      )}
    </svg>
  );
}

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <Row gap="4" vertical="center">
      <Text as="span" variant="label-default-s" onBackground="warning-strong" aria-hidden="true">
        ★
      </Text>
      <Text as="span" variant="label-strong-s">
        {rating.toFixed(1)}
      </Text>
      <Text as="span" variant="label-default-s" onBackground="neutral-weak">
        ({reviews.toLocaleString("en-US")})
      </Text>
      <span className="sr-only-rating" style={visuallyHidden}>
        Rated {rating.toFixed(1)} out of 5 from {reviews.toLocaleString("en-US")} reviews
      </span>
    </Row>
  );
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

interface ProductCardProps {
  product: Product;
  wished: boolean;
  onToggleWish: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({ product, wished, onToggleWish, onAddToCart, onQuickView }: ProductCardProps) {
  const discounted = typeof product.compareAt === "number";

  return (
    <Column
      as="li"
      className="pc-card"
      position="relative"
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
      style={{ listStyle: "none" }}
    >
      {/* Image area */}
      <Row
        position="relative"
        fillWidth
        center
        overflow="hidden"
        aspectRatio="4 / 3"
        style={{
          background: `linear-gradient(145deg, ${product.hue[0]}, ${product.hue[1]})`,
        }}
      >
        <Row className="pc-art" fill center>
          <ProductArt kind={product.art} />
        </Row>

        {product.tag && (
          <Row position="absolute" top="12" left="12" zIndex={1} pointerEvents="none">
            <Tag scheme={product.tag.scheme} size="m" label={product.tag.label} />
          </Row>
        )}

        <Row
          className="pc-wish"
          data-active={wished ? "true" : "false"}
          position="absolute"
          top="8"
          right="8"
          zIndex={2}
        >
          <IconButton
            icon="heart"
            variant={wished ? "primary" : "secondary"}
            size="m"
            rounded
            aria-pressed={wished}
            ariaLabel={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            tooltip={wished ? "Saved" : "Save"}
            onClick={() => onToggleWish(product.id)}
          />
        </Row>

        <Row
          className="pc-actions"
          position="absolute"
          bottom="12"
          left="12"
          right="12"
          zIndex={2}
          gap="8"
        >
          <Button
            variant="primary"
            size="m"
            prefixIcon="cart"
            label="Add to cart"
            fillWidth
            onClick={() => onAddToCart(product)}
          />
          <IconButton
            icon="eye"
            variant="secondary"
            size="m"
            ariaLabel={`Quick view ${product.name}`}
            tooltip="Quick view"
            onClick={() => onQuickView(product)}
          />
        </Row>
      </Row>

      {/* Details */}
      <Column padding="16" gap="8" fillWidth>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {product.brand} · {CATEGORY_LABELS[product.category]}
        </Text>
        <Heading as="h3" variant="heading-strong-m">
          <a
            href={`#${product.id}`}
            className="pc-link"
            style={{ color: "inherit", textDecoration: "none" }}
            onClick={(event) => event.preventDefault()}
          >
            {product.name}
          </a>
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {product.colorway}
        </Text>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Row gap="8" vertical="baseline" vertical-align="center" wrap>
            <Text as="span" variant="heading-strong-l">
              {formatPrice(product.price)}
              {discounted && <span style={visuallyHidden}> current price</span>}
            </Text>
            {discounted && product.compareAt !== undefined && (
              <Text
                as="s"
                variant="body-default-s"
                onBackground="neutral-weak"
              >
                <span style={visuallyHidden}>Original price </span>
                {formatPrice(product.compareAt)}
              </Text>
            )}
          </Row>
          <Stars rating={product.rating} reviews={product.reviews} />
        </Row>
      </Column>
    </Column>
  );
}

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = index * 80;
  return (
    <Column
      as="li"
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
      aria-hidden="true"
      style={{ listStyle: "none" }}
    >
      <Skeleton shape="block" fillWidth delay={delay} style={{ aspectRatio: "4 / 3", borderRadius: 0 }} />
      <Column padding="16" gap="12" fillWidth>
        <Skeleton shape="line" size="s" delay={delay} style={{ width: "40%" }} />
        <Skeleton shape="line" size="l" delay={delay} style={{ width: "85%" }} />
        <Skeleton shape="line" size="s" delay={delay} style={{ width: "55%" }} />
        <Row horizontal="between" vertical="center" gap="8">
          <Skeleton shape="line" size="l" delay={delay} style={{ width: "30%" }} />
          <Skeleton shape="line" size="s" delay={delay} style={{ width: "25%" }} />
        </Row>
      </Column>
    </Column>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const simulateLoad = useCallback((duration = 1600) => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), duration);
  }, []);

  useEffect(() => {
    simulateLoad(1800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [simulateLoad]);

  const visible = useMemo(() => {
    const filtered = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [category, sort]);

  const toggleWish = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const next = new Set(prev);
        const product = PRODUCTS.find((p) => p.id === id);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          if (product) addToast({ variant: "success", message: <>Saved “{product.name}” to your wishlist.</> });
        }
        return next;
      });
    },
    [addToast],
  );

  const addToCart = useCallback(
    (product: Product) => {
      setCartCount((count) => count + 1);
      addToast({ variant: "success", message: <>Added “{product.name}” to your cart.</> });
    },
    [addToast],
  );

  const quickView = useCallback(
    (product: Product) => {
      addToast({
        variant: "info",
        message: (
          <>
            {product.name} — {product.colorway}, {formatPrice(product.price)}.
          </>
        ),
      });
    },
    [addToast],
  );

  const categories = Object.keys(CATEGORY_LABELS) as Category[];

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      <style>{HOVER_CSS}</style>
      <Column maxWidth="xl" fillWidth gap="32">
        {/* Header */}
        <Row horizontal="between" vertical="end" gap="16" s={{ direction: "column", vertical: "start" }}>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Spring collection
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Everyday gear, made to last
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
              Thoughtfully built audio, home and carry essentials with free returns for 60 days.
            </Text>
          </Column>
          <Row gap="12" vertical="center">
            <Button
              variant="secondary"
              prefixIcon="refresh"
              label="Reload products"
              loading={loading}
              onClick={() => simulateLoad(1600)}
            />
            <Row gap="8" vertical="center" background="surface" border radius="full" paddingX="16" paddingY="8">
              <Text as="span" variant="label-default-m">
                Cart
              </Text>
              <Tag scheme="brand" size="m" label={String(cartCount)} />
              <span style={visuallyHidden} role="status" aria-live="polite">
                {cartCount} {cartCount === 1 ? "item" : "items"} in cart
              </span>
            </Row>
          </Row>
        </Row>

        {/* Filters */}
        <Column gap="16">
          <Row
            as="div"
            gap="8"
            wrap
            role="group"
            aria-label="Filter by category"
          >
            {categories.map((key) => (
              <Button
                key={key}
                size="m"
                rounded
                variant={category === key ? "primary" : "secondary"}
                label={CATEGORY_LABELS[key]}
                aria-pressed={category === key}
                onClick={() => {
                  setCategory(key);
                  simulateLoad(700);
                }}
              />
            ))}
          </Row>
          <Row horizontal="between" vertical="center" gap="16" s={{ direction: "column", vertical: "start" }}>
            <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
              {loading ? "Loading products…" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
            </Text>
            <Row maxWidth={32} fillWidth s={{ maxWidth: 80 }} style={{ maxWidth: 420 }}>
              <SegmentedControl
                compact
                buttons={SORT_BUTTONS}
                defaultValue="featured"
                onChange={(value) => setSort(value as SortKey)}
              />
            </Row>
          </Row>
        </Column>

        {/* Grid */}
        <Grid
          as="ul"
          columns="4"
          gap="24"
          fillWidth
          padding="0"
          margin="0"
          l={{ columns: "3" }}
          m={{ columns: "2" }}
          s={{ columns: "2", gap: "16" }}
          xs={{ columns: "1" }}
          aria-busy={loading}
          aria-label="Products"
          style={{ listStyle: "none" }}
        >
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={`sk-${i}`} index={i} />)
            : visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wished={wishlist.has(product.id)}
                  onToggleWish={toggleWish}
                  onAddToCart={addToCart}
                  onQuickView={quickView}
                />
              ))}
        </Grid>

        {!loading && visible.length === 0 && (
          <Column center gap="16" paddingY="64" background="surface" border radius="l">
            <Heading as="h2" variant="heading-strong-l">
              Nothing in this category yet
            </Heading>
            <Button label="Show all products" onClick={() => setCategory("all")} />
          </Column>
        )}
      </Column>
    </Column>
  );
}
