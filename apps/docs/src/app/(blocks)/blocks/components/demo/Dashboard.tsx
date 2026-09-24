"use client";

import { Avatar, Column, Row, Text } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Dashboard1, Dashboard2, Dashboard3, Table1, type TableColumn } from "@/blocks/modules";

interface Order {
  id: string;
  customer: { name: string; avatar: string };
  date: string;
  total: string;
  shipping: string;
  method: string;
}

const ordersData: Order[] = [
  {
    id: "#1024",
    customer: { name: "Lorant", avatar: "/images/creators/lorant.jpg" },
    date: "2025-01-18",
    total: "$129.00",
    shipping: "Shipped",
    method: "UPS Ground",
  },
  {
    id: "#1023",
    customer: { name: "Divyanshu", avatar: "/images/creators/div.jpg" },
    date: "2025-01-17",
    total: "$349.00",
    shipping: "Processing",
    method: "DHL Express",
  },
  {
    id: "#1022",
    customer: { name: "Justin", avatar: "/images/creators/justin.jpg" },
    date: "2025-01-16",
    total: "$79.00",
    shipping: "Delivered",
    method: "USPS",
  },
  {
    id: "#1021",
    customer: { name: "Vincent", avatar: "/images/creators/vincent.jpg" },
    date: "2025-01-15",
    total: "$559.00",
    shipping: "Cancelled",
    method: "—",
  },
  {
    id: "#1020",
    customer: { name: "Texz", avatar: "/images/creators/texz.jpg" },
    date: "2025-01-14",
    total: "$219.00",
    shipping: "Pending",
    method: "FedEx",
  },
];

const orderColumns: TableColumn<Order>[] = [
  {
    key: "order",
    title: <Text variant="label-default-s">Order</Text>,
    render: (item) => (
      <Row gap="12" vertical="center">
        <Text variant="label-default-s">{item.id}</Text>
      </Row>
    ),
  },
  {
    key: "customer",
    title: <Text variant="label-default-s">Customer</Text>,
    render: (item) => (
      <Row gap="12" vertical="center">
        <Avatar size="xs" src={item.customer?.avatar} />
        <Text variant="label-default-s">{item.customer?.name}</Text>
      </Row>
    ),
  },
  {
    key: "date",
    title: <Text variant="label-default-s">Date</Text>,
    render: (item) => (
      <Text variant="label-default-s" onBackground="neutral-weak">
        {item.date}
      </Text>
    ),
  },
  {
    key: "shipping",
    title: <Text variant="label-default-s">Shipping</Text>,
    render: (item) => (
      <Row gap="8" vertical="center">
        <Text variant="label-default-s">{item.shipping}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {item.method}
        </Text>
      </Row>
    ),
  },
  {
    key: "total",
    title: <Text variant="label-default-s">Total</Text>,
    align: "end",
    render: (item) => <Text variant="label-default-s">{item.total}</Text>,
  },
];

const examples: BlockExampleDef[] = [
  {
    id: "Dashboard3",
    files: ["Dashboard3.tsx"],
    render: () => (
      <Column fillWidth fitHeight center background="page">
        <Dashboard3 />
      </Column>
    ),
  },
  {
    id: "Dashboard2",
    files: ["Dashboard2.tsx", "Header1.tsx", "Sidebar1.tsx"],
    render: () => (
      <Row fill background="page">
        <Dashboard2 />
      </Row>
    ),
  },
  {
    id: "Dashboard1",
    files: ["Dashboard1.tsx", "Header1.tsx", "Sidebar1.tsx", "Table1.tsx"],
    render: () => (
      <Row fill background="page">
        <Dashboard1 />
      </Row>
    ),
  },
  {
    id: "Table1",
    files: ["Table1.tsx"],
    render: () => (
      <Row fillWidth fitHeight>
        <Table1
          background="surface"
          heading={<Text variant="label-default-m">Orders & Shipping</Text>}
          data={ordersData}
          columns={orderColumns}
          selectable
          getId={(i) => i.id}
          showSearch
          filterFn={(item, q) =>
            [item.id, item.customer?.name, item.date, item.total, item.shipping, item.method]
              .filter(Boolean)
              .some((v: string) => v.toLowerCase().includes(q))
          }
        />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="dashboard" examples={examples} />;

export default Docs;
