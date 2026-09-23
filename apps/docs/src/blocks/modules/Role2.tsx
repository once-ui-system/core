import {
  BlobFx,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  Text,
  Textarea,
} from "@once-ui-system/core";

const roleDetails = {
  title: "Senior Product Designer",
  type: "Full-time",
  location: "San Francisco, CA",
  department: "Design",
  salary: "$120,000 - $180,000",
  description:
    "We're looking for a Senior Product Designer to join our team and help shape the future of our design system. You'll work closely with our engineering and product teams to create beautiful, intuitive, and accessible user interfaces.",
  responsibilities: [
    "Lead the design of new features and improvements to our design system",
    "Collaborate with engineers to ensure high-quality implementation",
    "Mentor junior designers and provide feedback on their work",
    "Create and maintain design documentation",
    "Conduct user research and usability testing",
  ],
  requirements: [
    "5+ years of experience in product design",
    "Strong portfolio demonstrating UI/UX skills",
    "Experience with design systems and component libraries",
    "Excellent communication and collaboration skills",
    "Familiarity with modern design tools",
  ],
};

export const Role2 = () => {
  return (
    <Column fillWidth fitHeight horizontal="center" gap="64">
      <Row maxWidth="l" padding="l" m={{ direction: "column" }} gap="xl">
        <Column fillWidth gap="32">
          <Column gap="16" fillWidth>
            <Button size="s" variant="secondary" weight="default" prefixIcon="chevronLeft" href="#">
              View all positions
            </Button>
            <Column gap="16" fillWidth>
              <Heading variant="display-strong-s" marginTop="8">
                {roleDetails.title}
              </Heading>
              <Grid columns="2" fillWidth gap="12">
                <Row gap="8" vertical="center">
                  <Icon name="europe" size="s" onBackground="neutral-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {roleDetails.location}
                  </Text>
                </Row>
                <Row gap="8" vertical="center">
                  <Icon name="time" size="s" onBackground="neutral-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {roleDetails.type}
                  </Text>
                </Row>
                <Row gap="8" vertical="center">
                  <Icon name="tag" size="s" onBackground="neutral-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {roleDetails.department}
                  </Text>
                </Row>
                <Row gap="8" vertical="center">
                  <Icon name="banknotes" size="s" onBackground="neutral-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {roleDetails.salary}
                  </Text>
                </Row>
              </Grid>
            </Column>
          </Column>

          <Text variant="body-default-l" onBackground="neutral-medium">
            {roleDetails.description}
          </Text>

          <Column gap="16" fillWidth>
            <Heading variant="heading-strong-l">Responsibilities</Heading>
            <Column gap="8">
              {roleDetails.responsibilities.map((item, index) => (
                <Row key={index} gap="12" vertical="center">
                  <Icon name="check" size="s" onBackground="brand-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {item}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>

          <Column gap="16" fillWidth>
            <Heading variant="heading-strong-l">Requirements</Heading>
            <Column gap="8">
              {roleDetails.requirements.map((item, index) => (
                <Row key={index} gap="12" vertical="center">
                  <Icon name="check" size="s" onBackground="brand-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {item}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>
        </Column>

        <Column
          fillWidth
          position="sticky"
          top="80"
          fitHeight
          background="overlay"
          radius="l"
          padding="l"
          border
          overflow="hidden"
        >
          <BlobFx position="absolute" top="0" left="0" translateY="50%" />
          <Column fillWidth gap="32">
            <Column gap="8" fillWidth>
              <Heading variant="heading-strong-l">Apply for this position</Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                Fill out the form below and we'll get back to you as soon as possible.
              </Text>
            </Column>

            <Column gap="12" fillWidth>
              <Input id="name" placeholder="Full name" type="text" />
              <Input id="email" placeholder="Email" type="email" />
              <Input id="portfolio" placeholder="Portfolio URL" type="url" />
              <Textarea style={{ minHeight: "6rem" }} id="message" placeholder="Cover letter" />
            </Column>

            <Button fillWidth id="submit-2" arrowIcon>
              Submit application
            </Button>
          </Column>
        </Column>
      </Row>
    </Column>
  );
};
