"use client";

import { Accordion, Container, Title } from "@mantine/core";
import { faq } from "@/lib/data";
import classes from "./Pricing.module.css";

export function FaqAccordion() {
  return (
    <Container
      size="md"
      className={classes.section}
      component="section"
      aria-labelledby="faq-title"
    >
      <Title order={2} id="faq-title" mb="lg">
        Frequently asked questions
      </Title>
      <Accordion variant="separated" order={3} defaultValue={faq[0]?.q}>
        {faq.map((item) => (
          <Accordion.Item key={item.q} value={item.q}>
            <Accordion.Control>{item.q}</Accordion.Control>
            <Accordion.Panel>{item.a}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
