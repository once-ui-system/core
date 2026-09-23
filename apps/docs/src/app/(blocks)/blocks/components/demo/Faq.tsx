"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Faq1, Faq2, Faq3, Faq4, Faq5, Faq6, Faq7 } from "@/blocks/modules";

const FAQ_ITEMS = [
  {
    title: "What is our SaaS product?",
    content:
      "Our SaaS product is a cloud-based solution designed to help businesses manage their operations efficiently.",
  },
  {
    title: "How do I sign up?",
    content:
      "You can sign up by visiting our website and clicking on the 'Sign Up' button. Follow the instructions to create an account.",
  },
  {
    title: "What features are included?",
    content:
      "Our product includes features such as analytics, real-time collaboration, and customizable dashboards.",
  },
  {
    title: "Is there a free trial available?",
    content: "Yes, we offer a 14-day free trial for new users to explore our features.",
  },
  {
    title: "How do I contact support?",
    content: "You can contact our support team via email or live chat available on our website.",
  },
  {
    title: "What payment methods are accepted?",
    content: "We accept all major credit cards, PayPal, and bank transfers.",
  },
];

const examples: BlockExampleDef[] = [
  {
    id: "FAQ7",
    files: ["Faq7.tsx"],
    render: () => (
      <Column fill center background="page">
        <Faq7 maxWidth="l" paddingY="l" />
      </Column>
    ),
  },
  {
    id: "FAQ1",
    files: ["Faq1.tsx"],
    render: () => (
      <Column fill center>
        <Faq1
          title="Frequently asked questions"
          description="Get to know more about our product"
          content={FAQ_ITEMS}
        />
      </Column>
    ),
  },
  {
    id: "FAQ2",
    files: ["Faq2.tsx"],
    render: () => (
      <Column fill center>
        <Faq2
          title="Frequently asked questions"
          description="Get to know more about our product"
          content={FAQ_ITEMS}
        />
      </Column>
    ),
  },
  {
    id: "FAQ3",
    files: ["Faq3.tsx"],
    render: () => (
      <Column fill center>
        <Faq3
          title="Frequently asked questions"
          description="Get to know more about our product"
          categories={[
            {
              label: "Product",
              value: "product",
              content: [FAQ_ITEMS[0], FAQ_ITEMS[2]],
            },
            {
              label: "Account",
              value: "account",
              content: [FAQ_ITEMS[1], FAQ_ITEMS[3]],
            },
            {
              label: "Support",
              value: "support",
              content: [FAQ_ITEMS[4], FAQ_ITEMS[5]],
            },
          ]}
        />
      </Column>
    ),
  },
  {
    id: "FAQ4",
    files: ["Faq4.tsx"],
    render: () => (
      <Column fill center>
        <Faq4 maxWidth="m" />
      </Column>
    ),
  },
  {
    id: "FAQ5",
    files: ["Faq5.tsx"],
    render: () => (
      <Column fill center>
        <Faq5 maxWidth="m" />
      </Column>
    ),
  },
  {
    id: "FAQ6",
    files: ["Faq6.tsx"],
    render: () => (
      <Column fill center background="page">
        <Faq6 maxWidth="l" />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="faq" examples={examples} />;

export default Docs;
