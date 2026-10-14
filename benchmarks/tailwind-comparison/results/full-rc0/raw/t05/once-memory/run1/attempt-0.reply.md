The library isn't available to inspect, so I'll stick to the Once UI APIs I'm confident about (`Column`, `Row`, `Flex`, `Heading`, `Text`, `Button`, `Background`, `Line`, `Tag`, `Icon`, `Badge`, `RevealFx`, `TiltFx`-free), and use plain CSS-in-JSX only for the bits that need keyframes.

For the text effect I'll use a gradient-clipped span with an animated shimmer, respecting `prefers-reduced-motion`. For the background effect I'll use layered CSS radial gradients with a masked grid plus slow-drifting blobs, implemented with a scoped `<style>` tag, rather than depending on the `Background` component's prop shape.

```tsx
"use client";

import {
  Badge,
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  Row,
  Text,
} from "@once-ui-system/core";

const logos: { name: string; mark: React.ReactNode }[] = [
  {
    name: "Northwind",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path d="M12 2 2 22h6l4-9 4 9h6L12 2Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Lumen Labs",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="5" fill="currentColor" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Packet & Co",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Helix Systems",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M6 3c0 6 12 6 12 12s-12 6-12 6M18 3c0 6-12 6-12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Orbital",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          transform="rotate(-25 12 12)"
        />
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Fieldstone",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path d="M3 20 9 6l4 8 3-5 5 11H3Z" fill="currentColor" />
      </svg>
    ),
  },
];

const stats = [
  { value: "4.9/5", label: "average rating from 2,100+ reviews" },
  { value: "38%", label: "faster releases in the first quarter" },
  { value: "99.99%", label: "uptime over the last 12 months" },
];

const styles = `
.hero-root {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--neutral-alpha-weak) 1px, transparent 1px),
    linear-gradient(to bottom, var(--neutral-alpha-weak) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 20%, transparent 75%);
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  will-change: transform;
}

.hero-blob-a {
  width: min(560px, 80vw);
  height: min(560px, 80vw);
  top: -18%;
  left: -8%;
  background: radial-gradient(circle at 30% 30%, var(--brand-solid-medium), transparent 70%);
  animation: hero-drift-a 18s ease-in-out infinite alternate;
}

.hero-blob-b {
  width: min(520px, 75vw);
  height: min(520px, 75vw);
  top: -10%;
  right: -10%;
  background: radial-gradient(circle at 60% 40%, var(--accent-solid-medium), transparent 70%);
  animation: hero-drift-b 22s ease-in-out infinite alternate;
}

.hero-blob-c {
  width: min(480px, 70vw);
  height: min(480px, 70vw);
  bottom: -30%;
  left: 30%;
  background: radial-gradient(circle at 50% 50%, var(--brand-solid-weak), transparent 70%);
  opacity: 0.35;
  animation: hero-drift-c 26s ease-in-out infinite alternate;
}

.hero-fade {
  position: absolute;
  inset: auto 0 0 0;
  height: 30%;
  background: linear-gradient(to bottom, transparent, var(--page-background));
}

@keyframes hero-drift-a {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to   { transform: translate3d(60px, 40px, 0) scale(1.12); }
}
@keyframes hero-drift-b {
  from { transform: translate3d(0, 0, 0) scale(1.05); }
  to   { transform: translate3d(-70px, 50px, 0) scale(0.95); }
}
@keyframes hero-drift-c {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to   { transform: translate3d(-40px, -40px, 0) scale(1.15); }
}

.hero-gradient-text {
  background-image: linear-gradient(
    100deg,
    var(--brand-on-background-strong) 0%,
    var(--accent-on-background-strong) 35%,
    var(--brand-on-background-medium) 60%,
    var(--accent-on-background-strong) 100%
  );
  background-size: 220% 100%;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: hero-shimmer 7s ease-in-out infinite alternate;
  padding-bottom: 0.08em;
}

@keyframes hero-shimmer {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}

.hero-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--neutral-on-background-medium);
  opacity: 0.8;
  transition: opacity 0.2s ease, color 0.2s ease;
}
.hero-logo:hover { opacity: 1; color: var(--neutral-on-background-strong); }

