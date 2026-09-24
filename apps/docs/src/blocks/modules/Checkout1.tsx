import {
  Button,
  Card,
  Column,
  Icon,
  Input,
  Line,
  Media,
  Row,
  Select,
  Text,
} from "@once-ui-system/core";
import { Header4 } from "./Header4";

export const Checkout1 = () => {
  const products = [
    {
      id: "prod-1",
      name: "Running shoes",
      variant: "Size 8, Black",
      image: "/images/demos/ecommerce_01.jpg",
      price: 80.0,
      qty: 1,
    },
    {
      id: "prod-2",
      name: "Headphones",
      variant: "Noise-cancelling",
      image: "/images/demos/ecommerce_02.jpg",
      price: 110.0,
      qty: 2,
    },
  ];

  const cartCount = products.reduce((sum, p) => sum + p.qty, 0);
  const subtotal = products.reduce((sum, p) => sum + p.price * p.qty, 0);
  const taxRate = 0.1;
  const taxes = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + taxes).toFixed(2);

  return (
    <Column fillWidth horizontal="center">
      <Header4 cartCount={cartCount} />
      <Row maxWidth="xl" s={{ direction: "column" }} padding="8">
        <Column
          borderLeft="surface"
          background="surface"
          fillWidth
          gap="8"
          padding="xl"
          radius="xl"
        >
          {products.map((product, index) => (
            <Card key={index} vertical="center" fitHeight fillWidth radius="l">
              <Row minWidth="64" minHeight="64">
                <Media
                  stretch
                  aspectRatio="1 / 1"
                  sizes="120px"
                  border="neutral-medium"
                  radius="l"
                  alt={product.name}
                  src={product.image}
                />
                <Row
                  position="absolute"
                  right="0"
                  top="0"
                  height="24"
                  width="24"
                  vertical="center"
                  horizontal="center"
                  textVariant="body-default-xs"
                  background="neutral-weak"
                  onBackground="neutral-strong"
                  border="neutral-medium"
                  bottomLeftRadius="m"
                  topRightRadius="m"
                >
                  {product.qty}
                </Row>
              </Row>
              <Row fillWidth vertical="center" paddingX="20">
                <Column gap="2" fillWidth>
                  <Text variant="body-strong-s">{product.name}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {product.variant}
                  </Text>
                </Column>
                <Text variant="body-default-s">
                  {`$${(product.price * product.qty).toFixed(2)}`}
                </Text>
              </Row>
            </Card>
          ))}
          <Row gap="8" fillWidth vertical="center" marginTop="24">
            <Input
              autoComplete="off"
              id="discount"
              placeholder="Discount code"
              suffix={
                <Button
                  style={{ marginRight: "calc(-1 * var(--static-space-4))" }}
                  size="s"
                  label="Apply"
                />
              }
            />
          </Row>
          <Column gap="8" fillWidth paddingY="32" paddingX="16">
            <Row
              fillWidth
              textVariant="body-default-s"
              onBackground="neutral-weak"
              horizontal="between"
            >
              <Text>Subtotal</Text>
              <Text>{`$${subtotal.toFixed(2)}`}</Text>
            </Row>
            <Row
              fillWidth
              textVariant="body-default-s"
              onBackground="neutral-weak"
              horizontal="between"
            >
              <Text>Taxes</Text>
              <Text>{`$${taxes.toFixed(2)}`}</Text>
            </Row>
            <Row marginTop="8" fillWidth textVariant="body-strong-s" horizontal="between">
              <Text>Total</Text>
              <Text>{`$${total.toFixed(2)}`}</Text>
            </Row>
          </Column>
        </Column>

        <Column fillWidth gap="24" paddingX="xl" paddingY="l">
          <Button size="m" fillWidth prefixIcon="apple" label="Pay" />
          <Row vertical="center" gap="16" paddingY="16">
            <Line key="line-4" />
            <Text wrap="nowrap" variant="body-default-s" onBackground="neutral-weak" align="center">
              Or pay another way
            </Text>
            <Line key="line-5" />
          </Row>
          <Column fillWidth gap="8">
            <Text variant="body-strong-s">Email</Text>
            <Input autoComplete="off" id="email" placeholder="mail@example.com" />
          </Column>
          <Column fillWidth gap="8">
            <Text variant="body-strong-s">Card information</Text>
            <Column fillWidth gap="-1">
              <Input
                corners="top"
                autoComplete="off"
                id="cardNumber"
                placeholder="1234 1234 1234 1234"
                suffix={
                  <Row gap="4">
                    <Icon name="visa" />
                    <Icon name="mastercard" />
                    <Icon name="amex" />
                    <Icon name="discover" />
                  </Row>
                }
              />
              <Row fillWidth gap="-1">
                <Input
                  corners="bottom-left"
                  autoComplete="off"
                  id="cardExpiry"
                  placeholder="MM / YY"
                />
                <Input corners="bottom-right" autoComplete="off" id="cardCvc" placeholder="CVC" />
              </Row>
            </Column>
          </Column>
          <Column fillWidth gap="8">
            <Text variant="body-strong-s">Name on card</Text>
            <Input autoComplete="off" id="name" placeholder="Jane Smith" />
          </Column>
          <Column fillWidth gap="8" paddingBottom="16">
            <Text variant="body-strong-s">Country or region</Text>
            <Select
              id="country"
              placeholder="United States"
              options={[
                {
                  label: "United States",
                  value: "us",
                },
                {
                  label: "Canada",
                  value: "ca",
                },
                {
                  label: "United Kingdom",
                  value: "uk",
                },
                {
                  label: "Australia",
                  value: "au",
                },
                {
                  label: "Germany",
                  value: "de",
                },
                {
                  label: "Japan",
                  value: "jp",
                },
                {
                  label: "India",
                  value: "in",
                },
                {
                  label: "Rest of the world",
                  value: "world",
                },
              ]}
              value="United States"
              onSelect={() => {}}
            />
          </Column>
          <Button size="m" fillWidth label="Pay" />
        </Column>
      </Row>
    </Column>
  );
};
