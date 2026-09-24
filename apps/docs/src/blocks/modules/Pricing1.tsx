import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { Background1, Faq3, Plans3, Testimonial4 } from ".";

export const Pricing1 = () => {
  return (
    <Column as="section" fillWidth fitHeight horizontal="center" gap="xl">
      <Column maxWidth={40} gap="12" horizontal="center">
        <Heading as="h2" align="center" variant="display-strong-m">
          Pricing
        </Heading>
        <Text align="center" onBackground="neutral-medium" variant="body-default-xl" wrap="balance">
          Use our product free. Upgrade for advanced features.
        </Text>
      </Column>
      <Plans3 maxWidth="m" />
      <Row maxWidth="m" marginY="l" padding="l" radius="xl" overflow="hidden" horizontal="center">
        <Background1 top="0" left="0" />
        <Testimonial4
          maxWidth="s"
          content="Once UI was a great pick for Dopler. It wouldn't made much sense to use anything else!"
          name="Lorant One"
          company={{ name: "Dopler", url: "https://dopler.app" }}
          avatar="/images/creators/lorant.jpg"
          role="Founder"
        />
      </Row>
      <Faq3
        maxWidth="m"
        title="Frequently asked questions"
        description="Get to know more about our product"
        categories={[
          {
            label: "Product",
            value: "product",
            content: [
              {
                title: "What is our SaaS product?",
                content:
                  "Our SaaS product is a cloud-based solution designed to help businesses manage their operations efficiently.",
              },
              {
                title: "What features are included?",
                content:
                  "Our product includes features such as analytics, real-time collaboration, and customizable dashboards.",
              },
            ],
          },
          {
            label: "Account",
            value: "account",
            content: [
              {
                title: "How do I sign up?",
                content:
                  "You can sign up by visiting our website and clicking on the 'Sign Up' button. Follow the instructions to create an account.",
              },
              {
                title: "Is there a free trial available?",
                content: "Yes, we offer a 14-day free trial for new users to explore our features.",
              },
            ],
          },
          {
            label: "Support",
            value: "support",
            content: [
              {
                title: "How do I contact support?",
                content:
                  "You can contact our support team via email or live chat available on our website.",
              },
              {
                title: "What payment methods are accepted?",
                content: "We accept all major credit cards, PayPal, and bank transfers.",
              },
            ],
          },
        ]}
      />
    </Column>
  );
};
