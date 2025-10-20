

import { AvatarGroup, Card, Column, Grid, Media, Row, Text } from "@once-ui-system/core";

export function Products() {
    return (
      <Grid fillWidth columns="2" s={{columns: 1}} gap="12" marginTop="16">
        {[
          {
            title: "Once UI Core",
            description: "Open-source design system for Next.js",
            image: "/images/docs/once-ui.jpg",
            href: "/once-ui/quick-start"
          },
          {
            title: "Magic Portfolio",
            description: "Beautiful, responsive portfolio template",
            image: "/images/docs/magic-portfolio.jpg",
            href: "/magic-portfolio/quick-start"
          },
          {
            title: "Magic Docs",
            description: "Beautiful, MDX documentation template",
            image: "/images/docs/magic-docs.jpg",
            href: "/magic-docs/quick-start"
          },
          {
            title: "Magic Store",
            description: "Ready-made storefront for selling merch",
            image: "/images/docs/magic-store.jpg",
            href: "/magic-store/quick-start"
          },
          {
            title: "Supabase Starter",
            description: "App boilerplate with database and authentication",
            image: "/images/docs/supabase-starter.jpg",
            href: "/supabase-starter/quick-start"
          },
          {
            title: "Magic Convert",
            description: "Conversion-optimized landing page and dashboard",
            image: "/images/docs/magic-convert.jpg",
            href: "/magic-convert/quick-start"
          },
          {
            title: "Magic Agent",
            description: "Chatbot with the Vercel AI SDK",
            image: "/images/docs/magic-agent.jpg",
            href: "/magic-agent/quick-start"
          },
          {
            title: "Magic Bio",
            description: "Simple, modern link-in-bio page",
            image: "/images/docs/magic-bio.jpg",
            href: "/magic-bio/quick-start"
          }
        ].map((template, index) => (
          <Card
            key={index}
            href={template.href}
            fillWidth
            radius="l"
            border="neutral-alpha-weak"
            direction="column"
            paddingX="4"
          >
            <Row paddingX="16" paddingY="12" gap="12" vertical="center">
              <AvatarGroup dark reverse avatars={[{src: "/images/avatar.jpg"}, {src: "/trademarks/icon-dark.svg"}]} size="s" />
              <AvatarGroup light reverse avatars={[{src: "/images/avatar.jpg"}, {src: "/trademarks/icon-light.svg"}]} size="s" />
              <Text variant="label-default-s">Once UI</Text>
            </Row>
            <Media
              border="neutral-alpha-weak"
              src={template.image} 
              aspectRatio="16/9" 
              radius="l" 
              sizes="400px" 
            />
            <Column fillWidth paddingX="16" paddingY="20" gap="4" horizontal="start">
              <Text 
                variant="heading-default-xs" 
                onBackground="neutral-strong"
              >
                {template.title}
              </Text>
              <Text 
                variant="body-default-s" 
                onBackground="neutral-weak"
                wrap="balance"
              >
                {template.description}
              </Text>
            </Column>
          </Card>
        ))}
      </Grid>
    )
}