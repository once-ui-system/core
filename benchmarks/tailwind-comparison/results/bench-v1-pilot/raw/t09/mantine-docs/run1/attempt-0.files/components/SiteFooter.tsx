import Link from "next/link";
import { Anchor, Container, Group, Stack, Text } from "@mantine/core";
import { brand, navLinks } from "@/lib/data";
import classes from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={classes.footer}>
      <Container>
        <div className={classes.inner}>
          <Stack gap="xs" maw={360}>
            <Text className={classes.logo}>{brand.name}</Text>
            <Text size="sm" c="dimmed">
              {brand.tagline}.
            </Text>
          </Stack>

          <nav aria-label="Footer">
            <Group gap="lg" wrap="wrap">
              {navLinks.map((link) => (
                <Anchor key={link.href} component={Link} href={link.href} size="sm">
                  {link.label}
                </Anchor>
              ))}
            </Group>
          </nav>
        </div>

        <Text size="xs" c="dimmed" className={classes.legal}>
          © {new Date().getFullYear()} Lumen. Your data is stored in the EU, encrypted at rest.
        </Text>
      </Container>
    </footer>
  );
}
