import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import { CustomMDX } from "@/components";
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { baseURL, landing } from "@/resources";

async function getTermsOfUseContent() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'legal', 'terms-of-use.mdx');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    metadata: data,
    content: content
  };
}

export async function generateMetadata() {
  return Meta.generate({
    title: landing.terms.title,
    description: landing.terms.description,
    baseURL: baseURL,
    path: landing.terms.path,
    canonical: landing.terms.canonical,
    image: landing.terms.image,
    robots: landing.terms.robots,
    alternates: landing.terms.alternates,
  });
}

export default async function TermsOfUse() {
  const { metadata, content } = await getTermsOfUseContent();
  
  return (
    <Column maxWidth="s" gap="l" paddingX="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={metadata.title || landing.terms.title}
        description={metadata.description || landing.terms.description}
        path={landing.terms.path}
      />
      <Column fillWidth gap="4">
        <Heading variant="display-strong-xs">
          {metadata.title}
        </Heading>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Last updated: {metadata.updated}
        </Text>
      </Column>
      <Column fillWidth onBackground="neutral-medium">
        <CustomMDX source={content} />
      </Column>
    </Column>
  );
}