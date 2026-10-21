import { Background, Button, Column, Heading, Text } from "@once-ui-system/core";
import { BlobFx, TiltFx } from "@once-ui-system/fx";

export const Features9: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <TiltFx fillWidth {...flex}>
      <Column
        border
        background="page"
        paddingX="32"
        radius="xl"
        overflow="hidden"
        paddingY="160"
        fillWidth
      >
        <Background
          position="absolute"
          top="0"
          left="0"
          mask={{
            x: "50%",
            y: 0,
            radius: "40vh",
          }}
          grid={{
            display: true,
            color: "neutral-alpha-weak",
            width: "2rem",
            height: "2rem",
          }}
        />
        <BlobFx position="absolute" top="0" left="0" translateY="65%" />
        <Column horizontal="center" gap="16" fillWidth>
          <Heading align="center" as="h2" textVariant="display-default-l">
            Quick start
          </Heading>
          <Text align="center" textVariant="body-default-l" marginBottom="48">
            With the design system built for indie creators
          </Text>
          <Button arrowIcon id="feature-9" weight="default" label="Launch your project" href="#" />
        </Column>
      </Column>
    </TiltFx>
  );
};
