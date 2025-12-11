import { notFound } from "next/navigation";
import { getPages, getAdjacentPages } from "@/app/utils/utils";
import { formatDate } from "@/app/utils/formatDate";
import { Column, Heading, Icon, Row, Media, Text, Card, HeadingNav, Meta, Schema, Button, SmartLink, Line } from "@once-ui-system/core";
import { baseURL, layout, schema } from "@/resources";
import { CustomMDX } from "@/product/mdx";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug ? slug.join('/') : '';

  const docs = await getPages();
  const doc = docs.find((doc) => doc.slug === slugPath);

  if (!doc) return {};

  return Meta.generate({
    title: doc.metadata.title + " – " + schema.name,
    description: doc.metadata.summary,
    baseURL,
    path: `/${doc.slug}`,
    type: "article",
    publishedTime: doc.metadata.updatedAt,
    image: doc.metadata.image || `/api/og/generate?title=${encodeURIComponent(doc.metadata.title)}&description=${encodeURIComponent(doc.metadata.summary)}`,
  });
}

export default async function Docs({
  params,
}: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  let doc = getPages().find((doc) => doc.slug === slugPath);

  if (!doc) {
    notFound();
  }
  
  const { prevPage, nextPage } = getAdjacentPages(slugPath, 'section');
  
  // Determine section title - use "Docs" for top-level elements
  const sectionTitle = slug.length === 1 && !slug[0].includes('/') 
    ? "Docs"
    : slug[0]
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  
  return (
    <>
      <Row fillWidth horizontal="center" padding="l">
        <Column as="main" maxWidth={layout.content.width} gap="l" paddingBottom="xl" paddingTop="12">
          <Schema
            as="techArticle"
            title={doc.metadata.title + " – " + schema.name}
            description={doc.metadata.summary}
            baseURL={baseURL}
            path={`/${doc.slug}`}
            datePublished={doc.metadata.updatedAt}
            dateModified={doc.metadata.updatedAt}
            image={doc.metadata.image}
            author={{
              name: schema.name
            }}
          />
          <Column fillWidth gap="8" vertical="center">
            <Text variant="label-default-l" onBackground="neutral-medium">{sectionTitle}</Text>
            <Heading variant="display-strong-s">{doc.metadata.title}</Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Updated: {formatDate(doc.metadata.updatedAt)}
            </Text>
            {doc.metadata.github && (
              <Button className="mt-20" href={"https://github.com/once-ui-system/core/blob/main/packages/core/src/" + doc.metadata.github} size="s" variant="secondary" prefixIcon="github" weight="default" data-border="rounded">
                View on GitHub
              </Button>
            )}
          </Column>
          {doc.metadata.image && (
            <Media border="neutral-alpha-medium" enlarge src={doc.metadata.image} alt={"Thumbnail of " + doc.metadata.title} aspectRatio="16 / 9" radius="m" sizes="(max-width: 768px) 100vw, 768px" priority />
          )}
          <Column as="article" fillWidth>
            <CustomMDX source={doc.content} />
          </Column>
          
          <Row gap="16" fillWidth horizontal="between" s={{direction: "column"}}>              
            {prevPage ? (
              <Row fillWidth>
              <Row maxWidth={20}>
              <Card
                fillWidth
                border="neutral-alpha-medium"
                vertical="center" gap="4"
                href={`/${prevPage.slug}`} 
                radius="l" 
                paddingX="16"
              >
                <Icon name="chevronLeft" size="s" onBackground="neutral-weak" />
                <Column gap="4" vertical="center" paddingX="16" paddingY="12">
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {prevPage.slug.includes('/') ? 
                      `${prevPage.slug.split('/')[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : 
                      'page'}
                  </Text>
                  <Text onBackground="neutral-strong" variant="heading-strong-m" wrap="balance">
                    {prevPage.metadata.title}
                  </Text>
                </Column>
              </Card>
              </Row>
              </Row>
            ) : <Row/>}
            {nextPage ? (
              <Row fillWidth horizontal="end">
                <Row maxWidth={20}>
                  <Card
                    fillWidth
                    border="neutral-alpha-medium"
                    horizontal="end" vertical="center" gap="4"
                    href={`/${nextPage.slug}`} 
                    radius="l" 
                    paddingX="16"
                  >
                    <Column horizontal="end" gap="4" vertical="center" paddingX="16" paddingY="12">
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {nextPage.slug.includes('/') ? 
                          `${nextPage.slug.split('/')[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : 
                          'page'}
                      </Text>
                      <Text onBackground="neutral-strong" variant="heading-strong-m" wrap="balance">
                        {nextPage.metadata.title}
                      </Text>
                    </Column>
                    <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                  </Card>
                </Row>
              </Row>
            ) : <Row/>}
          </Row>
          {doc.metadata.docs && (
            <>
              <Line width="40"/>
              <Row fillWidth vertical="center" gap="8" onBackground="neutral-weak" textVariant="label-default-s">
                Edit this page on <SmartLink prefixIcon="github" href={"https://github.com/once-ui-system/core/tree/main/apps/docs/src/content/" + doc.metadata.docs}>GitHub</SmartLink>
              </Row>
            </>
          )}
        </Column>
      </Row>
      <Row borderLeft="neutral-alpha-medium" fillHeight maxWidth={layout.sideNav.width} s={{hide: true}} padding="20">
        <HeadingNav top="80" />
      </Row>
    </>
  );
}