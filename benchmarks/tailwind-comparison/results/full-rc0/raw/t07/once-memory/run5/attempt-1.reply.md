```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Column, Row, Text, Heading, Button } from "@once-ui-system/core";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  tag?: "New" | "Sale" | "Bestseller" | "Low stock";
  rating: number;
  reviews: number;
  colors: string[];
  // CSS gradient pair used as the placeholder product image
  art: [string, string];
  shape: "mug" | "lamp" | "bag" | "chair" | "plant" | "clock" | "bottle" | "speaker";
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Stoneware Pour-Over Set",
    category: "Kitchen",
    price: 48,
    tag: "Bestseller",
    rating: 4.8,
    reviews: 312,
    colors: ["#e8dcc8", "#6b705c", "#2f2f2f"],
    art: ["#f3e9d8", "#d9c3a0"],
    shape: "mug",
  },
  {
    id: "p2",
    name: "Arc Desk Lamp",
    category: "Lighting",
    price: 89,
    compareAt: 119,
    tag: "Sale",
    rating: 4.6,
    reviews: 148,
    colors: ["#222222", "#c9a227"],
    art: ["#dfe7ee", "#a9bccd"],
    shape: "lamp",
  },
  {
    id: "p3",
    name: "Waxed Canvas Weekender",
    category: "Bags",
    price: 134,
    tag: "New",
    rating: 4.9,
    reviews: 57,
    colors: ["#5c4a32", "#2e3b2f", "#1f2937"],
    art: ["#efe2cf", "#c8a97e"],
    shape: "bag",
  },
  {
    id: "p4",
    name: "Oak Lounge Chair",
    category: "Furniture",
    price: 420,
    rating: 4.7,
    reviews: 89,
    colors: ["#b98b5e", "#3b2f2f"],
    art: ["#e9e4dc", "#bfae96"],
    shape: "chair",
  },
  {
    id: "p5",
    name: "Terracotta Planter, Large",
    category: "Garden",
    price: 36,
    compareAt: 45,
    tag: "Sale",
    rating: 4.5,
    reviews: 203,
    colors: ["#c8643b", "#e8e1d6"],
    art: ["#dbe8dc", "#9cbfa3"],
    shape: "plant",
  },
  {
    id: "p6",
    name: "Brass Wall Clock",
    category: "Decor",
    price: 72,
    tag: "Low stock",
    rating: 4.4,
    reviews: 41,
    colors: ["#b5893b", "#1c1c1c"],
    art: ["#ece3f0", "#bba9c7"],
    shape: "clock",
  },
  {
    id: "p7",
    name: "Insulated Steel Bottle 750ml",
    category: "Outdoors",
    price: 29,
    tag: "New",
    rating: 4.7,
    reviews: 526,
    colors: ["#3e6b8a", "#d5d9dc", "#111827", "#c2410c"],
    art: ["#d8ebf3", "#8fbdd1"],
    shape: "bottle",
  },
  {
    id: "p8",
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 159,
    compareAt: 189,
    tag: "Sale",
    rating: 4.6,
    reviews: 274,
    colors: ["#1f1f1f", "#d8d2c4"],
    art: ["#f2dfd7", "#d8a998"],
    shape: "speaker",
  },
];

const CSS = `
.pg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15.5rem), 1fr));
  gap: 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}
