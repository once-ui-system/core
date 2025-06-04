import {
  Heading,
  Text,
  Button,
  Column,
  Badge,
  Logo,
  Line,
  LetterFx,
  StylePanel,
  ThemeSwitcher,
} from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules";

export default function Home() {
  return (
    <Column fillWidth center padding="l">
      <StylePanel/>
      <ThemeSwitcher/>
      <LineChart
        title="Tesla employee vs Elon Musk vs Hungary"
        description="Monthly compensation / state budget"
        axis="x"
        curve="step"
        date={{
          format: "yyyy",
        }}
        series={[
          { key: "Tesla Employee" },
          { key: "Elon Musk" },
          { key: "Hungary" }
        ]}
        data={[
          { date: "2000-01-01", "Elon Musk": 5000, "Tesla Employee": 3000, "Hungary": 2500000000 },
          { date: "2005-01-01", "Elon Musk": 5000, "Tesla Employee": 4200, "Hungary": 4000000000 },
          { date: "2010-01-01", "Elon Musk": 0, "Tesla Employee": 5500, "Hungary": 5000000000 },
          { date: "2015-01-01", "Elon Musk": 10000, "Tesla Employee": 6300, "Hungary": 6000000000 },
          { date: "2018-01-01", "Elon Musk": 100000000, "Tesla Employee": 7000, "Hungary": 6800000000 },
          { date: "2020-01-01", "Elon Musk": 2800000000, "Tesla Employee": 7600, "Hungary": 7500000000 },
          { date: "2023-01-01", "Elon Musk": 4500000000, "Tesla Employee": 8300, "Hungary": 7900000000 },
          { date: "2025-01-01", "Elon Musk": 5600000000, "Tesla Employee": 8800, "Hungary": 8200000000 }
        ]}
      />
      <Column maxWidth="s" horizontal="center" gap="l" align="center">
        <Badge
          textVariant="code-default-s"
          border="neutral-alpha-medium"
          onBackground="neutral-medium"
          vertical="center"
          gap="16"
        >
          <Logo icon={false} href="https://once-ui.com" size="xs" />
          <Line vert background="neutral-alpha-strong" />
          <Text marginX="4">
            <LetterFx trigger="instant">An ecosystem, not a UI kit</LetterFx>
          </Text>
        </Badge>
        <Heading variant="display-strong-xl" marginTop="24">
          Presence that doesn't beg for attention
        </Heading>
        <Text
          variant="heading-default-xl"
          onBackground="neutral-weak"
          wrap="balance"
          marginBottom="16"
        >
          Build with clarity, speed, and quiet confidence
        </Text>
        <Button
          id="docs"
          href="https://docs.once-ui.com/once-ui/quick-start"
          data-border="rounded"
          weight="default"
          prefixIcon="copy"
          arrowIcon
        >
          Explore docs
        </Button>
      </Column>
    </Column>
  );
}
