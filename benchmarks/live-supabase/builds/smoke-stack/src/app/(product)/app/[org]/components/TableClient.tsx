"use client";

import {
  Row,
  Text,
  Avatar,
} from "@once-ui-system/core";
import { Table, type TableColumn } from "../../../components/Table";

export default function TableClient() {
  const ordersData = [
    { id: "#1024", customer: { name: "Lorant", avatar: "/images/lorant.jpg" }, date: "2025-01-18", total: "$129.00", shipping: "Shipped", method: "UPS Ground" },
    { id: "#1023", customer: { name: "Lorant", avatar: "/images/lorant.jpg" }, date: "2025-01-17", total: "$349.00", shipping: "Processing", method: "DHL Express" },
    { id: "#1022", customer: { name: "Lorant", avatar: "/images/lorant.jpg" }, date: "2025-01-16", total: "$79.00", shipping: "Delivered", method: "USPS" },
    { id: "#1021", customer: { name: "Lorant", avatar: "/images/lorant.jpg" }, date: "2025-01-15", total: "$559.00", shipping: "Cancelled", method: "—" },
    { id: "#1020", customer: { name: "Lorant", avatar: "/images/lorant.jpg" }, date: "2025-01-14", total: "$219.00", shipping: "Pending", method: "FedEx" },
  ];

  type Order = (typeof ordersData)[number];

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
      render: (item) => <Text variant="label-default-s" onBackground="neutral-weak">{item.date}</Text>,
    },
    {
      key: "shipping",
      title: <Text variant="label-default-s">Shipping</Text>,
      render: (item) => (
        <Row gap="8" vertical="center">
          <Text variant="label-default-s">{item.shipping}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">{item.method}</Text>
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

  return (
    <Table
      background="surface"
      heading={<Text variant="heading-strong-s">Orders & Shipping</Text>}
      data={ordersData}
      columns={orderColumns}
      selectable
      getId={(i) => i.id}
      showSearch
      filterFn={(item, q) => [item.id, item.customer?.name, item.date, item.total, item.shipping, item.method].filter(Boolean).some((v: string) => v.toLowerCase().includes(q))}
    />
  );
};