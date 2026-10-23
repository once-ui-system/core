import { Column, Heading, Logo, Row, Text } from "@once-ui-system/core";
import { Schema, Meta } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";
import { Bento, Testimonial, Hero } from "../components";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.landing.title,
    description: landing.landing.description,
    baseURL: baseURL,
    path: landing.landing.path,
    canonical: landing.landing.canonical,
    image: landing.landing.image,
    robots: landing.landing.robots,
    alternates: landing.landing.alternates,
  });
}

export default function Landing() {
  return (
    <Column fillWidth horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.landing.title}
        description={landing.landing.description}
        path={landing.landing.path}
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