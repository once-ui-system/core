"use client";

import {
  Button,
  Card,
  Column,
  Grid,
  Heading,
  Icon,
  IconButton,
  Line,
  Media,
  Row,
  Scroller,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const product = {
  name: "Once Fleece Jacket",
  brand: "Once UI",
  price: 148,
  compareAt: 198,
  rating: 4.8,
  reviews: 124,
  description:
    "A lightweight fleece built for layering. Brushed interior, structured collar, and a fit that works from desk to trail.",
  images: [
    "/images/fashion/jacket-01.jpg",
    "/images/fashion/jacket-04.jpg",
    "/images/fashion/jacket-02.jpg",
  ],
  colors: [
    { label: "Charcoal", value: "charcoal", swatch: "neutral-strong" as const },
    { label: "Sand", value: "sand", swatch: "warning-weak" as const },
    { label: "Forest", value: "forest", swatch: "success-weak" as const },
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
};

export const Store2 = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].value);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  return (
    <Column fillWidth horizontal="center" paddingX="l" paddingY="xl">
      <Row maxWidth="l" fillWidth gap="xl" m={{ direction: "column" }}>
        <Column fillWidth gap="12">
          <Column fillWidth radius="xl" overflow="hidden" border>
            <Media
              src={product.images[selectedImage]}
              alt={product.name}
              aspectRatio="4/5"
              sizes="(max-width: 768px) 100vw, 560px"
            />
          </Column>
          <Scroller direction="row" fillWidth gap="8">
            <Row fitWidth gap="8">
              {product.images.map((image, index) => (
                <Row
                  key={image}
                  cursor="interactive"
                  radius="l"
                  overflow="hidden"
                  border={selectedImage === index ? "brand-strong" : "neutral-alpha-weak"}
                  onClick={() => setSelectedImage(index)}
                >
                  <Media
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    aspectRatio="1/1"
                    minWidth={5}
                    maxWidth={5}
                    sizes="80px"
                  />
                </Row>
              ))}
            </Row>
          </Scroller>
        </Column>

        <Column fillWidth gap="24" paddingTop="8">
          <Column gap="8">
            <Row gap="8" vertical="center">
              <Tag size="s" scheme="neutral">
                New arrival
              </Tag>
              <Tag size="s" scheme="success">
                In stock
              </Tag>
            </Row>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {product.brand}
            </Text>
            <Heading variant="display-strong-xs">{product.name}</Heading>
            <Row gap="12" vertical="center">
              <Row gap="4" vertical="center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon
                    key={index}
                    name={index < Math.floor(product.rating) ? "starFill" : "star"}
                    size="xs"
                    onBackground={
                      index < Math.floor(product.rating) ? "warning-strong" : "neutral-weak"
                    }
                  />
                ))}
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {product.rating} ({product.reviews} reviews)
              </Text>
            </Row>
            <Row gap="12" vertical="end">
              <Heading variant="heading-strong-xl">${product.price}</Heading>
              <Text
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ textDecoration: "line-through" }}
              >
                ${product.compareAt}
              </Text>
            </Row>
          </Column>

          <Line />

          <Column gap="12">
            <Text variant="heading-strong-s">Color</Text>
            <Row gap="8" wrap>
              {product.colors.map((color) => (
                <Button
                  key={color.value}
                  size="s"
                  variant={selectedColor === color.value ? "primary" : "secondary"}
                  onClick={() => setSelectedColor(color.value)}
                >
                  <Row gap="8" vertical="center">
                    <Row
                      minWidth="16"
                      minHeight="16"
                      radius="full"
                      solid={color.swatch}
                      border="neutral-alpha-medium"
                    />
                    {color.label}
                  </Row>
                </Button>
              ))}
            </Row>
          </Column>

          <Column gap="12">
            <Row fillWidth horizontal="between" vertical="center">
              <Text variant="heading-strong-s">Size</Text>
              <Button size="s" variant="tertiary">
                Size guide
              </Button>
            </Row>
            <Grid columns={5} fillWidth gap="8" s={{ columns: 3 }}>
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  fillWidth
                  size="s"
                  variant={selectedSize === size ? "primary" : "secondary"}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </Grid>
          </Column>

          <Column gap="12">
            <Text variant="heading-strong-s">Quantity</Text>
            <Row gap="8" vertical="center">
              <Row gap="4" vertical="center" background="surface" border radius="l" padding="4">
                <IconButton
                  icon="minus"
                  size="s"
                  variant="tertiary"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                />
                <Row minWidth="32" center>
                  <Text variant="label-strong-s" align="center">
                    {quantity}
                  </Text>
                </Row>
                <IconButton
                  icon="plus"
                  size="s"
                  variant="tertiary"
                  onClick={() => setQuantity(quantity + 1)}
                />
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Ships in 2–4 business days
              </Text>
            </Row>
          </Column>

          <Text variant="body-default-m" onBackground="neutral-medium">
            {product.description}
          </Text>

          <Row gap="12" s={{ direction: "column" }}>
            <Button fillWidth arrowIcon>
              Add to cart
            </Button>
            <Button fillWidth variant="secondary">
              Buy now
            </Button>
          </Row>

          <Grid columns={3} fillWidth gap="12" paddingTop="8">
            {[
              { icon: "cart" as const, label: "Free shipping", detail: "On orders over $100" },
              { icon: "return" as const, label: "Easy returns", detail: "30-day guarantee" },
              { icon: "security" as const, label: "Secure checkout", detail: "Encrypted payments" },
            ].map((item) => (
              <Card key={item.label} fillWidth padding="12" radius="l" border>
                <Column gap="8">
                  <Icon name={item.icon} size="s" onBackground="brand-medium" />
                  <Text variant="label-strong-s">{item.label}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {item.detail}
                  </Text>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
      </Row>
    </Column>
  );
};
