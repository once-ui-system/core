import Link from "next/link";
import { Box, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { brand, navLinks } from "@/lib/data";
import classes from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <Box component="footer" className={classes.footer} py="xl">
      <Container>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          <Stack gap="xs">
            <Title order={3} component="p">
              {brand.name}
            </Title>
            <Text c="dimmed" size="sm" maw={360}>
              {brand.description} Your data stays in the EU, encrypted at rest.
            </Text>
          </Stack>

          <Stack gap="xs" align="flex-start">
            <Text fw={600} size="sm" component="p">
              Explore
            </Text>
            <Group component="nav" aria-label="Footer" gap="md">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className={classes.link}>
                  {item.label}
                </Link>
              ))}
            </Group>
          </Stack>
        </SimpleGrid>

        <Text c="dimmed" size="xs" mt="xl">
          &copy; 2025 {brand.name}. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
