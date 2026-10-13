"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Button,
  Column,
  Flex,
  Heading,
  Row,
  Text,
  useToast,
} from "@once-ui-system/core";

type ProductTag = "New" | "Sale" | "Bestseller" | "Limited";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: ProductTag;
  hues: [number, number];
  shape: "mug" | "lamp" | "chair" | "plant" | "bottle" | "speaker" | "bag" | "clock";
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Stoneware Pour-Over Set", category: "Kitchen", price: 58, rating: 4.8, reviews: 214, tag: "Bestseller", hues: [28, 12], shape: "mug" },
  { id: "p2", name: "Arc Brass Desk Lamp", category: "Lighting", price: 96, compareAt: 128, rating: 4.6, reviews: 87, tag: "Sale", hues: [45, 30], shape: "lamp" },
  { id: "p3", name: "Walnut Lounge Chair", category: "Furniture", price: 389, rating: 4.9, reviews: 56, tag: "New", hues: [24, 10], shape: "chair" },
  { id: "p4", name: "Glazed Planter, Medium", category: "Home & Garden", price: 34, rating: 4.5, reviews: 132, hues: [150, 170], shape: "plant" },
  { id: "p5", name: "Insulated Steel Bottle 750ml", category: "Outdoors", price: 29, compareAt: 36, rating: 4.7, reviews: 498, tag: "Sale", hues: [200, 220], shape: "bottle" },
  { id: "p6", name: "Fieldwork Bluetooth Speaker", category: "Audio", price: 149, rating: 4.4, reviews: 73, tag: "Limited", hues: [265, 285], shape: "speaker" },
  { id: "p7", name: "Waxed Canvas Weekender", category: "Bags", price: 118, rating: 4.8, reviews: 161, tag: "New", hues: [95, 75], shape: "bag" },
  { id: "p8", name: "Analog Wall Clock, 30cm", category: "Decor", price: 45, rating: 4.3, reviews: 39, hues: [350, 15], shape: "clock" },
];

const SKELETON_COUNT = 8;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const TAG_STYLES: Record<ProductTag, { bg: string; fg: string }> = {
  New: { bg: "hsl(152 55% 90%)", fg: "hsl(152 60% 20%)" },
  Sale: { bg: "hsl(8 85% 92%)", fg: "hsl(8 70% 32%)" },
  Bestseller: { bg: "hsl(42 95% 88%)", fg: "hsl(35 80% 25%)" },
  Limited: { bg: "hsl(265 70% 92%)", fg: "hsl(265 50% 32%)" },
};

