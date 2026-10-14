The package isn't installed locally, so I'll rely on well-known Once UI APIs. I'm using `Button`, `IconButton`, `Text`, `Heading`, `Row`, `Column` and `Flex`, with icon names like "heart", "plus", "eye", "check", and "refresh", which exist in the Once UI icon set. For safety, `IconButton` gets an `icon` prop and a `tooltip`-free `aria-label`.

```tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Column, Heading, IconButton, Row, Text } from "@once-ui-system/core";

type Tone = "sage" | "sand" | "ocean" | "clay" | "dusk" | "olive";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: "New" | "Sale" | "Bestseller" | "Low stock";
  tone: Tone;
  shape: "bottle" | "mug" | "bag" | "lamp" | "chair" | "plant" | "watch" | "headphones";
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Ridgeline Insulated Bottle 750ml", category: "Outdoor", price: 34, rating: 4.8, reviews: 412, tag: "Bestseller", tone: "ocean", shape: "bottle" },
  { id: "p2", name: "Hand-Thrown Stoneware Mug", category: "Kitchen", price: 28, compareAt: 36, rating: 4.6, reviews: 187, tag: "Sale", tone: "clay", shape: "mug" },
  { id: "p3", name: "Waxed Canvas Weekender Bag", category: "Travel", price: 148, rating: 4.9, reviews: 96, tag: "New", tone: "olive", shape: "bag" },
  { id: "p4", name: "Arc Desk Lamp, Brushed Brass", category: "Lighting", price: 89, rating: 4.5, reviews: 233, tone: "sand", shape: "lamp" },
  { id: "p5", name: "Oslo Lounge Chair, Oak & Boucle", category: "Furniture", price: 420, compareAt: 540, rating: 4.7, reviews: 58, tag: "Sale", tone: "sage", shape: "chair" },
  { id: "p6", name: "Monstera in Ceramic Planter", category: "Plants", price: 52, rating: 4.4, reviews: 141, tag: "Low stock", tone: "sage", shape: "plant" },
  { id: "p7", name: "Field Automatic Watch 38mm", category: "Accessories", price: 265, rating: 4.9, reviews: 77, tag: "New", tone: "dusk", shape: "watch" },
  { id: "p8", name: "Studio Wireless Headphones", category: "Audio", price: 199, compareAt: 249, rating: 4.6, reviews: 529, tag: "Sale", tone: "dusk", shape: "headphones" },
];

const TONES: Record<Tone, { from: string; to: string; ink: string }> = {
  sage: { from: "#dfe8dc", to: "#b9ccb4", ink: "#3f5a3b" },
  sand: { from: "#f3e8d3", to: "#e0cca3", ink: "#7a5c22" },
  ocean: { from: "#d6e6f0", to: "#a6c6dc", ink: "#2b5877" },
  clay: { from: "#f1dcd1", to: "#dfb4a0", ink: "#8a4630" },
  dusk: { from: "#dcdbed", to: "#b4b2d8", ink: "#42407a" },
  olive: { from: "#e4e6cf", to: "#c3c895", ink: "#555a22" },
};

const TAG_STYLE: Record<NonNullable<Product["tag"]>, { bg: string; fg: string }> = {
  New: { bg: "#e6f4ea", fg: "#14532d" },
  Sale: { bg: "#fde8e6", fg: "#8a1c12" },
  Bestseller: { bg: "#fff4d6", fg: "#6b4a00" },
  "Low stock": { bg: "#eceaf7", fg: "#34306b" },
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function ProductShape({ shape, ink }: { shape: Product["shape"]; ink: string }) {
  const common = { fill: "none", stroke: ink, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (shape) {
    case "bottle":
      return (
        <g {...common}>
          <rect x="82" y="40" width="36" height="16" rx="4" />
          <path d="M86 56h28v14c14 8 20 20 20 36v70a12 12 0 0 1-12 12H78a12 12 0 0 1-12-12v-70c0-16 6-28 20-36z" />
          <path d="M66 120h68" />
        </g>
      );
    case "mug":
      return (
        <g {...common}>
          <path d="M60 80h80v70a20 20 0 0 1-20 20H80a20 20 0 0 1-20-20z" />
          <path d="M140 96h12a16 16 0 0 1 0 32h-12" />
          <path d="M80 60c-6-8 6-12 0-20M100 60c-6-8 6-12 0-20M120 60c-6-8 6-12 0-20" />
        </g>
      );
    case "bag":
      return (
        <g {...common}>
          <path d="M50 90h100l8 80a8 8 0 0 1-8 9H50a8 8 0 0 1-8-9z" />
          <path d="M75 90V72a25 25 0 0 1 50 0v18" />
          <path d="M46 125h108" />
        </g>
      );
    case "lamp":
      return (
        <g {...common}>
          <path d="M70 50h60l14 38H56z" />
          <path d="M100 88v60" />
          <path d="M100 148c-30 0-30 24-4 24h8c26 0 26-24-4-24z" />
          <path d="M70 176h60" />
        </g>
      );
    case "chair":
      return (
        <g {...common}>
          <path d="M60 50h80a10 10 0 0 1 10 10v50H50V60a10 10 0 0 1 10-10z" />
          <path d="M44 110h112v24a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8z" />
          <path d="M60 142l-8 36M140 142l8 36" />
        </g>
      );
    case "plant":
      return (
        <g {...common}>
          <path d="M70 130h60l-8 48H78z" />
          <path d="M100 130V80" />
          <path d="M100 100c-30 0-44-20-44-40 28 0 44 14 44 40z" />
          <path d="M100 86c28 0 42-18 42-36-26 0-42 12-42 36z" />
        </g>
      );
    case "watch":
      return (
        <g {...common}>
          <path d="M80 30h40l6 34H74zM74 136h52l-6 34H80z" />
          <circle cx="100" cy="100" r="38" />
          <path d="M100 78v22l14 8" />
        </g>
      );
    case "headphones":
      return (
        <g {...common}>
          <path d="M48 120V100a52 52 0 0 1 104 0v20" />
          <rect x="40" y="114" width="26" height="46" rx="10" />
          <rect x="134" y="114" width="26" height="46" rx="10" />
        </g>
      );
  }
}

function ProductImage({ product }: { product: Product }) {
  const t = TONES[product.tone];
  const gid = `g-${product.id}`;
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Illustration of ${product.name}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.from} />
          <stop offset="1" stopColor={t.to} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gid})`} />
      <circle cx="165" cy="35" r="46" fill="#ffffff" opacity="0.28" />
      <ellipse cx="100" cy="184" rx="52" ry="6" fill={t.ink} opacity="0.14" />
      <ProductShape shape={product.shape} ink={t.ink} />
    </svg>
  );
}

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <Row gap="4" vertical="center">
      <span aria-hidden="true" style={{ color: "#d98e04", fontSize: 13, letterSpacing: 1 }}>
        {"★".repeat(Math.round(rating))}
        <span style={{ opacity: 0.25 }}>{"★".repeat(5 - Math.round(rating))}</span>
      </span>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        <span className="sr-only" style={srOnly}>
          Rated {rating} out of 5,{" "}
        </span>
        {rating.toFixed(1)} ({reviews})
      </Text>
    </Row>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

