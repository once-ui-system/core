```tsx
"use client";

import React from "react";
import {
  Background,
  Button,
  Column,
  Heading,
  Row,
  Text,
} from "@once-ui-system/core";

type Brand = {
  name: string;
  icon: React.ReactNode;
};

const brands: Brand[] = [
  {
    name: "Northwind Labs",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M12 2 2 20h20L12 2Zm0 7 5.5 9h-11L12 9Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Lumen Health",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Packhorse",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Harbor & Co",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
          d="M3 14c3 0 3-4 6-4s3 4 6 4 3-4 6-4M3 20c3 0 3-4 6-4s3 4 6 4 3-4 6-4M3 8c3 0 3-4 6-4s3 4 6 4 3-4 6-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Switchyard",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M4 4h6v6H4zM14 14h6v6h-6zM10 7h4a3 3 0 0 1 3 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const css = `
.hero-gradient-text {
  background-image: linear-gradient(
    100deg,
    var(--brand-on-background-strong, #6d7cff) 0%,
    var(--accent-on-background-strong, #c06bff) 35%,
    var(--brand-on-background-strong, #6d7cff) 70%,
    var(--accent-on-background-strong, #c06bff) 100%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: hero-shimmer 6s linear infinite;
  display: inline-block;
}

@keyframes hero-shimmer {
  from { background-position: 0% 50%; }
  to { background-position: 250% 50%; }
}

@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-reveal {
  opacity: 0;
  animation: hero-fade-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
.hero-reveal-1 { animation-delay: 0.05s; }
.hero-reveal-2 { animation-delay: 0.15s; }
.hero-reveal-3 { animation-delay: 0.25s; }
.hero-reveal-4 { animation-delay: 0.35s; }
.hero-reveal-5 { animation-delay: 0.5s; }

.hero-brand-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px 40px;
}
.hero-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--neutral-on-background-weak, #8a8a8a);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: -0.01em;
  opacity: 0.85;
  transition: opacity 0.2s ease, color 0.2s ease;
}
.hero-brand:hover { opacity: 1; color: var(--neutral-on-background-strong, #fff); }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.3));
  background: var(--neutral-alpha-weak, rgba(128,128,128,0.08));
  font-size: 0.8125rem;
  color: var(--neutral-on-background-strong, inherit);
}
.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-solid-strong, #3ecf8e);
  box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.25);
}

.hero-glow {
  position: absolute;
  left: 50%;
  top: -10%;
  width: min(900px, 140vw);
  height: 520px;
  transform: translateX(-50%);
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--brand-solid-strong, #6d7cff) 35%, transparent) 0%,
    transparent 65%
  );
  filter: blur(40px);
  pointer-events: none;
  animation: hero-glow-pulse 9s ease-in-out infinite alternate;
}
@keyframes hero-glow-pulse {
  from { opacity: 0.6; transform: translateX(-50%) scale(1); }
  to { opacity: 1; transform: translateX(-50%) scale(1.08); }
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--neutral-alpha-weak, rgba(128,128,128,0.12)) 1px, transparent 1px),
    linear-gradient(90deg, var(--neutral-alpha-weak, rgba(128,128,128,0.12)) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
  pointer-events: none;
}

.hero-headline {
  font-size: clamp(2.5rem, 7vw + 0.5rem, 5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hero-gradient-text, .hero-glow { animation: none; }
  .hero-reveal { animation: none; opacity: 1; }
}
`;

export default function Page() {
  return (
    <Column as="main" fillWidth minHeight="100vh" horizontal="center" style={{ position: "relative", overflow: "hidden" }}>
      <style>{css}</style>

      {/* Background effects */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Background
          fill
          position="absolute"
          gradient={{
            display: true,
            opacity: 60,
            x: 50,
            y: 0,
            width: 100,
            height: 70,
            tilt: 0,
            colorStart: "brand-background-strong",
            colorEnd: "static-transparent",
          }}
          dots={{ display: true, opacity: 30, size: "24" }}
        />
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>

      <Column
        fillWidth
        horizontal="center"
        paddingX="l"
        paddingTop="80"
        paddingBottom="64"
        gap="48"
        style={{ position: "relative", zIndex: 1, maxWidth: "72rem" }}
      >
        <Column horizontal="center" align="center" gap="24" style={{ maxWidth: "52rem" }}>
          <div className="hero-reveal hero-reveal-1">
            <span className="hero-badge">
              <span className="hero-badge-dot" aria-hidden="true" />
              Now with real-time deploy previews
            </span>
          </div>

          <h1 className="hero-reveal hero-reveal-2 hero-headline">
            <Heading as="span" variant="display-strong-l" style={{ font: "inherit", letterSpacing: "inherit" }}>
              Ship product updates{" "}
              <span className="hero-gradient-text">ten times faster</span>
            </Heading>
          </h1>

          <div className="hero-reveal hero-reveal-3">
            <Text
              as="p"
              variant="body-default-l"
              onBackground="neutral-weak"
              style={{ maxWidth: "40rem", margin: 0, textWrap: "balance" }}
            >
              Meridian turns pull requests into production-ready releases with automated
              reviews, instant previews and one-click rollbacks, so your team spends less
              time waiting and more time building.
            </Text>
          </div>

          <div className="hero-reveal hero-reveal-4">
            <Row gap="12" horizontal="center" wrap>
              <Button href="#get-started" variant="primary" size="l" arrowIcon>
                Start free trial
              </Button>
              <Button href="#demo" variant="secondary" size="l">
                Book a demo
              </Button>
            </Row>
          </div>

          <div className="hero-reveal hero-reveal-4">
            <Text as="p" variant="body-default-s" onBackground="neutral-weak" style={{ margin: 0 }}>
              No credit card required · 14-day trial · Cancel anytime
            </Text>
          </div>
        </Column>

        <Column
          as="section"
          aria-labelledby="social-proof-heading"
          fillWidth
          horizontal="center"
          gap="24"
          className="hero-reveal hero-reveal-5"
        >
          <Text
            as="h2"
            id="social-proof-heading"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
            style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            Trusted by 4,000+ engineering teams worldwide
          </Text>
          <ul className="hero-brand-list" aria-label="Customer companies">
            {brands.map((brand) => (
              <li key={brand.name} className="hero-brand">
                {brand.icon}
                <span>{brand.name}</span>
              </li>
            ))}
          </ul>
        </Column>
      </Column>
    </Column>
  );
}
```