const css = `
.pg-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}
.pg-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: 16px;
  background: var(--surface-background);
  overflow: hidden;
  transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease;
  height: 100%;
}
.pg-card:hover, .pg-card:focus-within {
  box-shadow: 0 10px 30px rgba(0,0,0,.14);
  transform: translateY(-2px);
  border-color: var(--neutral-alpha-strong);
}
.pg-media {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}
.pg-media svg { width: 100%; height: 100%; display: block; }
.pg-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity .18s ease, transform .18s ease;
}
.pg-card:hover .pg-actions,
.pg-card:focus-within .pg-actions { opacity: 1; transform: none; }
@media (hover: none) {
  .pg-actions { opacity: 1; transform: none; }
}
.pg-round {
  width: 38px; height: 38px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.95);
  color: #1a1a1a;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
  transition: transform .12s ease, background .12s ease;
}
.pg-round:hover { transform: scale(1.08); background: #fff; }
.pg-round:focus-visible, .pg-add:focus-visible, .pg-link:focus-visible {
  outline: 2px solid var(--brand-solid-strong, #3b82f6);
  outline-offset: 2px;
}
.pg-round[aria-pressed="true"] { color: #d6264a; }
.pg-add-wrap {
  position: absolute;
  left: 10px; right: 10px; bottom: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .18s ease, transform .18s ease;
}
.pg-card:hover .pg-add-wrap,
.pg-card:focus-within .pg-add-wrap { opacity: 1; transform: none; }
@media (hover: none) {
  .pg-add-wrap { opacity: 1; transform: none; }
}
.pg-add {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #151515;
  color: #fff;
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background .12s ease;
}
.pg-add:hover { background: #000; }
.pg-tag {
  position: absolute;
  top: 10px; left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}
.pg-shimmer {
  background: linear-gradient(90deg, var(--neutral-alpha-weak) 0%, var(--neutral-alpha-medium) 50%, var(--neutral-alpha-weak) 100%);
  background-size: 200% 100%;
  animation: pg-shimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}
@keyframes pg-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .pg-shimmer { animation: none; }
  .pg-card, .pg-actions, .pg-add-wrap, .pg-round { transition: none; }
  .pg-card:hover, .pg-card:focus-within { transform: none; }
}
.pg-sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.pg-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.pg-chip {
  height: 36px; padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--neutral-alpha-strong);
  background: transparent;
  color: var(--neutral-on-background-strong);
  font: inherit; font-size: 14px; cursor: pointer;
}
.pg-chip[aria-pressed="true"] {
  background: var(--neutral-on-background-strong);
  color: var(--page-background);
}
.pg-chip:focus-visible { outline: 2px solid var(--brand-solid-strong, #3b82f6); outline-offset: 2px; }
`;

