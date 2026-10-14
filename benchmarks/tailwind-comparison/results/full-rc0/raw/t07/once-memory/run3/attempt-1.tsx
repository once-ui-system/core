"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Column, Heading, IconButton, Row, Tag, Text } from "@once-ui-system/core";

type TagTone = "brand" | "success" | "danger" | "neutral";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  tag?: { label: string; tone: TagTone };
  rating: number;
  reviews: number;
  colors: [string, string];
  shape: "mug" | "lamp" | "chair" | "plant" | "clock" | "bag" | "bottle" | "speaker";
};

const PRODUCTS: Product[] = [
  { id: "p1", name: "Stoneware Pour-Over Set", category: "Kitchen", price: 48, compareAt: 64, tag: { label: "Save 25%", tone: "danger" }, rating: 4.8, reviews: 312, colors: ["#f3d9c4", "#d98c5f"], shape: "mug" },
  { id: "p2", name: "Arc Desk Lamp", category: "Lighting", price: 129, tag: { label: "New", tone: "brand" }, rating: 4.6, reviews: 84, colors: ["#d7e3f4", "#6f93c9"], shape: "lamp" },
  { id: "p3", name: "Lowback Oak Chair", category: "Furniture", price: 289, tag: { label: "Bestseller", tone: "success" }, rating: 4.9, reviews: 527, colors: ["#efe3cf", "#b88a52"], shape: "chair" },
  { id: "p4", name: "Trailing Pothos in Clay Pot", category: "Plants", price: 34, rating: 4.7, reviews: 198, colors: ["#dcebd5", "#5f9a5b"], shape: "plant" },
  { id: "p5", name: "Brass Wall Clock", category: "Decor", price: 76, compareAt: 95, tag: { label: "Save 20%", tone: "danger" }, rating: 4.4, reviews: 61, colors: ["#f4ecc9", "#c9a23f"], shape: "clock" },
  { id: "p6", name: "Waxed Canvas Tote", category: "Accessories", price: 62, rating: 4.5, reviews: 143, colors: ["#e4dcd3", "#7b6a58"], shape: "bag" },
  { id: "p7", name: "Insulated Steel Bottle 750ml", category: "Outdoors", price: 29, tag: { label: "Low stock", tone: "neutral" }, rating: 4.7, reviews: 905, colors: ["#d5ecec", "#3f9c9c"], shape: "bottle" },
  { id: "p8", name: "Bookshelf Speaker, Pair", category: "Audio", price: 219, tag: { label: "New", tone: "brand" }, rating: 4.8, reviews: 47, colors: ["#e3dcf1", "#7d63b8"], shape: "speaker" },
];

