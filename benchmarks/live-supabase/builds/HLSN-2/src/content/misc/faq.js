import { SmartLink, Text } from "@once-ui-system/core";

// FAQ on the landing and pricing pages: a title and an answer per entry.
const faq = [
  {
    title: "What does the product do?",
    content: <Text onBackground="neutral-medium">Describe what your product does in one or two sentences.</Text>,
  },
  {
    title: "Who is it for?",
    content: <Text onBackground="neutral-medium">Describe the teams or people who get the most out of it.</Text>,
  },
  {
    title: "Can I try it for free?",
    content: <Text onBackground="neutral-medium">Yes. Start on the free plan and upgrade when you need more.</Text>,
  },
  {
    title: "How much does it cost?",
    content: <Text onBackground="neutral-medium">See the <SmartLink href="/pricing">pricing page</SmartLink> for current plans.</Text>,
  },
];

export { faq };
