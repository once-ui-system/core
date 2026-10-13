"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button, Column, Flex, Grid, Heading, Row, Text } from "@once-ui-system/core";

type Category = "All" | "Audio" | "Wearables" | "Home" | "Bags";

interface Product {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: "New" | "Sale" | "Bestseller" | "Low stock";
  colors: [string, string];
  shape: "headphones" | "watch" | "lamp" | "bag" | "speaker" | "bottle" | "earbuds" | "mug";
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Halo Wireless Headphones", category: "Audio", price: 189, compareAt: 229, rating: 4.7, reviews: 1284, tag: "Sale", colors: ["#6d83f2", "#b9c4ff"], shape: "headphones" },
  { id: "p2", name: "Meridian Smartwatch S2", category: "Wearables", price: 249, rating: 4.5, reviews: 862, tag: "New", colors: ["#f08a5d", "#ffd3b8"], shape: "watch" },
  { id: "p3", name: "Arc Desk Lamp", category: "Home", price: 74, rating: 4.8, reviews: 391, tag: "Bestseller", colors: ["#f2c94c", "#fff1bd"], shape: "lamp" },
  { id: "p4", name: "Voyager Daypack 22L", category: "Bags", price: 119, rating: 4.6, reviews: 540, colors: ["#4fb286", "#bfe8d3"], shape: "bag" },
  { id: "p5", name: "Pebble Bluetooth Speaker", category: "Audio", price: 59, compareAt: 79, rating: 4.3, reviews: 2210, tag: "Sale", colors: ["#e56b9a", "#ffc9de"], shape: "speaker" },
  { id: "p6", name: "Insulated Steel Bottle 750ml", category: "Home", price: 32, rating: 4.9, reviews: 3150, tag: "Bestseller", colors: ["#3fa7c4", "#bfe9f4"], shape: "bottle" },
  { id: "p7", name: "Pulse True Wireless Earbuds", category: "Audio", price: 99, rating: 4.4, reviews: 977, tag: "Low stock", colors: ["#8d6fd6", "#d9ccff"], shape: "earbuds" },
  { id: "p8", name: "Fieldnote Band 3", category: "Wearables", price: 69, rating: 4.2, reviews: 418, tag: "New", colors: ["#5c6b7a", "#c9d3dc"], shape: "watch" },
  { id: "p9", name: "Stoneware Pour-Over Mug", category: "Home", price: 28, rating: 4.7, reviews: 233, colors: ["#c08a5a", "#f0d9c0"], shape: "mug" },
  { id: "p10", name: "Commuter Tote Waxed Canvas", category: "Bags", price: 134, compareAt: 160, rating: 4.6, reviews: 305, tag: "Sale", colors: ["#7a8f4e", "#d9e4b8"], shape: "bag" },
  { id: "p11", name: "Studio Monitor Headphones", category: "Audio", price: 159, rating: 4.8, reviews: 702, colors: ["#2f3a4a", "#9aa9bd"], shape: "headphones" },
  { id: "p12", name: "Dune Table Lamp", category: "Home", price: 88, rating: 4.5, reviews: 150, tag: "New", colors: ["#d97757", "#fbd9c9"], shape: "lamp" },
];

const CATEGORIES: Category[] = ["All", "Audio", "Wearables", "Home", "Bags"];

const SKELETON_COUNT = 8;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TAG_STYLES: Record<NonNullable<Product["tag"]>, { bg: string; fg: string }> = {
  New: { bg: "#1d4ed8", fg: "#ffffff" },
  Sale: { bg: "#b91c1c", fg: "#ffffff" },
  Bestseller: { bg: "#15803d", fg: "#ffffff" },
  "Low stock": { bg: "#b45309", fg: "#ffffff" },
};

