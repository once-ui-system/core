"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  IconButton,
  Media,
  Row,
  SegmentedControl,
  Select,
  Skeleton,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type Category = "bags" | "footwear" | "home" | "accessories";
type ProductTag = "New" | "Sale" | "Bestseller" | "Low stock";
type Shape = "tote" | "sneaker" | "mug" | "watch" | "lamp" | "wallet" | "bottle" | "scarf";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  tag?: ProductTag;
  colors: string;
  shape: Shape;
  /** Background, shape fill, accent — used only to paint the inline SVG artwork. */
  palette: [string, string, string];
};

const products: Product[] = [
  {
    id: "p1",
    name: "Harbor Canvas Tote",
    brand: "Northfold",
    category: "bags",
    price: 68,
    rating: 4.7,
    reviews: 312,
    tag: "Bestseller",
    colors: "Sand, Charcoal",
    shape: "tote",
    palette: ["#efe6d6", "#c9b48a", "#3b3a36"],
  },
  {
    id: "p2",
    name: "Strata Low Sneaker",
    brand: "Kiln & Co.",
    category: "footwear",
    price: 94,
    compareAt: 129,
    rating: 4.5,
    reviews: 198,
    tag: "Sale",
    colors: "Chalk, Moss",
    shape: "sneaker",
    palette: ["#dfe8e1", "#f6f4ee", "#5d7a62"],
  },
  {
    id: "p3",
    name: "Ember Stoneware Mug",
    brand: "Ashgrove",
    category: "home",
    price: 24,
    rating: 4.9,
    reviews: 541,
    tag: "New",
    colors: "Rust, Oat",
    shape: "mug",
    palette: ["#f3e3d8", "#b9553a", "#f6ece3"],
  },
  {
    id: "p4",
    name: "Meridian Field Watch",
    brand: "Tallis",
    category: "accessories",
    price: 189,
    rating: 4.8,
    reviews: 87,
    colors: "Steel, Olive",
    shape: "watch",
    palette: ["#e1e4e8", "#2f3a46", "#c8a04a"],
  },
  {
    id: "p5",
    name: "Arc Task Lamp",
    brand: "Lumen Atelier",
    category: "home",
    price: 112,
    compareAt: 140,
    rating: 4.4,
    reviews: 129,
    tag: "Sale",
    colors: "Matte black, Brass",
    shape: "lamp",
    palette: ["#e9e4f0", "#3a3347", "#e0b252"],
  },
  {
    id: "p6",
    name: "Slimfold Leather Wallet",
    brand: "Northfold",
    category: "accessories",
    price: 56,
    rating: 4.6,
    reviews: 264,
    tag: "Low stock",
    colors: "Cognac, Black",
    shape: "wallet",
    palette: ["#f1e2d0", "#8a4b2a", "#d8b48a"],
  },
  {
    id: "p7",
    name: "Trail Insulated Bottle",
    brand: "Ridgeline",
    category: "home",
    price: 38,
    rating: 4.7,
    reviews: 703,
    tag: "Bestseller",
    colors: "Glacier, Slate",
    shape: "bottle",
    palette: ["#dcebf0", "#4a8aa0", "#f2f7f9"],
  },
  {
    id: "p8",
    name: "Cinder Merino Scarf",
    brand: "Ashgrove",
    category: "accessories",
    price: 72,
    rating: 4.3,
    reviews: 76,
    tag: "New",
    colors: "Ash, Rose",
    shape: "scarf",
    palette: ["#f0e0e2", "#b7788a", "#f7eef0"],
  },
  {
    id: "p9",
    name: "Dune Weekender Duffel",
    brand: "Ridgeline",
    category: "bags",
    price: 148,
    compareAt: 175,
    rating: 4.6,
    reviews: 143,
    tag: "Sale",
    colors: "Khaki, Navy",
    shape: "tote",
    palette: ["#e6eadb", "#7f8a5a", "#2f3b2a"],
  },
  {
    id: "p10",
    name: "Lowtide Slip-On",
    brand: "Kiln & Co.",
    category: "footwear",
    price: 79,
    rating: 4.2,
    reviews: 58,
    colors: "Sand, Navy",
    shape: "sneaker",
    palette: ["#e8e3d8", "#2f4a66", "#f1ece0"],
  },
  {
    id: "p11",
    name: "Pillar Ceramic Vase",
    brand: "Lumen Atelier",
    category: "home",
    price: 46,
    rating: 4.8,
    reviews: 91,
    tag: "Low stock",
    colors: "Bone, Ink",
    shape: "bottle",
    palette: ["#ece8e0", "#33353a", "#cfc8b8"],
  },
  {
    id: "p12",
    name: "Courier Crossbody",
    brand: "Northfold",
    category: "bags",
    price: 84,
    rating: 4.5,
    reviews: 220,
    tag: "New",
    colors: "Black, Tan",
    shape: "wallet",
    palette: ["#e4e4e4", "#222428", "#b88a54"],
  },
];

