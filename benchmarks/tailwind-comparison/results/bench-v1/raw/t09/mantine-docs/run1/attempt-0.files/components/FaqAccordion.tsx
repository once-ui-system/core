"use client";

import { Accordion } from "@mantine/core";
import { faq } from "@/lib/data";

export function FaqAccordion() {
  return (
    <Accordion variant="separated" order={3} defaultValue={faq[0]?.q}>
      {faq.map((item) => (
        <Accordion.Item key={item.q} value={item.q}>
          <Accordion.Control>{item.q}</Accordion.Control>
          <Accordion.Panel>{item.a}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
