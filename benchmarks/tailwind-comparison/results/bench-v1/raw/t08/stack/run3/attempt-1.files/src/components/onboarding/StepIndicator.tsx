import { Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { steps } from "@/lib/onboarding-data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Setup progress">
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={s.id}
              aria-current={active ? "step" : undefined}
              style={{ flex: "1 1 120px", minWidth: 0 }}
            >
              <Column gap="8">
                <div
                  aria-hidden="true"
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    background:
                      done || active
                        ? "var(--brand-solid-strong)"
                        : "var(--neutral-alpha-medium)",
                    opacity: done ? 0.6 : 1,
                  }}
                />
                <Row gap="8" vertical="center">
                  <Row
                    center
                    width="24"
                    height="24"
                    radius="full"
                    background={done || active ? "brand-strong" : "neutral-alpha-weak"}
                    onBackground={done || active ? "brand-strong" : "neutral-medium"}
                  >
                    {done ? (
                      <Icon name="check" size="xs" />
                    ) : (
                      <Text variant="label-strong-xs">{i + 1}</Text>
                    )}
                  </Row>
                  <Text
                    variant={active ? "label-strong-s" : "label-default-s"}
                    onBackground={active ? "neutral-strong" : "neutral-weak"}
                  >
                    {s.title}
                    <VisuallyHidden>
                      {done ? " (completed)" : active ? " (current step)" : ""}
                    </VisuallyHidden>
                  </Text>
                </Row>
              </Column>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
