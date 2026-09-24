import {
  Avatar,
  Card,
  Column,
  Grid,
  Heading,
  HeadingLink,
  List,
  ListItem,
  Media,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

export const Post1 = () => {
  const post = {
    title: "Discovery of a Supermassive Black Hole in the Heart of the Milky Way",
    publishedAt: "2025-02-08",
    tag: "Featured",
    image: "/images/docs/solar-03.jpg",
    author: {
      name: "Lorant One",
      avatar: "/images/creators/lorant.jpg",
    },
  };

  const related = [
    {
      title: "Discovery of a Supermassive Black Hole in the Heart of the Milky Way",
      publishedAt: "2025-02-08",
      tag: "Featured",
      image: "/images/docs/solar-01.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "SpaceX's New Mars Colony Project: What You Need to Know",
      publishedAt: "2025-02-01",
      tag: "Space Travel",
      image: "/images/docs/solar-02.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "Quantum Tunneling: The Key to Interstellar Travel?",
      publishedAt: "2025-01-28",
      tag: "Physics",
      image: "/images/docs/solar-03.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "NASA's Latest Discovery: Water Ice Found on Europa",
      publishedAt: "2025-01-15",
      tag: "Discovery",
      image: "/images/docs/solar-01.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
  ];

  return (
    <Column fillWidth horizontal="center" gap="64">
      <Row gap="8" horizontal="center" align="center" marginTop="24" textVariant="label-strong-s">
        <SmartLink href="#">Blog</SmartLink>{" "}
        <Text weight="default" onBackground="neutral-weak">
          /
        </Text>{" "}
        <SmartLink href="#">{post.tag}</SmartLink>
      </Row>
      <Column maxWidth="s" gap="24" horizontal="center" align="center">
        <Heading as="h2" variant="display-strong-s" wrap="balance">
          {post.title}
        </Heading>
        <Row gap="12" vertical="center">
          <Avatar src={post.author.avatar} size="s" />
          <Text variant="label-default-s" onBackground="neutral-weak">
            {post.author.name}
          </Text>
        </Row>
      </Column>
      {post.image && (
        <Row maxWidth="m" minHeight="l">
          <Media
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            border
            radius="xl"
            src={post.image}
            alt={`Cover of ${post.title}`}
          />
        </Row>
      )}

      <Column maxWidth="xs" gap="40" onBackground="neutral-medium" textVariant="body-default-m">
        <Text>
          Astronomers have confirmed the presence of a supermassive black hole at the core of our
          Milky Way galaxy. This groundbreaking discovery has provided insights into the nature of
          black holes and their role in shaping galaxies. The object, known as Sagittarius A*, has
          been studied for decades, but new observations have allowed scientists to gain
          unprecedented clarity on its structure and behavior.
        </Text>

        <HeadingLink id="what-is-sagittarius-a" as="h2">
          What is Sagittarius A*?
        </HeadingLink>
        <Text>
          Sagittarius A* (Sgr A*) is a supermassive black hole located about 26,500 light-years from
          Earth. It has a mass approximately 4 million times that of our Sun and is surrounded by a
          dense cluster of stars and interstellar matter.
        </Text>

        <Media
          priority
          sizes="640px"
          border
          cursor="interactive"
          radius="l"
          src="/images/docs/solar-02.jpg"
          alt="Sagittarius A illustration"
          aspectRatio="16 / 9"
        />

        <HeadingLink id="key-findings" as="h2">
          Key Findings
        </HeadingLink>
        <List gap="12">
          <ListItem>
            Sagittarius A* is actively consuming matter, producing bursts of high-energy radiation.
          </ListItem>
          <ListItem>
            The Event Horizon Telescope provided the first direct image of its shadow, confirming
            predictions made by Einstein’s general theory of relativity.
          </ListItem>
          <ListItem>
            Observations of nearby stars orbiting Sgr A* have helped measure its mass with
            remarkable accuracy.
          </ListItem>
        </List>

        <HeadingLink id="implications-for-astronomy" as="h2">
          Implications for Astronomy
        </HeadingLink>
        <Text>
          The discovery of Sagittarius A* has profound implications for our understanding of black
          holes and galaxy formation. Scientists believe that supermassive black holes exist in most
          galaxies, playing a key role in their evolution. By studying Sgr A*, researchers hope to
          unlock new mysteries about the fundamental forces governing our universe.
        </Text>

        <Text>
          This discovery is a testament to the power of modern astronomical techniques and
          international collaboration. As telescopes become more advanced, we can expect even more
          detailed insights into the enigmatic forces at the heart of our galaxy.
        </Text>
      </Column>

      <Column maxWidth="s" gap="24" marginTop="64">
        <Heading marginLeft="32" as="h2" variant="heading-strong-xl">
          Related posts
        </Heading>
        <Grid fillWidth columns={2} s={{ columns: 1 }} gap="8">
          {related.map((post, index) => (
            <Card
              key={index}
              href="#"
              radius="l"
              background="transparent"
              border="transparent"
              fillWidth
            >
              <Column fillWidth>
                <Media
                  src={post.image}
                  alt={post.title}
                  aspectRatio="16 / 9"
                  radius="l"
                  border
                  priority
                ></Media>
                <Column fillWidth gap="16" paddingY="20" paddingX="24">
                  {post.tag && (
                    <Text variant="label-strong-s" onBackground="neutral-weak">
                      {post.tag}
                    </Text>
                  )}
                  <Heading as="h2" variant="heading-strong-s" wrap="balance">
                    {post.title}
                  </Heading>
                  <Row gap="12" vertical="center">
                    <Avatar src={post.author.avatar} size="s" />
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {post.author.name}
                    </Text>
                  </Row>
                </Column>
              </Column>
            </Card>
          ))}
        </Grid>
      </Column>
    </Column>
  );
};