const TAG_STYLES: Record<TagTone, { background: string; color: string }> = {
  brand: { background: "#3b5bdb", color: "#ffffff" },
  success: { background: "#2b8a3e", color: "#ffffff" },
  danger: { background: "#c92a2a", color: "#ffffff" },
  neutral: { background: "#343a40", color: "#ffffff" },
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Art({ shape, colors }: { shape: Product["shape"]; colors: [string, string] }) {
  const [light, dark] = colors;
  const common = { fill: dark, opacity: 0.9 };
  let body: React.ReactNode;
  switch (shape) {
    case "mug":
      body = (<><rect x="62" y="70" width="76" height="76" rx="12" {...common} /><path d="M138 86h12a16 16 0 0 1 0 36h-12" fill="none" stroke={dark} strokeWidth="8" /><rect x="70" y="78" width="60" height="10" rx="5" fill={light} opacity="0.7" /></>);
      break;
    case "lamp":
      body = (<><path d="M70 150h60M100 150V90l36-36" fill="none" stroke={dark} strokeWidth="8" strokeLinecap="round" /><path d="M120 44l36 26-20 20-36-26z" {...common} /></>);
      break;
    case "chair":
      body = (<><rect x="64" y="50" width="72" height="62" rx="10" {...common} /><rect x="58" y="112" width="84" height="14" rx="6" fill={dark} /><path d="M70 126v32M130 126v32" stroke={dark} strokeWidth="8" strokeLinecap="round" /></>);
      break;
    case "plant":
      body = (<><path d="M100 110C100 80 78 66 66 62c-2 26 10 44 34 48zM100 110c0-30 22-44 34-48 2 26-10 44-34 48z" fill="#4d8a4a" /><path d="M72 112h56l-8 44H80z" {...common} /></>);
      break;
    case "clock":
      body = (<><circle cx="100" cy="100" r="50" {...common} /><circle cx="100" cy="100" r="40" fill={light} /><path d="M100 100V72M100 100l20 12" stroke={dark} strokeWidth="6" strokeLinecap="round" /></>);
      break;
    case "bag":
      body = (<><path d="M76 78a24 24 0 0 1 48 0" fill="none" stroke={dark} strokeWidth="8" /><rect x="58" y="78" width="84" height="76" rx="8" {...common} /><rect x="58" y="98" width="84" height="8" fill={light} opacity="0.6" /></>);
      break;
    case "bottle":
      body = (<><rect x="90" y="40" width="20" height="16" rx="4" fill={dark} /><rect x="76" y="56" width="48" height="104" rx="16" {...common} /><rect x="76" y="92" width="48" height="10" fill={light} opacity="0.6" /></>);
      break;
    default:
      body = (<><rect x="66" y="46" width="68" height="112" rx="10" {...common} /><circle cx="100" cy="112" r="22" fill={light} /><circle cx="100" cy="112" r="9" fill={dark} /><circle cx="100" cy="74" r="8" fill={light} /></>);
  }
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`bg-${shape}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg-${shape})`} />
      <ellipse cx="100" cy="164" rx="48" ry="6" fill="#000" opacity="0.12" />
      {body}
    </svg>
  );
}

function Stars({ rating, reviews, name }: { rating: number; reviews: number; name: string }) {
  const filled = Math.round(rating);
  return (
    <Row gap="4" vertical="center" aria-label={`${name} rated ${rating} out of 5 from ${reviews} reviews`} role="img">
      <span aria-hidden="true" style={{ color: "#f59f00", fontSize: 14, letterSpacing: 1 }}>
        {"★".repeat(filled)}
        <span style={{ opacity: 0.3 }}>{"★".repeat(5 - filled)}</span>
      </span>
      <Text variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
        {rating.toFixed(1)} ({reviews})
      </Text>
    </Row>
  );
}

