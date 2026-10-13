```tsx
"use client";

import type { CSSProperties, ReactNode } from "react";
import { Badge, Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Logo = { name: string; mark: ReactNode };

const iconProps = {
  width: 28,
  height: 28,
  viewBox: "0 0 28 28",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const logos: Logo[] = [
  {
    name: "Northwind",
    mark: (
      <svg {...iconProps}>
        <path d="M4 22 14 5l10 17" />
        <path d="M9 22l5-8 5 8" />
      </svg>
    ),
  },
  {
    name: "Lumenly",
    mark: (
      <svg {...iconProps}>
        <circle cx="14" cy="14" r="5" />
        <path d="M14 3v3M14 22v3M3 14h3M22 14h3M6.2 6.2l2.1 2.1M19.7 19.7l2.1 2.1M6.2 21.8l2.1-2.1M19.7 8.3l2.1-2.1" />
      </svg>
    ),
  },
  {
    name: "Stackbridge",
    mark: (
      <svg {...iconProps}>
        <rect x="5" y="5" width="18" height="6" rx="2" />
        <rect x="5" y="17" width="18" height="6" rx="2" />
        <path d="M14 11v6" />
      </svg>
    ),
  },
  {
    name: "Overtone",
    mark: (
      <svg {...iconProps}>
        <path d="M3 14c3-8 5-8 7 0s4 8 7 0 4-8 8 0" />
      </svg>
    ),
  },
  {
    name: "Casca",
    mark: (
      <svg {...iconProps}>
        <path d="M22 8a9 9 0 1 0 0 12" />
        <circle cx="14" cy="14" r="2" />
      </svg>
    ),
  },
];

const css = `
.hero-root { position: relative; isolation: isolate; overflow: hidden; }