.hero-logo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 16px;
  justify-items: center;
  width: 100%;
  max-width: 900px;
}
@media (min-width: 640px) {
  .hero-logo-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1000px) {
  .hero-logo-list { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}

.hero-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  max-width: 900px;
}
@media (min-width: 640px) {
  .hero-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.hero-cta-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  max-width: 420px;
}
@media (min-width: 560px) {
  .hero-cta-row { flex-direction: row; justify-content: center; align-items: center; max-width: none; width: auto; }
}

.hero-skip:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .hero-blob,
  .hero-gradient-text {
    animation: none !important;
  }
}
`;

export default function Page() {
  return (
    <Column as="main" fillWidth id="main">
      <style>{styles}</style>

      <section className="hero-root" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-blob hero-blob-a" />
          <div className="hero-blob hero-blob-b" />
          <div className="hero-blob hero-blob-c" />
          <div className="hero-grid" />
          <div className="hero-fade" />
        </div>

        <Column
          fillWidth
          horizontal="center"
          paddingX="l"
          paddingTop="xl"
          paddingBottom="xl"
          gap="xl"
          style={{ maxWidth: 1200, margin: "0 auto" }}
        >
          <Column horizontal="center" gap="24" paddingTop="48" style={{ textAlign: "center", maxWidth: 860 }}>
            <Badge
              textVariant="label-default-s"
              arrow={false}
              paddingX="12"
              paddingY="4"
              onBackground="neutral-strong"
            >
              <Row gap="8" vertical="center">
                <Icon name="sparkle" size="xs" onBackground="brand-weak" />
                <span>New: Workflow Automations 2.0 is live</span>
              </Row>
            </Badge>

            <Heading
              as="h1"
              id="hero-title"
              variant="display-strong-xl"
              wrap="balance"
              style={{
                fontSize: "clamp(2.4rem, 7vw, 5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Ship your product roadmap{" "}
              <span className="hero-gradient-text">in half the time</span>
            </Heading>

            <Text
              as="p"
              variant="body-default-l"
              onBackground="neutral-weak"
              wrap="balance"
              style={{ maxWidth: 640, fontSize: "clamp(1rem, 2.2vw, 1.25rem)", lineHeight: 1.6 }}
            >
              Meridian brings planning, reviews and releases into one calm workspace, so
              your team spends less time coordinating and more time shipping work customers
              notice.
            </Text>

            <div className="hero-cta-row">
              <Button
                href="#start"
                variant="primary"
                size="l"
                arrowIcon
                data-border="rounded"
              >
                Start free trial
              </Button>
              <Button
                href="#demo"
                variant="secondary"
                size="l"
                prefixIcon="play"
                data-border="rounded"
              >
                Watch 2-min demo
              </Button>
            </div>

            <Text variant="body-default-s" onBackground="neutral-weak">
              14-day free trial · No credit card required · Cancel anytime
            </Text>
          </Column>

          <Column horizontal="center" gap="24" fillWidth paddingTop="32">
            <Text
              as="p"
              variant="label-default-s"
              onBackground="neutral-weak"
              style={{ textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center" }}
            >
              Trusted by 3,000+ teams at fast-moving companies
            </Text>

            <Flex fillWidth horizontal="center">
              <ul className="hero-logo-list" aria-label="Companies that use Meridian">
                {logos.map((logo) => (
                  <li key={logo.name} className="hero-logo">
                    {logo.mark}
                    <Text variant="heading-strong-s" as="span" style={{ color: "inherit" }}>
                      {logo.name}
                    </Text>
                  </li>
                ))}
              </ul>
            </Flex>
          </Column>

          <Flex fillWidth horizontal="center" paddingTop="16">
            <ul className="hero-stats" aria-label="Customer results">
              {stats.map((stat) => (
                <li key={stat.value}>
                  <Column
                    horizontal="center"
                    gap="4"
                    padding="16"
                    radius="l"
                    border="neutral-alpha-weak"
                    background="surface"
                    style={{ textAlign: "center", height: "100%" }}
                  >
                    <Heading as="p" variant="display-strong-xs">
                      {stat.value}
                    </Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {stat.label}
                    </Text>
                  </Column>
                </li>
              ))}
            </ul>
          </Flex>
        </Column>
      </section>
    </Column>
  );
}
```