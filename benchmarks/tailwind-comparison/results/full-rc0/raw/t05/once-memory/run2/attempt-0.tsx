"use client";

import { Badge, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

const logos: { name: string; mark: React.ReactNode }[] = [
  {
    name: "Northwind Labs",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path d="M3 19 12 4l9 15h-5l-4-7-4 7z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Helix Robotics",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M12 2 21 7v10l-9 5-9-5V7z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Parallel Health",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect x="4" y="3" width="5" height="18" rx="2.5" fill="currentColor" />
        <rect x="15" y="3" width="5" height="18" rx="2.5" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Orbit Freight",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="18" cy="7" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Quillworks",
    mark: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path d="M5 20C5 9 12 4 20 4c0 9-5 16-15 16z" fill="currentColor" />
      </svg>
    ),
  },
];

const stats = [
  { value: "4.9/5", label: "average rating on G2" },
  { value: "12,000+", label: "teams shipping with Lumen" },
  { value: "99.99%", label: "uptime over the last year" },
];

const css = `
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

.hero-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--neutral-alpha-weak) 1px, transparent 1px),
    linear-gradient(to bottom, var(--neutral-alpha-weak) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 100%);
}

.hero-bg__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  will-change: transform;
}

.hero-bg__orb--a {
  width: min(52vw, 560px);
  height: min(52vw, 560px);
  top: -14%;
  left: 8%;
  background: radial-gradient(circle at 30% 30%, var(--brand-solid-medium), transparent 70%);
  animation: hero-float-a 18s ease-in-out infinite alternate;
}

.hero-bg__orb--b {
  width: min(48vw, 520px);
  height: min(48vw, 520px);
  top: 0;
  right: 4%;
  background: radial-gradient(circle at 60% 40%, var(--accent-solid-medium), transparent 70%);
  animation: hero-float-b 22s ease-in-out infinite alternate;
}

.hero-bg__fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 30%;
  background: linear-gradient(to bottom, transparent, var(--page-background));
}

@keyframes hero-float-a {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(6%, 10%, 0) scale(1.12); }
}

@keyframes hero-float-b {
  from { transform: translate3d(0, 0, 0) scale(1.05); }
  to { transform: translate3d(-8%, 8%, 0) scale(0.95); }
}

.hero-gradient-text {
  display: inline-block;
  background-image: linear-gradient(
    100deg,
    var(--brand-on-background-strong) 0%,
    var(--accent-on-background-strong) 35%,
    var(--brand-on-background-medium) 65%,
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
  to { background-position: 100% 50%; }
}

.hero-underline {
  position: relative;
  white-space: nowrap;
}

.hero-underline::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.04em;
  height: 0.09em;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand-solid-strong), var(--accent-solid-strong));
  transform-origin: left center;
  animation: hero-draw 1.1s 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes hero-draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.hero-rise {
  animation: hero-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-rise--1 { animation-delay: 0.05s; }
.hero-rise--2 { animation-delay: 0.15s; }
.hero-rise--3 { animation-delay: 0.28s; }
.hero-rise--4 { animation-delay: 0.4s; }
.hero-rise--5 { animation-delay: 0.52s; }

@keyframes hero-rise {
  from { opacity: 0; transform: translate3d(0, 16px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

.hero-logos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px 40px;
}

.hero-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--neutral-on-background-weak);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  opacity: 0.85;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.hero-logo:hover {
  opacity: 1;
  color: var(--neutral-on-background-strong);
}

.hero-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 720px;
}

@media (max-width: 640px) {
  .hero-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .hero-bg__grid {
    background-size: 40px 40px;
  }
  .hero-logos {
    gap: 16px 28px;
  }
}

.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

@media (max-width: 480px) {
  .hero-cta-row > * {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-bg__orb,
  .hero-gradient-text,
  .hero-underline::after,
  .hero-rise {
    animation: none !important;
  }
  .hero-rise {
    opacity: 1;
    transform: none;
  }
}
`;

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="hero-root" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-bg__grid" />
          <div className="hero-bg__orb hero-bg__orb--a" />
          <div className="hero-bg__orb hero-bg__orb--b" />
          <div className="hero-bg__fade" />
        </div>

        <Column
          fillWidth
          horizontal="center"
          paddingX="l"
          paddingTop="104"
          paddingBottom="80"
          gap="48"
          style={{ maxWidth: 1120, margin: "0 auto" }}
        >
          <Column horizontal="center" gap="24" style={{ textAlign: "center", maxWidth: 860 }}>
            <div className="hero-rise hero-rise--1">
              <Badge
                href="#changelog"
                arrow
                title="Lumen 3.0 is here: realtime review rooms and AI-assisted handoff"
              />
            </div>

            <div className="hero-rise hero-rise--2">
              <Heading
                as="h1"
                id="hero-title"
                variant="display-strong-xl"
                wrap="balance"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.05 }}
              >
                Ship product design{" "}
                <span className="hero-gradient-text hero-underline">ten times faster</span>
              </Heading>
            </div>

            <div className="hero-rise hero-rise--3">
              <Text
                as="p"
                variant="body-default-xl"
                onBackground="neutral-weak"
                wrap="balance"
                style={{ maxWidth: 640, margin: "0 auto" }}
              >
                Lumen brings your design system, feedback and developer handoff into one shared
                workspace, so your team spends less time in review threads and more time shipping
                work customers love.
              </Text>
            </div>

            <div className="hero-rise hero-rise--4" style={{ width: "100%" }}>
              <div className="hero-cta-row">
                <Button
                  href="#signup"
                  variant="primary"
                  size="l"
                  arrowIcon
                  data-border="rounded"
                >
                  Start free for 14 days
                </Button>
                <Button
                  href="#demo"
                  variant="secondary"
                  size="l"
                  prefixIcon="play"
                  data-border="rounded"
                >
                  Watch the 2-min demo
                </Button>
              </div>
              <Text
                as="p"
                variant="body-default-s"
                onBackground="neutral-weak"
                style={{ marginTop: 16 }}
              >
                No credit card required. Cancel anytime.
              </Text>
            </div>
          </Column>

          <Column
            horizontal="center"
            gap="24"
            fillWidth
            className="hero-rise hero-rise--5"
            as="section"
            aria-labelledby="trusted-by"
          >
            <Text
              as="h2"
              id="trusted-by"
              variant="label-default-s"
              onBackground="neutral-weak"
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                margin: 0,
                textAlign: "center",
              }}
            >
              Trusted by product teams at
            </Text>

            <ul className="hero-logos" aria-label="Customer companies">
              {logos.map((logo) => (
                <li key={logo.name} className="hero-logo">
                  {logo.mark}
                  <span>{logo.name}</span>
                </li>
              ))}
            </ul>

            <Row fillWidth horizontal="center" paddingTop="24">
              <ul className="hero-stats" aria-label="Lumen in numbers">
                {stats.map((stat) => (
                  <li key={stat.label} style={{ textAlign: "center" }}>
                    <Column horizontal="center" gap="4">
                      <Heading as="p" variant="heading-strong-xl">
                        {stat.value}
                      </Heading>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {stat.label}
                      </Text>
                    </Column>
                  </li>
                ))}
              </ul>
            </Row>
          </Column>
        </Column>
      </section>
    </Column>
  );
}
