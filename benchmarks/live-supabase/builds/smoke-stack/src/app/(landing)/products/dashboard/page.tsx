import { Column, Heading, Logo, Row, Text } from "@once-ui-system/core";
import { Schema, Meta } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";
import { Bento, Testimonial, Hero } from "../components";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.dashboard.title,
    description: landing.dashboard.description,
    baseURL: baseURL,
    path: landing.dashboard.path,
    canonical: landing.dashboard.canonical,
    image: landing.dashboard.image,
    robots: landing.dashboard.robots,
    alternates: landing.dashboard.alternates,
  });
}

export default function Dashboard() {
  return (
    <Column fillWidth horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.dashboard.title}
        description={landing.dashboard.description}
        path={landing.dashboard.path}
      />
      <Hero marginBottom="80" />
      <Logo dark icon="/trademarks/icon-dark.svg" />
      <Logo light icon="/trademarks/icon-light.svg" />
      <Bento maxWidth="l" paddingX="l" paddingY="xl"/>
      <Column maxWidth="l" paddingX="l" gap="20" paddingY="xl" horizontal="center" align="center">
        <Heading as="h2" variant="display-strong-l">
          Businesses are shipping faster with Once UI
        </Heading>
        <Text onBackground="neutral-weak" variant="heading-default-xl">
          Why don't you?
        </Text>
      </Column>
      <Row 
        maxWidth="l"
        paddingX="l"
        marginTop="xl">
        <Testimonial
          title="Stack helped us ship in a weekend"
          content="We have tried several tools and frameworks, but none of them were as easy to use as Once UI's Stack."
          src="/images/convert.jpg"
          name="Lorant One"
          company="Once UI"
          link="https://once-ui.com"
          avatar="/images/lorant.jpg"
          role="Design Engineer"
        />
      </Row>
    </Column> 
  );
}