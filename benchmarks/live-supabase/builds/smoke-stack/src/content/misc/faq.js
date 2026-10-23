import { List, ListItem, SmartLink, Text, Row } from "@once-ui-system/core";

const faq = [
  {
    title: "What is Stack?",
    content: <Text onBackground="neutral-medium">Stack is a landing page and dashboard template built with Next.js and Once UI, by the creators of Once UI.</Text>,
  },
  {
    title: "What does it contain?",
    content: <Text onBackground="neutral-medium">Stack provides SEO-optimized, responsive frontends with easy customization. It contains:<br/><Row marginTop="12" marginBottom="8"><strong>Landing page</strong></Row><List><ListItem>products</ListItem><ListItem>pricing</ListItem><ListItem>about</ListItem><ListItem>blog</ListItem><ListItem>contact</ListItem><ListItem>legal pages</ListItem></List><Row marginTop="16" marginBottom="8"><strong>Dashboard</strong></Row><List><ListItem>authentication</ListItem><ListItem>analytics</ListItem><ListItem>settings</ListItem><ListItem>users</ListItem></List></Text>,
  },
  {
    title: "How is it different than other templates?",
    content: <Text onBackground="neutral-medium">Stack is part of a complete ecosystem built for indie creators. It shares the same customization, structure, and component set as all other Once UI templates. You can seamlessly copy-paste sections and pages from any Once UI project.</Text>,
  },
  {
    title: "How much does it cost?",
    content: <Text onBackground="neutral-medium">Stack is part of the Once UI Pro plan, which includes several templates and copy-paste blocks. For further information, visit our <SmartLink href="https://once-ui.com/pricing">pricing page</SmartLink>.</Text>,
  },
];

export { faq };