function SkeletonCard() {
  return (
    <div className="pc-card" aria-hidden="true">
      <div className="pc-media pc-shimmer" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 4px 4px" }}>
        <div className="pc-shimmer" style={{ height: 12, width: "35%", borderRadius: 6 }} />
        <div className="pc-shimmer" style={{ height: 16, width: "80%", borderRadius: 6 }} />
        <div className="pc-shimmer" style={{ height: 12, width: "50%", borderRadius: 6 }} />
        <div className="pc-shimmer" style={{ height: 20, width: "30%", borderRadius: 6 }} />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  wished,
  inCart,
  onWish,
  onAdd,
}: {
  product: Product;
  wished: boolean;
  inCart: number;
  onWish: (id: string) => void;
  onAdd: (id: string) => void;
}) {
  const { name, category, price, compareAt, tag, rating, reviews, colors, shape } = product;
  return (
    <article className="pc-card" aria-label={name}>
      <div className="pc-media">
        <Art shape={shape} colors={colors} />
        {tag && (
          <div className="pc-tag">
            <Tag size="s" style={TAG_STYLES[tag.tone]}>
              {tag.label}
            </Tag>
          </div>
        )}
        <div className="pc-wish">
          <IconButton
            icon="heart"
            variant={wished ? "primary" : "secondary"}
            size="m"
            tooltip={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            aria-pressed={wished}
            onClick={() => onWish(product.id)}
          />
        </div>
        <div className="pc-actions">
          <Button
            fillWidth
            size="m"
            variant="primary"
            prefixIcon="plus"
            onClick={() => onAdd(product.id)}
            aria-label={`Add ${name} to cart`}
          >
            Add to cart
          </Button>
        </div>
      </div>
      <Column gap="4" paddingX="4" paddingTop="12" paddingBottom="4">
        <Text variant="label-default-xs" onBackground="neutral-weak">
          {category.toUpperCase()}
        </Text>
        <Heading as="h3" variant="heading-strong-s">
          {name}
        </Heading>
        <Stars rating={rating} reviews={reviews} name={name} />
        <Row gap="8" vertical="end" paddingTop="4">
          <Text variant="heading-strong-m">{currency.format(price)}</Text>
          {compareAt && (
            <Text variant="body-default-s" onBackground="neutral-weak" style={{ textDecoration: "line-through" }}>
              <span className="pc-sr">Was </span>
              {currency.format(compareAt)}
            </Text>
          )}
          {inCart > 0 && (
            <Text variant="label-default-xs" onBackground="brand-strong" style={{ marginLeft: "auto" }}>
              {inCart} in cart
            </Text>
          )}
        </Row>
      </Column>
    </article>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(t);
  }, [loading]);

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  const toggleWish = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id);
    setWished((w) => ({ ...w, [id]: !w[id] }));
    if (p) setAnnounce(wished[id] ? `${p.name} removed from wishlist` : `${p.name} added to wishlist`);
  };

  const addToCart = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id);
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    if (p) setAnnounce(`${p.name} added to cart`);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <style>{`
        .pc-wrap { width: 100%; max-width: 1200px; }
        .pc-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr)); list-style: none; margin: 0; padding: 0; }
        .pc-card { display: flex; flex-direction: column; padding: 10px; border-radius: 16px; border: 1px solid var(--neutral-alpha-weak); background: var(--surface-background); transition: box-shadow .2s ease, transform .2s ease; }
        .pc-card:hover, .pc-card:focus-within { box-shadow: 0 10px 30px rgba(0,0,0,.12); transform: translateY(-2px); }
        .pc-media { position: relative; aspect-ratio: 1 / 1; border-radius: 10px; overflow: hidden; background: var(--neutral-alpha-weak); }
        .pc-tag { position: absolute; top: 10px; left: 10px; }
        .pc-wish { position: absolute; top: 10px; right: 10px; }
        .pc-actions { position: absolute; left: 10px; right: 10px; bottom: 10px; opacity: 0; transform: translateY(8px); transition: opacity .2s ease, transform .2s ease; }
        .pc-card:hover .pc-actions, .pc-card:focus-within .pc-actions { opacity: 1; transform: none; }
        @media (hover: none) { .pc-actions { opacity: 1; transform: none; } }
        .pc-shimmer { background: linear-gradient(90deg, var(--neutral-alpha-weak) 25%, var(--neutral-alpha-medium) 50%, var(--neutral-alpha-weak) 75%); background-size: 200% 100%; animation: pc-shimmer 1.3s linear infinite; }
        @keyframes pc-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .pc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        @media (prefers-reduced-motion: reduce) {
          .pc-shimmer { animation: none; }
          .pc-card, .pc-actions { transition: none; }
          .pc-card:hover, .pc-card:focus-within { transform: none; }
        }
      `}</style>

      <div className="pc-wrap">
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap paddingBottom="24">
          <Column gap="4">
            <Text variant="label-default-s" onBackground="brand-strong">
              Spring collection
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Home &amp; living essentials
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {loading ? "Loading products…" : `${PRODUCTS.length} products · ${cartCount} in cart`}
            </Text>
          </Column>
          <Button variant="secondary" size="m" prefixIcon="refresh" onClick={() => setLoading(true)} disabled={loading}>
            Reload
          </Button>
        </Row>

        <div role="status" aria-live="polite" className="pc-sr">
          {announce}
        </div>

        {loading ? (
          <div className="pc-grid" aria-busy="true" aria-label="Loading products">
            {PRODUCTS.map((p) => (
              <div key={p.id}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <ul className="pc-grid" aria-label="Products">
            {PRODUCTS.map((p) => (
              <li key={p.id} style={{ display: "flex" }}>
                <div style={{ width: "100%" }}>
                  <ProductCard
                    product={p}
                    wished={!!wished[p.id]}
                    inCart={cart[p.id] ?? 0}
                    onWish={toggleWish}
                    onAdd={addToCart}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Column>
  );
}