const PAGE_CSS = `
.pc-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); list-style: none; margin: 0; padding: 0; }
.pc-card { position: relative; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden;
  background: var(--surface-background, rgba(127,127,127,0.08)); border: 1px solid var(--neutral-alpha-medium, rgba(127,127,127,0.25));
  transition: transform .2s ease, box-shadow .2s ease; }
.pc-card:hover, .pc-card:focus-within { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
.pc-media { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
.pc-actions { position: absolute; left: 12px; right: 12px; bottom: 12px; display: flex; gap: 8px; justify-content: center;
  opacity: 0; transform: translateY(8px); transition: opacity .2s ease, transform .2s ease; }
.pc-card:hover .pc-actions, .pc-card:focus-within .pc-actions { opacity: 1; transform: none; }
@media (hover: none) { .pc-actions { opacity: 1; transform: none; } }
.pc-btn { appearance: none; cursor: pointer; border: 0; font: inherit; font-weight: 600; font-size: 14px; line-height: 1;
  min-height: 40px; padding: 0 14px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  background: #ffffff; color: #111827; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: background .15s ease, transform .1s ease; }
.pc-btn:hover { background: #f3f4f6; }
.pc-btn:active { transform: scale(0.97); }
.pc-btn:focus-visible, .pc-chip:focus-visible, .pc-wish:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
.pc-btn-primary { background: #111827; color: #ffffff; flex: 1; }
.pc-btn-primary:hover { background: #1f2937; }
.pc-btn-icon { width: 40px; padding: 0; }
.pc-wish { position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer;
  display: grid; place-items: center; background: rgba(255,255,255,0.92); color: #111827; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
.pc-wish[aria-pressed="true"] { color: #dc2626; }
.pc-chip { appearance: none; cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; min-height: 40px; padding: 0 16px; border-radius: 999px;
  border: 1px solid var(--neutral-alpha-strong, rgba(127,127,127,0.4)); background: transparent; color: inherit; }
.pc-chip[aria-pressed="true"] { background: #111827; color: #ffffff; border-color: #111827; }
@media (prefers-color-scheme: dark) { .pc-chip[aria-pressed="true"] { background: #f9fafb; color: #111827; border-color: #f9fafb; } }
.pc-tag { position: absolute; top: 12px; left: 12px; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 999px; letter-spacing: .02em; }
.pc-skel { background: linear-gradient(90deg, rgba(127,127,127,0.14) 25%, rgba(127,127,127,0.28) 50%, rgba(127,127,127,0.14) 75%);
  background-size: 200% 100%; animation: pc-shimmer 1.4s linear infinite; border-radius: 8px; }
@keyframes pc-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.pc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .pc-card, .pc-actions { transition: none; }
  .pc-card:hover, .pc-card:focus-within { transform: none; }
  .pc-skel { animation: none; }
}
`;