.hero-bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, color-mix(in srgb, currentColor 9%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, currentColor 9%, transparent) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 100%);
}
.hero-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: .5;
  will-change: transform;
}
.hero-orb-a {
  width: min(540px, 80vw); height: min(540px, 80vw); top: -12%; left: -8%;
  background: radial-gradient(circle at 30% 30%, #6366f1, transparent 70%);
  animation: hero-float-a 18s ease-in-out infinite alternate;
}
.hero-orb-b {
  width: min(480px, 70vw); height: min(480px, 70vw); top: 0%; right: -10%;
  background: radial-gradient(circle at 60% 40%, #ec4899, transparent 70%);
  animation: hero-float-b 22s ease-in-out infinite alternate;
}
.hero-orb-c {
  width: min(420px, 60vw); height: min(420px, 60vw); bottom: -20%; left: 35%;
  background: radial-gradient(circle at 50% 50%, #22d3ee, transparent 70%);
  opacity: .35;
  animation: hero-float-a 26s ease-in-out infinite alternate-reverse;
}
@keyframes hero-float-a { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(60px,40px,0) scale(1.12); } }
@keyframes hero-float-b { from { transform: translate3d(0,0,0) scale(1.05); } to { transform: translate3d(-70px,50px,0) scale(.92); } }

.hero-fade-bottom {
  position: absolute; left: 0; right: 0; bottom: 0; height: 160px;
  background: linear-gradient(to bottom, transparent, var(--page-background, transparent));
}

.hero-gradient-text {
  background-image: linear-gradient(100deg, #818cf8 0%, #f472b6 35%, #22d3ee 65%, #818cf8 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: hero-shine 8s linear infinite;
  display: inline-block;
  padding-bottom: .08em;
}
@keyframes hero-shine { from { background-position: 0% 50%; } to { background-position: 250% 50%; } }

.hero-underline {
  position: relative; display: inline-block;
}
.hero-underline::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -.06em; height: .09em; border-radius: 99px;
  background: linear-gradient(90deg, #818cf8, #f472b6, #22d3ee);
  transform-origin: left center;
  animation: hero-draw 1.1s .5s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes hero-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.hero-rise { animation: hero-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.hero-rise-1 { animation-delay: .05s; }
.hero-rise-2 { animation-delay: .18s; }
.hero-rise-3 { animation-delay: .3s; }
.hero-rise-4 { animation-delay: .45s; }
@keyframes hero-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.hero-logos { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px 40px; }
.hero-logo { display: inline-flex; align-items: center; gap: 10px; opacity: .65; transition: opacity .2s ease; }
.hero-logo:hover { opacity: 1; }
.hero-logo span { font-weight: 700; font-size: 1.125rem; letter-spacing: -0.02em; }

.hero-avatars { display: flex; }
.hero-avatar {
  width: 32px; height: 32px; border-radius: 50%; margin-left: -10px;
  border: 2px solid var(--page-background, #000);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
}
.hero-avatar:first-child { margin-left: 0; }

@media (max-width: 640px) {
  .hero-grid { background-size: 40px 40px; }
  .hero-logos { gap: 16px 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-orb, .hero-gradient-text, .hero-underline::after, .hero-rise { animation: none !important; }
  .hero-rise { opacity: 1; transform: none; }
}
`;

const avatars: { initials: string; color: string }[] = [
  { initials: "AK", color: "#6366f1" },
  { initials: "MR", color: "#ec4899" },
  { initials: "JT", color: "#0ea5e9" },
  { initials: "SL", color: "#10b981" },
];

const rootStyle: CSSProperties = { minHeight: "100vh" };

export default function Page() {
  return (
    <Column as="main" fillWidth style={rootStyle}>
      <style>{css}</style>

      <section className="hero-root" aria-labelledby="hero-title" style={{ width: "100%" }}>
        {/* Decorative background effect */}
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="hero-orb hero-orb-c" />
          <div className="hero-grid" />
          <div className="hero-fade-bottom" />
        </div>

        <Column
          fillWidth
          horizontal="center"
          paddingX="l"
          paddingTop="xl"
          paddingBottom="xl"
          gap="xl"
          style={{ maxWidth: 1120, margin: "0 auto", paddingTop: "clamp(48px, 10vw, 112px)" }}
        >
          <Column horizontal="center" gap="24" style={{ textAlign: "center", maxWidth: 820 }}>
            <div className="hero-rise hero-rise-1">
              <Badge
                arrow={false}
                title="New: Pipelines 2.0 is now generally available"
                paddingY="4"
                paddingX="12"
              />
            </div>

            <div className="hero-rise hero-rise-2">
              <Heading
                as="h1"
                id="hero-title"
                variant="display-strong-xl"
                wrap="balance"
                style={{
                  fontSize: "clamp(2.5rem, 7.5vw, 5rem)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.035em",
                }}
              >
                Ship product updates{" "}
                <span className="hero-underline">
                  <span className="hero-gradient-text">10x faster</span>
                </span>{" "}
                without breaking things
              </Heading>
            </div>

            <div className="hero-rise hero-rise-3">
              <Text
                as="p"
                variant="body-default-xl"
                onBackground="neutral-weak"
                wrap="balance"
                style={{ maxWidth: 620, margin: "0 auto", fontSize: "clamp(1rem, 2.4vw, 1.25rem)" }}
              >
                Meridian turns your release process into a calm, automated pipeline. Preview every change,
                roll out to the right audience, and roll back in one click.
              </Text>
            </div>

            <div className="hero-rise hero-rise-4">
              <Column gap="16" horizontal="center">
                <Row gap="12" wrap horizontal="center" vertical="center">
                  <Button href="#start" variant="primary" size="l" arrowIcon>
                    Start free trial
                  </Button>
                  <Button href="#demo" variant="secondary" size="l" prefixIcon="play">
                    Watch 2-min demo
                  </Button>
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  No credit card required · 14-day trial · Cancel anytime
                </Text>
              </Column>
            </div>
          </Column>

          {/* Social proof */}
          <Column
            as="section"
            aria-labelledby="proof-title"
            horizontal="center"
            gap="24"
            fillWidth
            paddingTop="l"
          >
            <Flex gap="12" vertical="center" horizontal="center" wrap>
              <div className="hero-avatars" aria-hidden="true">
                {avatars.map((a) => (
                  <span key={a.initials} className="hero-avatar" style={{ background: a.color }}>
                    {a.initials}
                  </span>
                ))}
              </div>
              <Text id="proof-title" variant="label-default-s" onBackground="neutral-weak">
                Trusted by 4,200+ product teams, including
              </Text>
            </Flex>

            <ul className="hero-logos" aria-label="Customer companies">
              {logos.map((logo) => (
                <li key={logo.name} className="hero-logo">
                  {logo.mark}
                  <span>{logo.name}</span>
                </li>
              ))}
            </ul>
          </Column>
        </Column>
      </section>
    </Column>
  );
}
```