"use client";

import {
  Background,
  Button,
  Column,
  Heading,
  Row,
  Text,
} from "@once-ui-system/core";

type Logo = {
  name: string;
  mark: React.ReactNode;
};

const logos: Logo[] = [
  {
    name: "Northwind",
    mark: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M12 2 3 20h4.5L12 11l4.5 9H21L12 2Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Lumen Labs",
    mark: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Cobalt",
    mark: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Fieldstone",
    mark: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M3 18 9 6l4 8 3-5 5 9H3Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Parallel",
    mark: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M7 3h4L7 21H3L7 3Zm10 0h4l-4 18h-4l4-18Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Helix",
    mark: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
          d="M6 3c0 6 12 6 12 12s-12 6-12 6M18 3c0 6-12 6-12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const heroStyles = `
  .hero-gradient-text {
    background-image: linear-gradient(
      100deg,
      var(--brand-on-background-strong, #6d5efc) 0%,
      var(--accent-on-background-strong, #22c1c3) 35%,
      var(--brand-on-background-medium, #8b7bff) 70%,
      var(--brand-on-background-strong, #6d5efc) 100%
    );
    background-size: 220% 100%;
    background-position: 0% 50%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    animation: hero-shimmer 8s ease-in-out infinite alternate;
  }

  @keyframes hero-shimmer {
    from { background-position: 0% 50%; }
    to { background-position: 100% 50%; }
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.2;
    color: var(--brand-on-background-strong, #6d5efc);
    background: color-mix(in srgb, var(--brand-solid-strong, #6d5efc) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--brand-solid-strong, #6d5efc) 35%, transparent);
  }
  .hero-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }

  .hero-logo {
    opacity: 0.7;
    transition: opacity 160ms ease;
  }
  .hero-logo:hover { opacity: 1; }

  .hero-logo-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 16px;
    width: 100%;
    max-width: 880px;
  }
  @media (min-width: 640px) {
    .hero-logo-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (min-width: 1000px) {
    .hero-logo-list { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  }

  .hero-glow {
    position: absolute;
    left: 50%;
    top: -10%;
    width: min(900px, 140vw);
    height: 520px;
    transform: translateX(-50%);
    background: radial-gradient(
      closest-side,
      color-mix(in srgb, var(--brand-solid-strong, #6d5efc) 35%, transparent),
      transparent
    );
    filter: blur(40px);
    opacity: 0.8;
    animation: hero-float 12s ease-in-out infinite alternate;
    pointer-events: none;
  }

  @keyframes hero-float {
    from { transform: translateX(-50%) translateY(0); }
    to { transform: translateX(-50%) translateY(24px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-gradient-text, .hero-glow { animation: none; }
    .hero-logo { transition: none; }
  }
`;

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" style={{ position: "relative", overflow: "hidden" }}>
      <style>{heroStyles}</style>

      {/* Background effect */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <Background
          position="absolute"
          fill
          mask={{ x: 50, y: 0, radius: 100 }}
          grid={{ display: true, opacity: 40, width: "4rem", height: "4rem", color: "neutral-alpha-weak" }}
          dots={{ display: true, opacity: 40, size: "2", color: "brand-alpha-medium" }}
        />
        <div className="hero-glow" />
      </div>

      <Column
        fillWidth
        horizontal="center"
        gap="48"
        paddingX="l"
        paddingTop="80"
        paddingBottom="64"
        style={{ position: "relative", zIndex: 1, maxWidth: 1120 }}
      >
        {/* Hero copy */}
        <Column horizontal="center" align="center" gap="24" style={{ maxWidth: 820 }}>
          <span className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            New: Workflow automations 2.0
          </span>

          <Heading as="h1" variant="display-strong-l" wrap="balance" align="center">
            Ship customer insight{" "}
            <span className="hero-gradient-text">ten times faster</span>
          </Heading>

          <Text
            as="p"
            variant="body-default-xl"
            onBackground="neutral-weak"
            wrap="balance"
            align="center"
          >
            Beacon turns scattered feedback from support, sales calls and surveys into a single,
            prioritized roadmap, so your team spends less time sorting and more time building what
            customers actually ask for.
          </Text>

          <Row gap="12" horizontal="center" wrap marginTop="8">
            <Button href="#start-trial" variant="primary" size="l" arrowIcon>
              Start free trial
            </Button>
            <Button href="#demo" variant="secondary" size="l" prefixIcon="play">
              Watch 2-minute demo
            </Button>
          </Row>

          <Text as="p" variant="body-default-s" onBackground="neutral-weak" align="center">
            No credit card required · 14-day trial · Cancel anytime
          </Text>
        </Column>

        {/* Social proof */}
        <Column as="section" aria-labelledby="social-proof-title" horizontal="center" gap="24" fillWidth>
          <Text
            as="h2"
            id="social-proof-title"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by product teams at 2,400+ companies
          </Text>

          <ul className="hero-logo-list">
            {logos.map((logo) => (
              <li key={logo.name} style={{ display: "flex", justifyContent: "center" }}>
                <Row
                  className="hero-logo"
                  gap="8"
                  vertical="center"
                  onBackground="neutral-strong"
                >
                  {logo.mark}
                  <Text variant="heading-strong-s" onBackground="neutral-strong">
                    {logo.name}
                  </Text>
                </Row>
              </li>
            ))}
          </ul>
        </Column>
      </Column>
    </Column>
  );
}