function Illustration({ shape }: { shape: Product["shape"] }): ReactNode {
  const common = { fill: "none", stroke: "rgba(17,24,39,0.78)", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const solid = "rgba(255,255,255,0.85)";
  switch (shape) {
    case "headphones":
      return (<g><path d="M50 118 V100 a50 50 0 0 1 100 0 V118" {...common} /><rect x="38" y="112" width="24" height="40" rx="10" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><rect x="138" y="112" width="24" height="40" rx="10" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /></g>);
    case "watch":
      return (<g><path d="M80 40 h40 l6 30 h-52 z M74 130 h52 l-6 30 h-40 z" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" strokeLinejoin="round" /><rect x="64" y="66" width="72" height="68" rx="18" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><path d="M100 82 v18 l12 8" {...common} /></g>);
    case "lamp":
      return (<g><path d="M70 90 l20 -44 h20 l20 44 z" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" strokeLinejoin="round" /><path d="M100 90 v54" {...common} /><ellipse cx="100" cy="150" rx="30" ry="8" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /></g>);
    case "bag":
      return (<g><path d="M78 76 v-10 a22 22 0 0 1 44 0 v10" {...common} /><rect x="56" y="74" width="88" height="82" rx="14" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><path d="M56 108 h88" {...common} /></g>);
    case "speaker":
      return (<g><rect x="56" y="52" width="88" height="104" rx="22" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><circle cx="100" cy="112" r="24" {...common} /><circle cx="100" cy="76" r="6" fill="rgba(17,24,39,0.78)" /></g>);
    case "bottle":
      return (<g><rect x="90" y="36" width="20" height="16" rx="4" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><path d="M84 54 h32 v10 a14 14 0 0 1 8 12 v70 a12 12 0 0 1 -12 12 h-24 a12 12 0 0 1 -12 -12 v-70 a14 14 0 0 1 8 -12 z" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" strokeLinejoin="round" /></g>);
    case "earbuds":
      return (<g><rect x="50" y="110" width="100" height="50" rx="22" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><circle cx="76" cy="80" r="14" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><circle cx="124" cy="80" r="14" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" /><path d="M76 94 v14 M124 94 v14" {...common} /></g>);
    case "mug":
      return (<g><path d="M62 72 h66 v56 a24 24 0 0 1 -24 24 h-18 a24 24 0 0 1 -24 -24 z" fill={solid} stroke="rgba(17,24,39,0.78)" strokeWidth="5" strokeLinejoin="round" /><path d="M128 86 h8 a14 14 0 0 1 0 28 h-8" {...common} /></g>);
  }
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span aria-hidden="true" style={{ color: "#f59e0b", letterSpacing: 1, fontSize: 14 }}>
      {"★".repeat(full)}
      <span style={{ opacity: 0.3 }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.6 5c2 0 3.4 1 4.4 2.6C12 6 13.4 5 15.4 5 19 5 20.8 8.6 21.5 11.8 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.5L21 8H6" />
    </svg>
  );
}

interface CardProps {
  product: Product;
  wished: boolean;
  onToggleWish: (id: string) => void;
  onAdd: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({ product, wished, onToggleWish, onAdd, onQuickView }: CardProps) {
  const { id, name, price, compareAt, rating, reviews, tag, colors, shape, category } = product;
  const tagStyle = tag ? TAG_STYLES[tag] : undefined;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;
  const labelId = `${id}-name`;

  return (
    <li>
      <article className="pc-card" aria-labelledby={labelId} style={{ height: "100%" }}>
        <div className="pc-media" style={{ background: `linear-gradient(135deg, ${colors[1]}, ${colors[0]})` }}>
          <svg viewBox="0 0 200 200" role="img" aria-label={`${name} illustration`} style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
            <Illustration shape={shape} />
          </svg>
          {tag && tagStyle ? (
            <span className="pc-tag" style={{ background: tagStyle.bg, color: tagStyle.fg }}>
              {tag}
            </span>
          ) : null}
          <button type="button" className="pc-wish" aria-pressed={wished} aria-label={`${wished ? "Remove" : "Add"} ${name} ${wished ? "from" : "to"} wishlist`} onClick={() => onToggleWish(id)}>
            <HeartIcon filled={wished} />
          </button>
          <div className="pc-actions">
            <button type="button" className="pc-btn pc-btn-primary" onClick={() => onAdd(product)} aria-label={`Add ${name} to cart`}>
              <CartIcon />
              Add to cart
            </button>
            <button type="button" className="pc-btn pc-btn-icon" onClick={() => onQuickView(product)} aria-label={`Quick view ${name}`}>
              <EyeIcon />
            </button>
          </div>
        </div>
        <Column gap="8" padding="16" flex={1}>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {category}
          </Text>
          <Heading as="h3" variant="heading-strong-s" id={labelId}>
            {name}
          </Heading>
          <Row gap="8" vertical="center">
            <Stars rating={rating} />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              <span className="pc-sr">Rated {rating} out of 5 from </span>
              {rating.toFixed(1)} ({reviews.toLocaleString("en-US")})
            </Text>
          </Row>
          <Row gap="8" vertical="center" wrap style={{ marginTop: "auto", paddingTop: 4 }}>
            <Text variant="heading-strong-m">{currency.format(price)}</Text>
            {compareAt ? (
              <>
                <Text variant="body-default-s" onBackground="neutral-weak" style={{ textDecoration: "line-through" }}>
                  <span className="pc-sr">Was </span>
                  {currency.format(compareAt)}
                </Text>
                <Text variant="label-strong-xs" style={{ color: "#b91c1c" }}>
                  −{discount}%
                </Text>
              </>
            ) : null}
          </Row>
        </Column>
      </article>
    </li>
  );
}

function SkeletonCard() {
  return (
    <li aria-hidden="true">
      <div className="pc-card">
        <div className="pc-media pc-skel" style={{ borderRadius: 0 }} />
        <Column gap="12" padding="16">
          <div className="pc-skel" style={{ height: 12, width: "30%" }} />
          <div className="pc-skel" style={{ height: 18, width: "85%" }} />
          <div className="pc-skel" style={{ height: 12, width: "50%" }} />
          <div className="pc-skel" style={{ height: 24, width: "35%" }} />
        </Column>
      </div>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("All");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [status, setStatus] = useState("");
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!quickView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickView(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickView]);

  const visible = useMemo(() => (category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)), [category]);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      const product = PRODUCTS.find((p) => p.id === id);
      if (next.has(id)) {
        next.delete(id);
        setStatus(`${product?.name ?? "Item"} removed from wishlist`);
      } else {
        next.add(id);
        setStatus(`${product?.name ?? "Item"} added to wishlist`);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartCount((c) => c + 1);
    setStatus(`${product.name} added to cart`);
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1500);
  }, []);

  const headerStyle: CSSProperties = { maxWidth: 1280, margin: "0 auto", width: "100%" };

  return (
    <Column as="main" fillWidth paddingX="16" paddingY="32" gap="24">
      <style>{PAGE_CSS}</style>
      <Column gap="24" style={headerStyle}>
        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Spring collection
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Everyday essentials
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Thoughtfully designed audio, wearables and home goods with free returns for 30 days.
            </Text>
          </Column>
          <Row gap="12" vertical="center">
            <Text variant="label-default-s" aria-live="off">
              Cart: {cartCount} {cartCount === 1 ? "item" : "items"}
            </Text>
            <Button variant="secondary" size="s" onClick={reload} disabled={loading}>
              {loading ? "Loading…" : "Reload products"}
            </Button>
          </Row>
        </Row>

        <div role="group" aria-label="Filter by category" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="pc-chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        <Text variant="body-default-s" onBackground="neutral-weak">
          {loading ? "Loading products…" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
        </Text>

        <ul className="pc-grid" aria-label="Products" aria-busy={loading}>
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonCard key={`s-${i}`} />)
            : visible.map((p) => <ProductCard key={p.id} product={p} wished={wishlist.has(p.id)} onToggleWish={toggleWish} onAdd={addToCart} onQuickView={setQuickView} />)}
        </ul>
      </Column>

      <div role="status" aria-live="polite" className="pc-sr">
        {status}
      </div>

      {quickView ? (
        <Flex
          position="fixed"
          top="0"
          left="0"
          fillWidth
          fillHeight
          center
          padding="16"
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 50 }}
          onClick={() => setQuickView(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qv-title"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--page-background, #fff)", color: "inherit", borderRadius: 16, maxWidth: 420, width: "100%", overflow: "hidden", border: "1px solid rgba(127,127,127,0.3)" }}
          >
            <div style={{ aspectRatio: "16 / 10", background: `linear-gradient(135deg, ${quickView.colors[1]}, ${quickView.colors[0]})` }}>
              <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
                <Illustration shape={quickView.shape} />
              </svg>
            </div>
            <Column gap="12" padding="20">
              <Heading as="h2" variant="heading-strong-l" id="qv-title">
                {quickView.name}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {quickView.category} · rated {quickView.rating.toFixed(1)} from {quickView.reviews.toLocaleString("en-US")} reviews.
              </Text>
              <Text variant="heading-strong-l">{currency.format(quickView.price)}</Text>
              <Row gap="8" horizontal="end">
                <Button variant="secondary" onClick={() => setQuickView(null)} autoFocus>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    addToCart(quickView);
                    setQuickView(null);
                  }}
                >
                  Add to cart
                </Button>
              </Row>
            </Column>
          </div>
        </Flex>
      ) : null}
    </Column>
  );
}