const shimmerCss = `
@keyframes pc-shimmer { 0% { background-position: 120% 0; } 100% { background-position: -120% 0; } }
.pc-skel {
  background: linear-gradient(90deg, var(--neutral-alpha-weak) 25%, var(--neutral-alpha-medium) 50%, var(--neutral-alpha-weak) 75%);
  background-size: 250% 100%;
  animation: pc-shimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}
@media (prefers-reduced-motion: reduce) { .pc-skel { animation: none; } }
.pc-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}
.pc-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: 16px;
  background: var(--surface-background);
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.pc-card:hover, .pc-card:focus-within {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,.12);
  border-color: var(--neutral-alpha-strong);
}
.pc-media { position: relative; aspect-ratio: 1 / 1; overflow: hidden; }
.pc-media > svg { transition: transform .4s ease; }
.pc-card:hover .pc-media > svg { transform: scale(1.04); }
.pc-actions {
  position: absolute;
  top: 10px; right: 10px;
  display: flex; flex-direction: column; gap: 8px;
  opacity: 0; transform: translateX(8px);
  transition: opacity .2s ease, transform .2s ease;
}
.pc-card:hover .pc-actions, .pc-card:focus-within .pc-actions, .pc-actions[data-pinned="true"] {
  opacity: 1; transform: none;
}
.pc-quick {
  position: absolute;
  left: 10px; right: 10px; bottom: 10px;
  opacity: 0; transform: translateY(10px);
  transition: opacity .2s ease, transform .2s ease;
}
.pc-card:hover .pc-quick, .pc-card:focus-within .pc-quick { opacity: 1; transform: none; }
@media (hover: none) {
  .pc-actions, .pc-quick { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pc-card, .pc-media > svg, .pc-actions, .pc-quick { transition: none; }
  .pc-card:hover { transform: none; }
  .pc-card:hover .pc-media > svg { transform: none; }
}
.pc-round {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 999px;
  border: 1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.95); color: #1a1a1a;
  cursor: pointer; font-size: 16px; line-height: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
}
.pc-round:hover { background: #fff; }
.pc-round:focus-visible, .pc-link:focus-visible { outline: 2px solid var(--brand-solid-strong, #3b6cff); outline-offset: 2px; }
.pc-link { color: inherit; text-decoration: none; border-radius: 4px; }
.pc-link::after { content: ""; position: absolute; inset: 0; z-index: 0; }
.pc-actions, .pc-quick { z-index: 2; }
`;

