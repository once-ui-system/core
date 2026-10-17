"use client";

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
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Category = "all" | "lighting" | "seating" | "tableware" | "textiles";
type Art = "lamp" | "chair" | "mug" | "throw" | "vase" | "stool" | "pendant" | "bowl";
type TagScheme = "brand" | "success" | "warning" | "danger" | "info" | "accent";

type Product = {
  id: string;
  name: string;
  maker: string;
  category: Exclude<Category, "all">;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: { label: string; scheme: TagScheme; icon?: IconName };
  art: Art;
  swatch: string;
};

const products: Product[] = [
  {
    id: "aster-table-lamp",
    name: "Aster Table Lamp",
    maker: "Studio Halden",
    category: "lighting",
    price: 148,
    rating: 4.8,
    reviews: 214,
    tag: { label: "Bestseller", scheme: "brand", icon: "sparkle" },
    art: "lamp",
    swatch: "Oak and linen",
  },
  {
    id: "norra-lounge-chair",
    name: "Norra Lounge Chair",
    maker: "Atelier Voss",
    category: "seating",
    price: 540,
    compareAt: 680,
    rating: 4.6,
    reviews: 97,
    tag: { label: "Save 20%", scheme: "danger", icon: "tag" },
    art: "chair",
    swatch: "Boucle, sand",
  },
  {
    id: "kiln-stoneware-mug",
    name: "Kiln Stoneware Mug",
    maker: "Marlow Ceramics",
    category: "tableware",
    price: 28,
    rating: 4.9,
    reviews: 532,
    art: "mug",
    swatch: "Matte glaze, set of 2",
  },
  {
    id: "fjell-wool-throw",
    name: "Fjell Wool Throw",
    maker: "Nord & Loom",
    category: "textiles",
    price: 96,
    rating: 4.7,
    reviews: 168,
    tag: { label: "New", scheme: "success", icon: "bolt" },
    art: "throw",
    swatch: "Merino, 130 × 180 cm",
  },
  {
    id: "ovale-bud-vase",
    name: "Ovale Bud Vase",
    maker: "Marlow Ceramics",
    category: "tableware",
    price: 42,
    rating: 4.5,
    reviews: 73,
    art: "vase",
    swatch: "Hand-thrown porcelain",
  },
  {
    id: "tove-oak-stool",
    name: "Tove Oak Stool",
    maker: "Atelier Voss",
    category: "seating",
    price: 185,
    rating: 4.8,
    reviews: 121,
    tag: { label: "Low stock", scheme: "warning", icon: "warning" },
    art: "stool",
    swatch: "Solid oak, 46 cm",
  },
  {
    id: "halo-pendant-light",
    name: "Halo Pendant Light",
    maker: "Studio Halden",
    category: "lighting",
    price: 220,
    compareAt: 260,
    rating: 4.4,
    reviews: 58,
    tag: { label: "Save 15%", scheme: "danger", icon: "tag" },
    art: "pendant",
    swatch: "Opal glass, brass",
  },
  {
    id: "sora-serving-bowl",
    name: "Sora Serving Bowl",
    maker: "Marlow Ceramics",
    category: "tableware",
    price: 64,
    rating: 4.7,
    reviews: 89,
    tag: { label: "Limited run", scheme: "info", icon: "star" },
    art: "bowl",
    swatch: "Speckled white, 28 cm",
  },
];

