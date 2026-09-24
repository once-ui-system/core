import { Column, Row } from "@once-ui-system/core";
import { MediaPost2, Sidebar3 } from ".";

const Entry1 = () => {
  return (
    <Column fillWidth horizontal="center" padding="16">
      <Row fillWidth vertical="center" paddingY="l">
        <Row
          s={{ hide: true }}
          position="sticky"
          fitHeight
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <Sidebar3 />
        </Row>
        <MediaPost2
          media="/images/backgrounds/1.jpg"
          content="Captured this breathtaking sunset from Musinsa Terrace in Seoul. Perfect end to the day."
          user={{
            name: "Lorant One",
            avatar: "/images/creators/lorant.jpg",
          }}
        />
      </Row>
      <Row hide s={{ hide: false }} height="64" />
      <Sidebar3
        hide
        s={{ hide: false }}
        background="page"
        fillWidth
        horizontal="center"
        direction="row"
        position="sticky"
        bottom="0"
      />
    </Column>
  );
};

export { Entry1 };