.pg-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--neutral-alpha-weak, rgba(128,128,128,.2));
  border-radius: 1rem;
  background: var(--surface-background, rgba(128,128,128,.06));
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.pg-card:hover, .pg-card:focus-within {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,.14);
  border-color: var(--neutral-alpha-medium, rgba(128,128,128,.4));
}
.pg-media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}
.pg-art {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transition: transform .4s ease;
}
.pg-card:hover .pg-art, .pg-card:focus-within .pg-art { transform: scale(1.04); }
.pg-tag {
  position: absolute;
  top: .75rem;
  left: .75rem;
  padding: .25rem .625rem;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  letter-spacing: .01em;
}
.pg-tag[data-tag="Sale"] { background: #b42318; }
.pg-tag[data-tag="New"] { background: #175cd3; }
.pg-tag[data-tag="Bestseller"] { background: #5b3cc4; }
.pg-tag[data-tag="Low stock"] { background: #b54708; }
.pg-wish {
  position: absolute;
  top: .625rem;
  right: .625rem;
}
.pg-icon-btn {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.92);
  color: #1a1a1a;
  cursor: pointer;
  transition: transform .15s ease, background .15s ease;
}
.pg-icon-btn:hover { transform: scale(1.08); background: #fff; }
.pg-icon-btn:focus-visible, .pg-add:focus-visible, .pg-link:focus-visible, .pg-swatch:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
.pg-icon-btn[aria-pressed="true"] { color: #d92d20; }
.pg-actions {
  position: absolute;
  left: .75rem;
  right: .75rem;
  bottom: .75rem;
  display: flex;
  gap: .5rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .2s ease, transform .2s ease;
}
.pg-card:hover .pg-actions,
.pg-card:focus-within .pg-actions { opacity: 1; transform: none; }
@media (hover: none) {
  .pg-actions { opacity: 1; transform: none; }
}
.pg-add {
  flex: 1;
  min-height: 2.5rem;
  border: 0;
  border-radius: .75rem;
  background: #111827;
  color: #fff;
  font: inherit;
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease;
}
.pg-add:hover { background: #000; }
.pg-add[data-added="true"] { background: #067647; }
.pg-link {
  color: inherit;
  text-decoration: none;
}
.pg-link::after { content: none; }
.pg-link:hover { text-decoration: underline; }
.pg-swatch {
  width: .875rem;
  height: .875rem;
  border-radius: 999px;
  border: 1px solid rgba(128,128,128,.5);
  display: inline-block;
}
.pg-skel {
  position: relative;
  overflow: hidden;
  background: var(--neutral-alpha-weak, rgba(128,128,128,.18));
  border-radius: .5rem;
}
.pg-skel::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
  animation: pg-shimmer 1.4s infinite;
}
@keyframes pg-shimmer { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .pg-skel::after { animation: none; }
  .pg-card, .pg-art, .pg-actions, .pg-icon-btn { transition: none; }
  .pg-card:hover, .pg-card:focus-within { transform: none; }
  .pg-card:hover .pg-art, .pg-card:focus-within .pg-art { transform: none; }
}
.pg-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
`;

function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="#f5a524">
      <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  );
}

function ProductArt({ shape }: { shape: Product["shape"] }) {
  const common = {
    width: "58%",
    height: "58%",
    viewBox: "0 0 100 100",
    "aria-hidden": true,
    focusable: false,
  } as const;
  const fill = "rgba(255,255,255,.55)";
  const stroke = "rgba(20,20,20,.55)";
  const sw = 2.5;
  switch (shape) {
    case "mug":
      return (
        <svg {...common}>
          <path d="M24 34h40v32a14 14 0 0 1-14 14H38a14 14 0 0 1-14-14z" fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d="M64 42h6a8 8 0 0 1 0 16h-6" fill="none" stroke={stroke} strokeWidth={sw} />
          <path d="M36 20c-3 4 3 6 0 10M46 18c-3 4 3 6 0 12" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "lamp":
      return (
        <svg {...common}>
          <path d="M30 84h34M47 84V52l22-24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M60 18l22 16-10 10-22-16z" fill={fill} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <rect x="18" y="38" width="64" height="44" rx="8" fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d="M34 38V28a16 16 0 0 1 32 0v10M18 56h64" fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "chair":
      return (
        <svg {...common}>
          <path d="M28 18h34l6 36H24z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M20 54h56v12H20zM28 66l-4 18M68 66l4 18" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "plant":
      return (
        <svg {...common}>
          <path d="M30 56h40l-5 28H35z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M50 56V30M50 42c-12 0-16-10-16-16 10 0 16 6 16 16zM50 36c10 0 16-8 16-14-10 0-16 6-16 14z" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="32" fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d="M50 30v20l14 8" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "bottle":
      return (
        <svg {...common}>
          <rect x="42" y="12" width="16" height="10" rx="3" fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d="M40 22h20l4 10v48a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V32z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
    case "speaker":
      return (
        <svg {...common}>
          <rect x="26" y="20" width="48" height="62" rx="12" fill={fill} stroke={stroke} strokeWidth={sw} />
          <circle cx="50" cy="40" r="7" fill="none" stroke={stroke} strokeWidth={sw} />
          <circle cx="50" cy="64" r="11" fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
}

function SkeletonCard() {
  return (
    <li className="pg-card" aria-hidden="true">
      <div className="pg-media pg-skel" style={{ borderRadius: 0 }} />
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: ".625rem" }}>
        <div className="pg-skel" style={{ height: 12, width: "35%" }} />
        <div className="pg-skel" style={{ height: 18, width: "80%" }} />
        <div className="pg-skel" style={{ height: 12, width: "50%" }} />
        <div className="pg-skel" style={{ height: 22, width: "30%", marginTop: 6 }} />
      </div>
    </li>
  );
}

type CardProps = {
  product: Product;
  wished: boolean;
  added: boolean;
  onWish: (p: Product) => void;
  onAdd: (p: Product) => void;
  onQuickView: (p: Product) => void;
};

function ProductCard({ product, wished, added, onWish, onAdd, onQuickView }: CardProps) {
  const { name, category, price, compareAt, tag, rating, reviews, colors, art, shape } = product;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <li className="pg-card">
      <div className="pg-media" style={{ background: `linear-gradient(145deg, ${art[0]}, ${art[1]})` }}>
        <div className="pg-art">
          <ProductArt shape={shape} />
        </div>

        {tag ? (
          <span className="pg-tag" data-tag={tag}>
            {tag}
            {tag === "Sale" && discount > 0 ? ` −${discount}%` : ""}
          </span>
        ) : null}

        <div className="pg-wish">
          <button
            type="button"
            className="pg-icon-btn"
            aria-pressed={wished}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            onClick={() => onWish(product)}
          >
            <HeartIcon filled={wished} />
          </button>
        </div>

        <div className="pg-actions">
          <button
            type="button"
            className="pg-add"
            data-added={added}
            onClick={() => onAdd(product)}
            aria-label={added ? `${name} added to cart` : `Add ${name} to cart`}
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
          <button
            type="button"
            className="pg-icon-btn"
            aria-label={`Quick view ${name}`}
            onClick={() => onQuickView(product)}
          >
            <EyeIcon />
          </button>
        </div>
      </div>

      <Column padding="16" gap="8" fillWidth>
        <Text variant="label-default-xs" onBackground="neutral-weak">
          {category.toUpperCase()}
        </Text>
        <Text as="h3" variant="heading-strong-s" style={{ margin: 0 }}>
          <a href={`#${product.id}`} className="pg-link" onClick={(e) => e.preventDefault()}>
            {name}
          </a>
        </Text>
        <Row gap="8" vertical="center">
          <StarIcon />
          <Text variant="body-default-s">{rating.toFixed(1)}</Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            <span aria-hidden="true">({reviews})</span>
            <span className="pg-sr">{`${rating.toFixed(1)} out of 5 stars, ${reviews} reviews`}</span>
          </Text>
        </Row>
        <Row horizontal="between" vertical="center" gap="12" wrap>
          <Row gap="8" vertical="center" wrap>
            <Text variant="heading-strong-m">{formatPrice(price)}</Text>
            {compareAt ? (
              <Text variant="body-default-s" onBackground="neutral-weak">
                <s>
                  <span className="pg-sr">Original price </span>
                  {formatPrice(compareAt)}
                </s>
              </Text>
            ) : null}
          </Row>
          <Row gap="4" vertical="center" role="list" aria-label="Available colors">
            {colors.map((c) => (
              <span key={c} role="listitem" className="pg-swatch" style={{ background: c }} />
            ))}
          </Row>
        </Row>
      </Column>
    </li>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(0);
  const [status, setStatus] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1600);
    const list = timers.current;
    return () => {
      window.clearTimeout(t);
      list.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    setStatus("Loading products");
    const t = window.setTimeout(() => {
      setLoading(false);
      setStatus("Products loaded");
    }, 1600);
    timers.current.push(t);
  }, []);

  const onWish = useCallback((p: Product) => {
    setWishlist((w) => {
      const next = !w[p.id];
      setStatus(next ? `${p.name} added to wishlist` : `${p.name} removed from wishlist`);
      return { ...w, [p.id]: next };
    });
  }, []);

  const onAdd = useCallback((p: Product) => {
    setCartCount((c) => c + 1);
    setAdded((a) => ({ ...a, [p.id]: true }));
    setStatus(`${p.name} added to cart`);
    const t = window.setTimeout(() => setAdded((a) => ({ ...a, [p.id]: false })), 1800);
    timers.current.push(t);
  }, []);

  const onQuickView = useCallback((p: Product) => {
    setStatus(`Quick view: ${p.name}, ${formatPrice(p.price)}`);
  }, []);

  const wishCount = useMemo(() => Object.values(wishlist).filter(Boolean).length, [wishlist]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <style>{CSS}</style>
      <Column fillWidth gap="24" style={{ maxWidth: "76rem" }}>
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              HOME &amp; LIVING
            </Text>
            <Heading as="h1" variant="display-strong-s">
              The spring collection
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Everyday objects, made to last. Free shipping on orders over $75.
            </Text>
          </Column>
          <Row gap="16" vertical="center" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {wishCount} saved · {cartCount} in cart
            </Text>
            <Button variant="secondary" size="m" onClick={reload} disabled={loading}>
              {loading ? "Loading…" : "Reload products"}
            </Button>
          </Row>
        </Row>

        <div className="pg-sr" role="status" aria-live="polite">
          {status}
        </div>

        <ul
          className="pg-grid"
          aria-label="Products"
          aria-busy={loading}
        >
          {loading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={`s${i}`} />)
            : PRODUCTS.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wished={!!wishlist[p.id]}
                  added={!!added[p.id]}
                  onWish={onWish}
                  onAdd={onAdd}
                  onQuickView={onQuickView}
                />
              ))}
        </ul>
      </Column>
    </Column>
  );
}
```