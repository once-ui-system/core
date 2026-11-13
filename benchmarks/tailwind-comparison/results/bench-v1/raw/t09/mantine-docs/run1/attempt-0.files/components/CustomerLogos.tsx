import { Container, Text } from "@mantine/core";
import { logos } from "@/lib/data";
import classes from "./CustomerLogos.module.css";

export function CustomerLogos() {
  return (
    <section id="customers" aria-labelledby="customers-title" className={classes.section}>
      <Container>
        <Text id="customers-title" className={classes.label}>
          Trusted by small teams shipping real software
        </Text>
        <ul className={classes.list}>
          {logos.map((name) => (
            <li key={name} className={classes.item}>
              {name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