function ProductArt({ product }: { product: Product }) {
  const [h1, h2] = product.hues;
  const gid = `g-${product.id}`;
  const fg = `hsl(${h1} 35% 28%)`;
  const mid = `hsl(${h1} 45% 48%)`;
  const light = `hsl(${h1} 60% 85%)`;

  let shape: ReactNode;
  switch (product.shape) {
    case "mug":
      shape = (
        <>
          <ellipse cx="100" cy="162" rx="52" ry="7" fill="rgba(0,0,0,.14)" />
          <path d="M62 80h76v52a26 26 0 0 1-26 26H88a26 26 0 0 1-26-26z" fill={mid} />
          <path d="M138 96h8a14 14 0 0 1 0 28h-8" fill="none" stroke={mid} strokeWidth="9" />
          <rect x="62" y="80" width="76" height="9" fill={fg} opacity=".35" />
        </>
      );
      break;
    case "lamp":
      shape = (
        <>
          <ellipse cx="82" cy="164" rx="34" ry="6" fill="rgba(0,0,0,.14)" />
          <rect x="52" y="154" width="60" height="9" rx="4" fill={fg} />
          <path d="M82 154V84q0-36 52-34" fill="none" stroke={mid} strokeWidth="6" strokeLinecap="round" />
          <path d="M120 44l36 12-12 26z" fill={mid} />
          <circle cx="146" cy="74" r="7" fill="hsl(48 100% 75%)" />
        </>
      );
      break;
    case "chair":
      shape = (
        <>
          <ellipse cx="100" cy="166" rx="60" ry="6" fill="rgba(0,0,0,.14)" />
          <path d="M62 52h56l8 62H60z" fill={mid} />
          <rect x="52" y="112" width="92" height="20" rx="8" fill={fg} />
          <path d="M62 132l-8 30M138 132l8 30M80 132l-4 30M118 132l4 30" stroke={fg} strokeWidth="7" strokeLinecap="round" />
        </>
      );
      break;
    case "plant":
      shape = (
        <>
          <ellipse cx="100" cy="166" rx="44" ry="6" fill="rgba(0,0,0,.14)" />
          <path d="M100 110C96 80 76 66 62 62c0 22 14 44 38 48z" fill={`hsl(${h2} 45% 38%)`} />
          <path d="M100 110c4-34 24-50 42-52 0 26-16 46-42 52z" fill={`hsl(${h2} 50% 46%)`} />
          <path d="M64 112h72l-8 48H72z" fill={mid} />
          <rect x="60" y="106" width="80" height="12" rx="4" fill={fg} />
        </>
      );
      break;
    case "bottle":
      shape = (
        <>
          <ellipse cx="100" cy="168" rx="36" ry="6" fill="rgba(0,0,0,.14)" />
          <rect x="88" y="26" width="24" height="16" rx="4" fill={fg} />
          <path d="M84 44h32v14q18 8 18 28v68a8 8 0 0 1-8 8H74a8 8 0 0 1-8-8V86q0-20 18-28z" fill={mid} />
          <rect x="66" y="96" width="68" height="26" fill={light} opacity=".55" />
        </>
      );
      break;
    case "speaker":
      shape = (
        <>
          <ellipse cx="100" cy="166" rx="56" ry="6" fill="rgba(0,0,0,.14)" />
          <rect x="46" y="64" width="108" height="98" rx="18" fill={fg} />
          <circle cx="100" cy="116" r="30" fill={mid} />
          <circle cx="100" cy="116" r="12" fill={fg} />
          <circle cx="100" cy="80" r="5" fill={light} />
        </>
      );
      break;
    case "bag":
      shape = (
        <>
          <ellipse cx="100" cy="168" rx="58" ry="6" fill="rgba(0,0,0,.14)" />
          <path d="M70 76q0-34 30-34t30 34" fill="none" stroke={fg} strokeWidth="8" strokeLinecap="round" />
          <path d="M44 80h112l-8 82H52z" fill={mid} />
          <rect x="44" y="104" width="112" height="10" fill={fg} opacity=".35" />
          <rect x="90" y="98" width="20" height="22" rx="4" fill={light} />
        </>
      );
      break;
    default:
      shape = (
        <>
          <ellipse cx="100" cy="170" rx="50" ry="5" fill="rgba(0,0,0,.12)" />
          <circle cx="100" cy="100" r="56" fill={fg} />
          <circle cx="100" cy="100" r="48" fill={light} />
          <path d="M100 100V62M100 100l26 14" stroke={fg} strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={fg} />
        </>
      );
  }

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${product.name} illustration`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h1} 70% 92%)`} />
          <stop offset="1" stopColor={`hsl(${h2} 60% 82%)`} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gid})`} />
      {shape}
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <Row gap="8" vertical="center">
      <span aria-hidden="true" style={{ color: "hsl(42 95% 48%)", letterSpacing: 1, fontSize: 14 }}>
        {"★".repeat(Math.round(rating))}
        <span style={{ opacity: 0.25 }}>{"★".repeat(5 - Math.round(rating))}</span>
      </span>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        <span className="pg-sr">Rated {rating} out of 5, </span>
        {rating.toFixed(1)} ({reviews})
      </Text>
    </Row>
  );
}

interface CardProps {
  product: Product;
  wished: boolean;
  onToggleWish: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAdd: (p: Product) => void;
}

function ProductCard({ product, wished, onToggleWish, onQuickView, onAdd }: CardProps) {
  const tagStyle = product.tag ? TAG_STYLES[product.tag] : undefined;
  const discount =
    product.compareAt !== undefined
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : null;

  return (
    <li>
      <article className="pg-card" aria-labelledby={`title-${product.id}`}>
        <div className="pg-media">
          <ProductArt product={product} />
          {product.tag && tagStyle && (
            <span className="pg-tag" style={{ background: tagStyle.bg, color: tagStyle.fg }}>
              {product.tag}
            </span>
          )}
          <div className="pg-actions">
            <button
              type="button"
              className="pg-round"
              aria-pressed={wished}
              aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              onClick={() => onToggleWish(product)}
            >
              <HeartIcon filled={wished} />
            </button>
            <button
              type="button"
              className="pg-round"
              aria-label={`Quick view ${product.name}`}
              onClick={() => onQuickView(product)}
            >
              <EyeIcon />
            </button>
          </div>
          <div className="pg-add-wrap">
            <button type="button" className="pg-add" onClick={() => onAdd(product)}>
              Add to cart
              <span className="pg-sr">: {product.name}</span>
            </button>
          </div>
        </div>
        <Column padding="16" gap="8" fillWidth>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {product.category}
          </Text>
          <Heading as="h3" variant="heading-strong-s" id={`title-${product.id}`}>
            {product.name}
          </Heading>
          <Stars rating={product.rating} reviews={product.reviews} />
          <Row gap="8" vertical="center" wrap>
            <Text variant="heading-strong-m">{currency.format(product.price)}</Text>
            {product.compareAt !== undefined && (
              <>
                <Text variant="body-default-s" onBackground="neutral-weak" style={{ textDecoration: "line-through" }}>
                  <span className="pg-sr">Original price </span>
                  {currency.format(product.compareAt)}
                </Text>
                <Text variant="label-strong-xs" onBackground="danger-strong">
                  {discount}% off
                </Text>
              </>
            )}
          </Row>
        </Column>
      </article>
    </li>
  );
}

function SkeletonCard() {
  const bar = (w: string, h: number, extra?: CSSProperties) => (
    <div className="pg-shimmer" style={{ width: w, height: h, ...extra }} />
  );
  return (
    <li aria-hidden="true">
      <div className="pg-card" style={{ transform: "none", boxShadow: "none" }}>
        <div className="pg-media pg-shimmer" style={{ borderRadius: 0 }} />
        <Column padding="16" gap="12" fillWidth>
          {bar("35%", 10)}
          {bar("85%", 16)}
          {bar("50%", 12)}
          {bar("30%", 20)}
        </Column>
      </div>
    </li>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("All");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = useState<number>(0);
  const [announce, setAnnounce] = useState<string>("");

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(t);
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1400);
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))],
    [],
  );

  const visible = useMemo(
    () => (category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)),
    [category],
  );

  const notify = useCallback(
    (message: string, variant: "success" | "danger" = "success") => {
      setAnnounce(message);
      addToast({ variant, message });
    },
    [addToast],
  );

  const toggleWish = useCallback(
    (p: Product) => {
      const has = wishlist.has(p.id);
      const next = new Set(wishlist);
      if (has) next.delete(p.id);
      else next.add(p.id);
      setWishlist(next);
      notify(has ? `Removed ${p.name} from wishlist` : `Saved ${p.name} to wishlist`);
    },
    [wishlist, notify],
  );

  const addToCart = useCallback(
    (p: Product) => {
      setCartCount((c) => c + 1);
      notify(`Added ${p.name} to cart`);
    },
    [notify],
  );

  const quickView = useCallback(
    (p: Product) => {
      notify(`${p.name}: ${currency.format(p.price)}, rated ${p.rating} by ${p.reviews} customers`);
    },
    [notify],
  );

  return (
    <Flex fillWidth horizontal="center" paddingX="16" paddingY="32">
      <style>{css}</style>
      <Column as="main" fillWidth maxWidth={72} gap="24">
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Spring collection
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Everyday objects, made well
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {loading
                ? "Loading products…"
                : `${visible.length} product${visible.length === 1 ? "" : "s"}`}
              {cartCount > 0 ? ` · ${cartCount} in cart` : ""}
            </Text>
          </Column>
          <Button variant="secondary" size="m" onClick={reload} disabled={loading}>
            {loading ? "Loading…" : "Reload products"}
          </Button>
        </Row>

        <div className="pg-filters" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="pg-chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div role="status" aria-live="polite" className="pg-sr">
          {announce}
        </div>

        <ul className="pg-grid" aria-busy={loading} aria-label="Products">
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonCard key={i} />)
            : visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wished={wishlist.has(p.id)}
                  onToggleWish={toggleWish}
                  onQuickView={quickView}
                  onAdd={addToCart}
                />
              ))}
        </ul>
      </Column>
    </Flex>
  );
}
