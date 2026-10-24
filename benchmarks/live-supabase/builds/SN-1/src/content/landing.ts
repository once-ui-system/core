import type { IconName } from "@/resources/icons";

// All landing-page copy. The sections in src/app/(landing)/components read
// from here; the product name itself comes from schema.name in
// src/resources/once-ui.config.js.

const banner = {
  label: "New:",
  text: "Read how Acme Notes started.",
  href: "/blog/introducing-acme-notes",
};

const hero = {
  badge: { label: "New", text: "Introducing Acme Notes", href: "/blog/introducing-acme-notes" },
  title: "Acme Notes",
  titleMuted: "Notes your whole team can find.",
  description:
    "Write things down once, in shared notebooks, and find them again in an instant. Everyone sees what they should, nothing more.",
  primary: { label: "Get started", href: "/auth" },
  secondary: { label: "Read the blog", href: "/blog" },
};

const features = {
  label: "Features",
  title: "Everything your team needs to keep notes",
  description: "Write together, search everything and decide who sees what.",
  items: [
    { icon: "folder", title: "Shared notebooks", description: "Keep a team's notes together in notebooks everyone can open and add to." },
    { icon: "search", title: "Instant search", description: "Find any note as you type, across every notebook you can read." },
    { icon: "quality", title: "Roles and permissions", description: "Owners, admins and members: decide who can read, edit and manage." },
  ] as { icon: IconName; title: string; description: string }[],
};

const steps = {
  label: "How it works",
  title: "Up and running in minutes",
  items: [
    { icon: "rocket", title: "Create an account", description: "Sign up with your email. No credit card needed." },
    { icon: "people", title: "Invite your team", description: "Share an invitation link and set each person's role." },
    { icon: "trend", title: "Start writing", description: "Open a notebook and write the first note." },
  ] as { icon: IconName; title: string; description: string }[],
};

const sections = {
  pricing: {
    label: "Pricing",
    title: "Simple pricing",
    description: "Start for free. Upgrade when your team grows.",
  },
  faq: { label: "FAQ", title: "Frequently asked questions", contact: "Something else? Write to" },
};

const cta = {
  title: "Ready to get started?",
  description: "Give your team one place to write things down.",
  primary: { label: "Get started", href: "/auth" },
  secondary: { label: "Read the blog", href: "/blog" },
};

const blogIntro = {
  title: "Blog",
  description: "News and product updates.",
};

export const landingCopy = { banner, hero, features, steps, sections, cta, blogIntro };