const categoryOptions = [
  { value: "all", label: "All" },
  { value: "bags", label: "Bags" },
  { value: "footwear", label: "Footwear" },
  { value: "home", label: "Home" },
  { value: "accessories", label: "Accessories" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const tagScheme: Record<ProductTag, "brand" | "danger" | "success" | "warning"> = {
  New: "brand",
  Sale: "danger",
  Bestseller: "success",
  "Low stock": "warning",
};

const SKELETON_COUNT = 8;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    value,
  );

/** Simple product silhouettes, drawn inline so nothing is loaded from the network. */
function shapeMarkup(shape: Shape, fill: string, accent: string): string {
  switch (shape) {
    case "tote":
      return `<path d="M120 150 Q120 100 160 100 Q200 100 200 150" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/><path d="M96 150 H224 L212 292 H108 Z" fill="${fill}"/><rect x="96" y="150" width="128" height="14" fill="${accent}" opacity="0.35"/>`;
    case "sneaker":
      return `<path d="M60 230 Q60 170 110 168 L150 190 Q190 196 232 214 Q262 224 262 246 V256 H60 Z" fill="${fill}"/><rect x="56" y="250" width="210" height="16" rx="8" fill="${accent}"/><path d="M118 190 L134 174 M138 198 L154 182 M158 206 L174 190" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    case "mug":
      return `<rect x="104" y="120" width="104" height="124" rx="14" fill="${fill}"/><path d="M208 142 Q250 142 250 182 Q250 222 208 222" fill="none" stroke="${fill}" stroke-width="14" stroke-linecap="round"/><rect x="104" y="120" width="104" height="18" rx="9" fill="${accent}" opacity="0.5"/>`;
    case "watch":
      return `<rect x="138" y="52" width="44" height="64" rx="10" fill="${accent}"/><rect x="138" y="204" width="44" height="64" rx="10" fill="${accent}"/><circle cx="160" cy="160" r="62" fill="${fill}"/><circle cx="160" cy="160" r="48" fill="#f6f6f2"/><path d="M160 160 V126 M160 160 L184 172" stroke="${fill}" stroke-width="6" stroke-linecap="round"/><circle cx="160" cy="160" r="6" fill="${accent}"/>`;
    case "lamp":
      return `<ellipse cx="160" cy="270" rx="62" ry="12" fill="${fill}"/><path d="M160 264 V150 L214 104" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M190 80 L252 120 L226 150 Z" fill="${accent}"/>`;
    case "wallet":
      return `<rect x="70" y="112" width="180" height="128" rx="18" fill="${fill}"/><rect x="70" y="140" width="180" height="22" fill="${accent}" opacity="0.45"/><rect x="204" y="176" width="46" height="34" rx="10" fill="${accent}"/><circle cx="222" cy="193" r="5" fill="${fill}"/>`;
    case "bottle":
      return `<rect x="142" y="60" width="36" height="28" rx="6" fill="${accent}"/><path d="M134 88 H186 V108 Q210 126 210 160 V256 Q210 276 190 276 H130 Q110 276 110 256 V160 Q110 126 134 108 Z" fill="${fill}"/><rect x="110" y="188" width="100" height="22" fill="${accent}" opacity="0.4"/>`;
    case "scarf":
      return `<path d="M96 96 Q160 60 224 96 L224 140 Q160 112 96 140 Z" fill="${fill}"/><path d="M120 128 L148 268 H196 L176 128 Z" fill="${fill}"/><path d="M130 236 H190 M134 254 H192" stroke="${accent}" stroke-width="6" opacity="0.6"/>`;
  }
}

function productImage(product: Product): string {
  const [bg, fill, accent] = product.palette;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">` +
    `<rect width="320" height="320" fill="${bg}"/>` +
    `<ellipse cx="160" cy="290" rx="92" ry="9" fill="#000" opacity="0.08"/>` +
    shapeMarkup(product.shape, fill, accent) +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* -------------------------------------------------------------------------- */
/* Card + skeleton                                                            */
/* -------------------------------------------------------------------------- */

type ProductCardProps = {
  product: Product;
  wishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

function ProductCard({
  product,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  const onSale = product.compareAt !== undefined;
  const discount = onSale
    ? Math.round((1 - product.price / (product.compareAt as number)) * 100)
    : 0;

  return (
    <Column
      as="article"
      className="pc-card"
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
      aria-labelledby={`${product.id}-name`}
    >
      <Column className="pc-media" position="relative" fillWidth>
        <Media
          src={productImage(product)}
          alt={`${product.name} in ${product.colors}`}
          aspectRatio="1 / 1"
          unoptimized
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {product.tag && (
          <Row position="absolute" top="12" left="12">
            <Tag scheme={tagScheme[product.tag]} size="m" label={product.tag} />
          </Row>
        )}

        <Row position="absolute" top="8" right="8">
          <IconButton
            icon={wishlisted ? "starFill" : "star"}
            variant="secondary"
            size="m"
            rounded
            tooltip={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            ariaLabel={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={wishlisted}
            onClick={() => onToggleWishlist(product)}
          />
        </Row>

        <Row
          className="pc-actions"
          position="absolute"
          bottom="0"
          left="0"
          fillWidth
          padding="12"
          gap="8"
        >
          <Button
            fillWidth
            size="m"
            prefixIcon="cart"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </Button>
          <IconButton
            icon="eye"
            variant="secondary"
            size="l"
            tooltip="Quick view"
            ariaLabel={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
          />
        </Row>
      </Column>

      <Column padding="16" gap="8" flex={1}>
        <Text variant="label-default-xs" onBackground="neutral-weak">
          {product.brand}
        </Text>
        <Heading as="h3" id={`${product.id}-name`} variant="heading-strong-s">
          {product.name}
        </Heading>
        <Row gap="4" vertical="center">
          <Icon name="starFill" size="xs" onBackground="warning-strong" />
          <Text variant="label-default-s">{product.rating.toFixed(1)}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            ({product.reviews})
          </Text>
        </Row>
        <Row gap="8" vertical="end" wrap marginTop="4">
          <Text variant="heading-strong-m">{formatPrice(product.price)}</Text>
          {onSale && (
            <>
              <Text variant="body-default-s" onBackground="neutral-weak">
                <s>
                  <span className="pc-visually-hidden">Original price </span>
                  {formatPrice(product.compareAt as number)}
                </s>
              </Text>
              <Text variant="label-default-s" onBackground="danger-strong">
                {discount}% off
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
    <Column
      background="surface"
      border
      radius="l"
      overflow="hidden"
      fillWidth
      aria-hidden="true"
    >
      <Skeleton shape="block" fillWidth aspectRatio="1 / 1" delay={delay} radius="none" />
      <Column padding="16" gap="12">
        <Skeleton shape="line" size="xs" width={6} delay={delay} />
        <Skeleton shape="line" size="l" fillWidth delay={delay} />
        <Skeleton shape="line" size="s" width={10} delay={delay} />
        <Skeleton shape="line" size="l" width={8} delay={delay} />
      </Column>
    </Column>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);

  // Simulated first load so the skeleton state is visible on arrival.
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const visible = useMemo(() => {
    const filtered =
      category === "all" ? [...products] : products.filter((p) => p.category === category);
    switch (sort) {
      case "price-asc":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-desc":
        return filtered.sort((a, b) => b.price - a.price);
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [category, sort]);

  const toggleWishlist = (product: Product) => {
    const adding = !wishlist.has(product.id);
    setWishlist((current) => {
      const next = new Set(current);
      if (adding) next.add(product.id);
      else next.delete(product.id);
      return next;
    });
    addToast({
      variant: "info",
      message: adding
        ? `${product.name} saved to your wishlist`
        : `${product.name} removed from your wishlist`,
      duration: 2500,
    });
  };

  const addToCart = (product: Product) => {
    setCartCount((count) => count + 1);
    addToast({
      variant: "success",
      message: `${product.name} added to your cart`,
      duration: 3000,
    });
  };

  const quickView = (product: Product) => {
    addToast({
      variant: "info",
      message: `${product.name} · ${product.colors} · ${formatPrice(product.price)}`,
      duration: 3500,
    });
  };

  const reload = () => setLoading(true);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <style>{`
        .pc-actions {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 180ms ease, transform 180ms ease;
          pointer-events: none;
          background: linear-gradient(to top, rgba(0,0,0,0.28), rgba(0,0,0,0));
        }
        .pc-card:hover .pc-actions,
        .pc-card:focus-within .pc-actions {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .pc-card { transition: box-shadow 180ms ease, transform 180ms ease; }
        .pc-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }
        @media (hover: none) {
          .pc-actions { opacity: 1; transform: none; pointer-events: auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pc-actions, .pc-card { transition: none; }
          .pc-card:hover { transform: none; }
        }
        .pc-visually-hidden {
          position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
          overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }
      `}</style>

      <Column maxWidth="xl" gap="32">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start" }}
        >
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Spring edit
            </Text>
            <Heading as="h1" variant="display-strong-s">
              Everyday carry &amp; home
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Small-batch bags, footwear and objects made to be used daily.
            </Text>
          </Column>
          <Row gap="12" vertical="center" wrap>
            <Button
              variant="secondary"
              prefixIcon="refresh"
              size="m"
              onClick={reload}
              disabled={loading}
              loading={loading}
            >
              {loading ? "Loading" : "Reload products"}
            </Button>
            <Row gap="8" vertical="center" aria-live="polite">
              <Icon name="cart" size="s" />
              <Text variant="label-default-m">
                Cart <span aria-hidden="true">·</span> {cartCount}
                <span className="pc-visually-hidden"> items</span>
              </Text>
            </Row>
          </Row>
        </Row>

        <Row
          fillWidth
          horizontal="between"
          vertical="center"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column fillWidth maxWidth={40} s={{ maxWidth: 100 }}>
            <SegmentedControl
              compact
              value={category}
              onChange={(value) => setCategory(value)}
              buttons={categoryOptions}
            />
          </Column>
          <Column width={16} s={{ fillWidth: true }}>
            <Select
              id="sort-products"
              label="Sort by"
              value={sort}
              options={sortOptions}
              onSelect={(value) => setSort(Array.isArray(value) ? (value[0] ?? "featured") : value)}
            />
          </Column>
        </Row>

        <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
          {loading ? "Loading products…" : `${visible.length} products`}
        </Text>

        {loading ? (
          <Grid
            columns="4"
            gap="24"
            fillWidth
            l={{ columns: 4 }}
            m={{ columns: 3 }}
            s={{ columns: 2, gap: "12" }}
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <ProductCardSkeleton key={index} index={index} />
            ))}
          </Grid>
        ) : visible.length === 0 ? (
          <Column
            fillWidth
            center
            gap="16"
            padding="64"
            background="surface"
            border
            radius="l"
          >
            <Icon name="search" size="l" onBackground="neutral-weak" />
            <Text variant="body-default-m" onBackground="neutral-weak">
              Nothing matches this filter yet.
            </Text>
            <Button variant="secondary" onClick={() => setCategory("all")}>
              Show all products
            </Button>
          </Column>
        ) : (
          <Grid
            as="ul"
            columns="4"
            gap="24"
            fillWidth
            l={{ columns: 4 }}
            m={{ columns: 3 }}
            s={{ columns: 2, gap: "12" }}
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {visible.map((product) => (
              <li key={product.id} style={{ display: "flex" }}>
                <ProductCard
                  product={product}
                  wishlisted={wishlist.has(product.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={addToCart}
                  onQuickView={quickView}
                />
              </li>
            ))}
          </Grid>
        )}
      </Column>
    </Column>
  );
}
