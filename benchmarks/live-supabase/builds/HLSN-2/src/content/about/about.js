const about = {
  tag: "About us",
  title: "Describe your mission in one line",
  teamTitle: "Meet the team",
  cta: { title: "Questions? We'd love to hear from you.", label: "Get in touch", href: "/contact" },
};

/** @type {{ icon: import("@once-ui-system/core").IconName; title: string; description: string }[]} */
const benefits = [
  { icon: "lightbulb", title: "Simple.", description: "Describe the first value your team holds." },
  { icon: "people", title: "Together.", description: "Describe how you work with customers." },
  { icon: "globe", title: "Open.", description: "Describe what you promise every user." },
];

/** Role-only placeholders: add `avatar` (an image path) to show a photo. */
/** @type {{ name: string; role: string; avatar?: string }[]} */
const team = [
  { name: "Team member", role: "Founder" },
  { name: "Team member", role: "Engineering" },
  { name: "Team member", role: "Design" },
];

const intro = [
  "Tell the story of why you started building this product.",
  "Describe the problem your customers had and how your product solves it.",
  "Say who is behind the product and what they care about.",
];

export { about, team, benefits, intro };