const categoryButtons: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lighting", label: "Lighting" },
  { value: "seating", label: "Seating" },
  { value: "tableware", label: "Tableware" },
  { value: "textiles", label: "Textiles" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const SKELETON_COUNT = 8;
const LOAD_DELAY_MS = 1600;

/* ------------------------------------------------------------------ */
/* Inline product illustrations (no network, theme-aware)              */
/* ------------------------------------------------------------------ */

function ProductArt({ art }: { art: Art }) {
  // Everything is drawn with currentColor / theme variables so it follows light and dark.
  const soft = "var(--neutral-alpha-medium)";
  const faint = "var(--neutral-alpha-weak)";
  const accent = "var(--brand-solid-strong)";

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", color: "var(--neutral-on-background-medium)" }}
    >
      <ellipse cx="100" cy="172" rx="62" ry="7" fill={faint} />
      {art === "lamp" && (
        <g>
          <path d="M66 98 L84 44 H116 L134 98 Z" fill={accent} opacity="0.85" />
          <rect x="97" y="98" width="6" height="52" rx="3" fill="currentColor" />
          <ellipse cx="100" cy="158" rx="28" ry="8" fill="currentColor" />
          <path d="M84 44 H116" stroke={soft} strokeWidth="2" />
        </g>
      )}
      {art === "chair" && (
        <g>
          <rect x="52" y="64" width="96" height="62" rx="26" fill={accent} opacity="0.85" />
          <rect x="44" y="108" width="112" height="30" rx="14" fill="currentColor" opacity="0.8" />
          <rect x="58" y="136" width="8" height="30" rx="3" fill="currentColor" />
          <rect x="134" y="136" width="8" height="30" rx="3" fill="currentColor" />
        </g>
      )}
      {art === "mug" && (
        <g>
          <path d="M62 70 H132 V128 Q132 158 97 158 Q62 158 62 128 Z" fill={accent} opacity="0.85" />
          <path
            d="M132 86 H146 Q160 86 160 104 Q160 122 146 122 H132"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx="97" cy="70" rx="35" ry="7" fill={soft} />
        </g>
      )}
      {art === "throw" && (
        <g>
          <rect x="44" y="52" width="112" height="106" rx="6" fill={accent} opacity="0.8" />
          {[72, 92, 112, 132].map((y) => (
            <rect key={y} x="44" y={y} width="112" height="6" fill="currentColor" opacity="0.35" />
          ))}
          {[54, 62, 70, 130, 138, 146].map((x) => (
            <rect key={x} x={x} y="158" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.6" />
          ))}
        </g>
      )}
      {art === "vase" && (
        <g>
          <path
            d="M88 48 H112 L108 78 Q138 98 134 130 Q130 160 100 160 Q70 160 66 130 Q62 98 92 78 Z"
            fill={accent}
            opacity="0.85"
          />
          <ellipse cx="100" cy="48" rx="12" ry="4" fill={soft} />
          <path d="M100 48 Q96 22 80 14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="13" r="6" fill="currentColor" opacity="0.7" />
        </g>
      )}
      {art === "stool" && (
        <g>
          <ellipse cx="100" cy="78" rx="48" ry="12" fill={accent} opacity="0.9" />
          <rect x="52" y="78" width="96" height="14" rx="6" fill="currentColor" opacity="0.8" />
          <path d="M66 92 L52 166 M134 92 L148 166 M100 92 V166" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </g>
      )}
      {art === "pendant" && (
        <g>
          <path d="M100 8 V70" stroke="currentColor" strokeWidth="3" />
          <path d="M52 124 Q52 70 100 70 Q148 70 148 124 Z" fill={accent} opacity="0.85" />
          <ellipse cx="100" cy="124" rx="48" ry="8" fill={soft} />
          <circle cx="100" cy="132" r="9" fill="currentColor" opacity="0.5" />
        </g>
      )}
      {art === "bowl" && (
        <g>
          <path d="M44 88 H156 Q152 150 100 156 Q48 150 44 88 Z" fill={accent} opacity="0.85" />
          <ellipse cx="100" cy="88" rx="56" ry="10" fill={soft} />
          {[76, 100, 124, 90, 112].map((x, i) => (
            <circle key={x + i} cx={x} cy={110 + (i % 3) * 10} r="2" fill="currentColor" opacity="0.45" />
          ))}
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page-scoped styles: hover/focus actions, stretched link, motion     */
/* ------------------------------------------------------------------ */

const styles = `
.pc-card { transition: box-shadow 180ms ease, transform 180ms ease; }
.pc-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-m, 0 8px 24px rgba(0,0,0,0.12)); }
.pc-card:focus-within { box-shadow: var(--shadow-m, 0 8px 24px rgba(0,0,0,0.12)); }
.pc-link { color: inherit; text-decoration: none; }
.pc-link::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; }
.pc-link:focus-visible { outline: none; }
.pc-link:focus-visible::after { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.pc-actions { position: absolute; z-index: 2; opacity: 0; transform: translateY(6px); transition: opacity 160ms ease, transform 160ms ease; }
.pc-card:hover .pc-actions,
.pc-card:focus-within .pc-actions { opacity: 1; transform: none; }
.pc-wish { position: absolute; z-index: 2; }
@media (hover: none) {
  .pc-actions { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pc-card, .pc-actions { transition: none; }
  .pc-card:hover { transform: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <Row gap="4" vertical="center">
      <Text as="span" onBackground="warning-strong" variant="label-default-s" aria-hidden="true">
        ★
      </Text>
      <Text as="span" variant="label-default-s" aria-hidden="true">
        {rating.toFixed(1)}
      </Text>
      <Text as="span" variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
        ({reviews})
      </Text>
      <VisuallyHidden>{`Rated ${rating.toFixed(1)} out of 5 from ${reviews} reviews`}</VisuallyHidden>
    </Row>
  );
}

type ProductCardProps = {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onAdd: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

function ProductCard({ product, wished, onToggleWish, onAdd, onQuickView }: ProductCardProps) {
  const onSale = product.compareAt !== undefined;

  return (
    <Column
      as="li"
      className="pc-card"
      background="surface"
      border
      radius="l"
      overflow="hidden"
      position="relative"
      style={{ listStyle: "none" }}
    >
      <Column position="relative" fillWidth background="neutral-alpha-weak" style={{ aspectRatio: "1 / 1" }}>
        <Column fill padding="32">
          <ProductArt art={product.art} />
        </Column>

        {product.tag && (
          <Row position="absolute" top="12" left="12">
            <Tag size="m" scheme={product.tag.scheme} prefixIcon={product.tag.icon}>
              {product.tag.label}
            </Tag>
          </Row>
        )}

        <Row className="pc-wish" top="8" right="8">
          <IconButton
            icon="heart"
            variant={wished ? "primary" : "secondary"}
            size="m"
            rounded
            tooltip={wished ? "Remove from wishlist" : "Add to wishlist"}
            ariaLabel={`${wished ? "Remove" : "Add"} ${product.name} ${wished ? "from" : "to"} wishlist`}
            aria-pressed={wished}
            onClick={() => onToggleWish(product)}
          />
        </Row>

        <Row className="pc-actions" bottom="12" left="12" right="12" gap="8">
          <Button
            size="s"
            variant="primary"
            prefixIcon="cart"
            fillWidth
            onClick={() => onAdd(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </Button>
          <IconButton
            icon="eye"
            size="m"
            variant="secondary"
            tooltip="Quick view"
            ariaLabel={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
          />
        </Row>
      </Column>

      <Column padding="16" gap="8">
        <Column gap="4">
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {product.maker}
          </Text>
          <Heading as="h3" variant="heading-strong-s">
            <a className="pc-link" href={`#${product.id}`}>
              {product.name}
            </a>
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {product.swatch}
          </Text>
        </Column>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Row gap="8" vertical="center">
            <Text variant="heading-strong-m">{currency.format(product.price)}</Text>
            {onSale && product.compareAt !== undefined && (
              <>
                <Text
                  as="s"
                  variant="body-default-s"
                  onBackground="neutral-weak"
                  aria-hidden="true"
                >
                  {currency.format(product.compareAt)}
                </Text>
                <VisuallyHidden>{`Was ${currency.format(product.compareAt)}`}</VisuallyHidden>
              </>
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
      style={{ listStyle: "none" }}
      aria-hidden="true"
    >
      <Skeleton shape="block" delay={delay} fillWidth style={{ aspectRatio: "1 / 1", height: "auto" }} radius="none" />
      <Column padding="16" gap="12">
        <Column gap="8">
          <Skeleton shape="line" size="xs" delay={delay} width={6} />
          <Skeleton shape="line" size="l" delay={delay} fillWidth />
          <Skeleton shape="line" size="xs" delay={delay} width={10} />
        </Column>
        <Row horizontal="between" vertical="center">
          <Skeleton shape="line" size="l" delay={delay} width={5} />
          <Skeleton shape="line" size="s" delay={delay} width={6} />
        </Row>
      </Column>
    </Column>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("all");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(() => new Set());
  const [cartCount, setCartCount] = useState(0);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    setStatus("Loading products");
    timer.current = setTimeout(() => {
      setLoading(false);
      setStatus("Products loaded");
    }, LOAD_DELAY_MS);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => {
      setLoading(false);
      setStatus("Products loaded");
    }, LOAD_DELAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const visible = useMemo(
    () => products.filter((p) => category === "all" || p.category === category),
    [category],
  );

  const toggleWish = useCallback((product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        setStatus(`${product.name} removed from wishlist`);
      } else {
        next.add(product.id);
        setStatus(`${product.name} added to wishlist`);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartCount((n) => n + 1);
    setStatus(`${product.name} added to cart`);
  }, []);

  const quickView = useCallback((product: Product) => {
    setStatus(`Quick view: ${product.name}, ${currency.format(product.price)}`);
  }, []);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <style>{styles}</style>
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
              Objects for a slower home
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Small-batch lighting, seating and tableware from makers we know by name.
            </Text>
          </Column>
          <Row gap="12" vertical="center">
            <Button
              variant="tertiary"
              size="m"
              prefixIcon="refresh"
              onClick={startLoading}
              disabled={loading}
              aria-label="Reload products to preview the loading state"
            >
              Reload
            </Button>
            <Row gap="8" vertical="center" paddingX="12" paddingY="8" radius="full" border background="surface">
              <IconButton
                icon="cart"
                variant="ghost"
                size="s"
                tooltip="Cart"
                ariaLabel={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              />
              <Text variant="label-strong-s" aria-hidden="true">
                {cartCount}
              </Text>
            </Row>
          </Row>
        </Row>

        <Row fillWidth horizontal="between" vertical="center" gap="16" s={{ direction: "column", vertical: "start" }}>
          <SegmentedControl
            fillWidth={false}
            value={category}
            onChange={(value) => setCategory(value as Category)}
            buttons={categoryButtons}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            {loading ? "Loading products…" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
          </Text>
        </Row>

        {loading ? (
          <Grid
            as="ul"
            fillWidth
            columns="4"
            gap="24"
            l={{ columns: 3 }}
            m={{ columns: 2 }}
            s={{ columns: 2, gap: "16" }}
            xs={{ columns: 1 }}
            aria-label="Loading products"
            aria-busy="true"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProductCardSkeleton key={i} index={i} />
            ))}
          </Grid>
        ) : visible.length === 0 ? (
          <Column center gap="12" padding="64" background="surface" border radius="l">
            <Text variant="body-default-m" onBackground="neutral-weak">
              Nothing in this category yet.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setCategory("all")}>
              Show all products
            </Button>
          </Column>
        ) : (
          <Grid
            as="ul"
            fillWidth
            columns="4"
            gap="24"
            l={{ columns: 3 }}
            m={{ columns: 2 }}
            s={{ columns: 2, gap: "16" }}
            xs={{ columns: 1 }}
            aria-label="Products"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
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
        )}

        <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
          {status}
        </div>
      </Column>
    </Column>
  );
}
