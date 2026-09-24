"use client";

import { Column, EmojiPickerDropdown, IconButton, Row, Textarea } from "@once-ui-system/core";
import { useState } from "react";
import { MediaPost1, Sidebar3 } from ".";

export const Feed1 = () => {
  const [post, setPost] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [isSubmitting, _setIsSubmitting] = useState(false);
  const [submitError, _setSubmitError] = useState("");

  return (
    <Row fillWidth paddingX="16" paddingTop="16">
      <Row
        s={{ hide: true }}
        position="sticky"
        fitHeight
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        <Sidebar3 />
      </Row>
      <Column fillWidth horizontal="center">
        <Column
          maxWidth="s"
          background="surface"
          topRadius="l"
          borderX="surface"
          borderTop="surface"
          borderBottom="surface"
        >
          <Row padding="20">
            <Textarea
              id="post-input"
              placeholder="Add a post..."
              style={{ padding: "0.75rem" }}
              value={post}
              onChange={(e) => setPost(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              disabled={isSubmitting}
              error={!!submitError}
              errorMessage={submitError}
            >
              <Row
                fillWidth
                style={{ height: inputFocused ? "2.5rem" : "0" }}
                transition="micro-medium"
              >
                <Row fillWidth horizontal="between" paddingX="8" paddingBottom="8">
                  <EmojiPickerDropdown
                    onSelect={(emoji) => setPost(post + emoji)}
                    trigger={
                      <Row fillWidth data-border="rounded" gap="4">
                        <IconButton icon="smiley" size="m" variant="tertiary" />
                        <IconButton icon="camera" size="m" variant="tertiary" />
                      </Row>
                    }
                  />
                  <Row style={{ opacity: post.length > 0 ? 1 : 0 }} transition="micro-medium">
                    <IconButton
                      icon="send"
                      loading={isSubmitting}
                      size="m"
                      disabled={!post || isSubmitting}
                    />
                  </Row>
                </Row>
              </Row>
            </Textarea>
          </Row>
          <MediaPost1
            user={{ name: "Lorant One", avatar: "/images/creators/lorant.jpg" }}
            media={[
              "/images/backgrounds/1.jpg",
              "/images/backgrounds/2.jpg",
              "/images/backgrounds/3.jpg",
            ]}
            content="Some shots from 2024"
          />
          <MediaPost1
            user={{ name: "Adhitya Nadooli", avatar: "/images/creators/light.jpg" }}
            media={["/images/blog/adhitya-cover-tilted.jpg"]}
            aspectRatio="16/9"
            content="Just launched my new app, Script Outreach!"
          />
          <MediaPost1
            user={{ name: "Texz", avatar: "/images/creators/texz.jpg" }}
            media={["https://www.youtube.com/watch?v=TQT_FSdxbC8"]}
          />
        </Column>
      </Column>
    </Row>
  );
};
