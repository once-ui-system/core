import { SmartLink, Text } from "@once-ui-system/core";

// FAQ on the landing page: a title and an answer per entry.
const faq = [
  {
    title: "What is Acme Notes?",
    content: <Text onBackground="neutral-medium">A notes app for teams: shared notebooks, instant search, and roles that decide who can see and change what.</Text>,
  },
  {
    title: "Can I try it for free?",
    content: <Text onBackground="neutral-medium">Yes. The Free plan covers up to 3 members. Upgrade to Team when you need more.</Text>,
  },
  {
    title: "How much does it cost?",
    content: <Text onBackground="neutral-medium">Free is $0 for up to 3 members. Team is $8 per member per month. <SmartLink href="/#pricing">See the plans</SmartLink>.</Text>,
  },
];

export { faq };
