import { Column, Media, Row, Text } from "@once-ui-system/core";
import { BlobFx, CountFx, HoloFx, TiltFx } from "@once-ui-system/fx";

export const Features15 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth padding="1" radius="xl" overflow="hidden" {...flex}>
      <BlobFx position="absolute" bottom="0" left="0" themeSolid="inverse" translateY="40%" />
      <Column fillWidth background="page" radius="xl" overflow="hidden" padding="l" gap="24">
        <BlobFx
          position="absolute"
          top="0"
          left="50%"
          translateX="-50%"
          width="60%"
          translateY="-60%"
          themeSolid="inverse"
        />

        <Row gap="20" fillWidth vertical="center">
          <Column fillWidth horizontal="center" align="center" gap="16">
            <Text textVariant="code-default-s" onBackground="brand-medium">
              TRUSTED AT SCALE
            </Text>

            <CountFx textVariant="display-strong-l" value={12400} separator=",">
              +
            </CountFx>

            <Text
              textVariant="heading-default-s"
              onBackground="neutral-weak"
              wrap="balance"
              marginTop="16"
            >
              teams ship production-ready apps every month on a design system built to grow with
              them
            </Text>
          </Column>

          <TiltFx fillWidth>
            <HoloFx
              fillWidth
              texture={{
                opacity: 0,
              }}
            >
              <Media
                radius="l"
                border
                sizes={1024}
                src="/images/products/studio-01.jpg"
                alt="Product dashboard preview"
              />
            </HoloFx>
          </TiltFx>
        </Row>
      </Column>
    </Column>
  );
};