function SkeletonCard() {
  return (
    <li aria-hidden="true">
      <div className="pc-card" style={{ pointerEvents: "none" }}>
        <div className="pc-media pc-skel" style={{ borderRadius: 0 }} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="pc-skel" style={{ height: 12, width: "35%" }} />
          <div className="pc-skel" style={{ height: 16, width: "85%" }} />
          <div className="pc-skel" style={{ height: 12, width: "50%" }} />
          <div className="pc-skel" style={{ height: 20, width: "30%", marginTop: 4 }} />
        </div>
      </div>
    </li>
  );
}

interface CardProps {
  product: Product;
  wished: boolean;
  inCart: boolean;
  onToggleWish: (p: Product) => void;
  onAdd: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

function ProductCard({ product, wished, inCart, onToggleWish, onAdd, onQuickView }: CardProps) {
  const tag = product.tag ? TAG_STYLE[product.tag] : undefined;
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  return (
    <li>
      <article className="pc-card" aria-label={product.name}>
        <div className="pc-media">
          <ProductImage product={product} />
          {product.tag && tag && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: tag.bg,
                color: tag.fg,
                zIndex: 1,
              }}
            >
              {product.tag}
              {product.tag === "Sale" && discount > 0 ? ` −${discount}%` : ""}
            </span>
          )}
          <div className="pc-actions" data-pinned={wished}>
            <button
              type="button"
              className="pc-round"
              aria-pressed={wished}
              aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              onClick={() => onToggleWish(product)}
              style={{ color: wished ? "#d6244a" : "#1a1a1a" }}
            >
              <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
            </button>
            <button
              type="button"
              className="pc-round"
              aria-label={`Quick view ${product.name}`}
              onClick={() => onQuickView(product)}
            >
              <span aria-hidden="true">👁</span>
            </button>
          </div>
          <div className="pc-quick">
            <Button
              size="m"
              variant={inCart ? "secondary" : "primary"}
              fillWidth
              prefixIcon={inCart ? "check" : "plus"}
              onClick={() => onAdd(product)}
              aria-label={`${inCart ? "Added" : "Add"} ${product.name} to cart`}
            >
              {inCart ? "Added to cart" : "Add to cart"}
            </Button>
          </div>
        </div>

        <Column padding="16" gap="8" flex={1}>
          <Text variant="label-default-xs" onBackground="neutral-weak" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
            {product.category}
          </Text>
          <Heading as="h3" variant="heading-strong-s">
            <a href={`#${product.id}`} className="pc-link" onClick={(e) => e.preventDefault()}>
              {product.name}
            </a>
          </Heading>
          <Stars rating={product.rating} reviews={product.reviews} />
          <Row gap="8" vertical="end" marginTop="4">
            <Text variant="heading-strong-m">{currency.format(product.price)}</Text>
            {product.compareAt && (
              <Text variant="body-default-s" onBackground="neutral-weak" style={{ textDecoration: "line-through" }}>
                <span style={srOnly}>Was </span>
                {currency.format(product.compareAt)}
              </Text>
            )}
          </Row>
        </Column>
      </article>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [wish, setWish] = useState<ReadonlySet<string>>(new Set());
  const [cart, setCart] = useState<ReadonlySet<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), 1600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 1600);
  }, []);

  const toggleWish = useCallback((p: Product) => {
    setWish((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) {
        next.delete(p.id);
        setMessage(`Removed ${p.name} from wishlist`);
      } else {
        next.add(p.id);
        setMessage(`Added ${p.name} to wishlist`);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      if (prev.has(p.id)) return prev;
      const next = new Set(prev);
      next.add(p.id);
      return next;
    });
    setMessage(`Added ${p.name} to cart`);
  }, []);

  const quickView = useCallback((p: Product) => {
    setMessage(`Quick view opened for ${p.name}, ${currency.format(p.price)}`);
  }, []);

  const sorted = useMemo(() => {
    const list = [...PRODUCTS];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [sort]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <style>{shimmerCss}</style>
      <Column fillWidth gap="24" style={{ maxWidth: 1200 }}>
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Spring collection
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Everyday essentials
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {loading ? "Loading products…" : `${PRODUCTS.length} products`} ·{" "}
              {cart.size} in cart · {wish.size} saved
            </Text>
          </Column>
          <Row gap="12" vertical="center" wrap>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text variant="label-default-s" onBackground="neutral-weak">
                Sort by
              </Text>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                disabled={loading}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--neutral-alpha-strong)",
                  background: "var(--surface-background)",
                  color: "inherit",
                  font: "inherit",
                  minHeight: 36,
                }}
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
            <Button variant="secondary" size="m" onClick={reload} disabled={loading} prefixIcon="refresh">
              Reload
            </Button>
          </Row>
        </Row>

        <div aria-busy={loading}>
          <ul className="pc-grid" aria-label="Products">
            {loading
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : sorted.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    wished={wish.has(p.id)}
                    inCart={cart.has(p.id)}
                    onToggleWish={toggleWish}
                    onAdd={addToCart}
                    onQuickView={quickView}
                  />
                ))}
          </ul>
        </div>

        <div role="status" aria-live="polite" style={srOnly}>
          {message}
        </div>
      </Column>
    </Column>
  );
}
```