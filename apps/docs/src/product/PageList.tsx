import { getPages, sortPages } from "@/app/utils/utils";
import { Card, Column, Icon, Row, Media, Text } from "@once-ui-system/core";
import React from "react";

interface props extends Omit<React.ComponentProps<typeof Card>, 'onClick'> {
  range?: [number] | [number, number];
  thumbnail?: boolean;
  path?: string[];
  description?: boolean;
  sortType?: 'order' | 'alphabetical' | 'date' | 'section';
  depth?: number;
}

function formatSlug(slug: string): React.JSX.Element {
  // Split the slug by '/'
  const parts = slug.split('/');
  
  // Remove the last part as it's not needed (it's the title)
  const pathParts = parts.slice(0, -1);
  
  // If there are no path parts, return an empty fragment
  if (pathParts.length === 0) {
    return <></>;
  }
  
  // Format each part to capitalize first letter of each word
  const formattedParts = pathParts.map(part => 
    part.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
  
  return (
    <Row vertical="center" gap="4">
      {formattedParts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Icon name="chevronRight" size="xs" />}
          <Text>{part}</Text>
        </React.Fragment>
      ))}
    </Row>
  );
}

export function PageList({
  range,
  thumbnail = false,
  path = [],
  sortType = 'order', // Changed default from 'date' to 'order' to respect meta.json ordering
  depth,
  description = true,
  ...rest
}: props) {
  // Create a base path array starting with src/content
  const basePath = ["src", "content"];
  
  // Combine the base path with any additional path segments
  const fullPath = [...basePath, ...path];
  
  // Get pages from the specified path
  let pages = getPages(fullPath);

  // Filter pages by depth if specified
  if (depth !== undefined) {
    pages = pages.filter(page => {
      // Count the number of slashes in the slug to determine depth
      // Exclude the path prefix from the count
      const pathPrefix = path.join('/');
      const relativePath = pathPrefix ? 
        page.slug.replace(pathPrefix + '/', '') : 
        page.slug;
      
      const slashCount = (relativePath.match(/\//g) || []).length;
      return slashCount < depth;
    });
  }

  // Sort pages using the centralized sorting function
  const sortedPages = sortPages(pages, sortType);

  const displayedPages = range 
    ? (range.length === 1 
        ? sortedPages.slice(range[0] - 1)
        : sortedPages.slice(range[0] - 1, range[1]))
    : sortedPages;

  return (
    <>
      {displayedPages.length > 0 && displayedPages.map((page) => (
        <Card href={`/${page.slug}`} key={page.slug} radius="l" padding="2" gap="16" s={{direction: "column"}} fillWidth {...rest}>
          {page.metadata.image && thumbnail && (
            <Media
              priority
              sizes="480px"
              border="neutral-alpha-weak"
              cursor="interactive"
              radius="m"
              src={page.metadata.image}
              alt={"Thumbnail of " + page.metadata.title}
              aspectRatio="2 / 1"
            />
          )}
          <Column fillWidth gap="4" vertical="center" paddingX="16" paddingY="12">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {formatSlug(page.slug)}
            </Text>
            <Text variant="heading-strong-l" wrap="balance" onBackground="neutral-strong">
              {page.metadata.title}
            </Text>
            {description && page.metadata.summary && (
              <Text variant="body-default-s" onBackground="neutral-medium" marginTop="12" wrap="balance">
                {page.metadata.summary}
              </Text>
            )}
          </Column>
        </Card>
      ))}
    </>
  );
}