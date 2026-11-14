"use client";

import type React from "react";
import type { ReactNode } from "react";
import { Column } from "../../components/Column.js";
import { Icon } from "../../components/Icon.js";
import { IconButton } from "../../components/IconButton.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import type { IconName } from "../../icons.js";

export interface ActionCardProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  /** The kind of thing the card is about: a site, a post, an email. */
  icon?: IconName;
  /** What the card is about, in one line. */
  title: ReactNode;
  /** Right of the title: a status `Tag` or a count. */
  meta?: ReactNode;
  /** The card's body. */
  children?: ReactNode;
  /**
   * Buttons, right-aligned; the row wraps in a narrow bubble. A write the
   * assistant proposes goes here as the one primary button, so nothing
   * happens until the person presses it.
   */
  footer?: ReactNode;
  /** Opens the card's subject beside the conversation (a workspace tab); shows an eye button. */
  onPreview?: () => void;
  /** The preview button's name. */
  previewLabel?: string;
}

/**
 * The card an assistant answers with instead of text: a header with an icon,
 * a title and a status, a body, and a footer of actions. One frame for every
 * kind of result, so a conversation reads as one product rather than a
 * collage. Put it in a `ChatMessage` from the assistant.
 */
export function ActionCard({
  icon,
  title,
  meta,
  children,
  footer,
  onPreview,
  previewLabel = "Preview",
  ...rest
}: ActionCardProps) {
  return (
    <Column
      fillWidth
      radius="l"
      border="neutral-alpha-medium"
      background="surface"
      overflow="hidden"
      {...rest}
    >
      <Row
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="8"
        vertical="center"
        borderBottom={children || footer ? true : undefined}
      >
        {icon ? <Icon name={icon} size="xs" onBackground="neutral-weak" /> : null}
        <Row flex={1} minWidth={0}>
          <Text textVariant="label-strong-m" truncate>
            {title}
          </Text>
        </Row>
        {meta}
        {onPreview ? (
          <IconButton
            size="s"
            variant="ghost"
            icon="eye"
            tooltip={previewLabel}
            onClick={onPreview}
          />
        ) : null}
      </Row>
      {children ? (
        <Column fillWidth padding="16" gap="12">
          {children}
        </Column>
      ) : null}
      {footer ? (
        <Row
          fillWidth
          paddingX="16"
          paddingY="12"
          gap="8"
          horizontal="end"
          vertical="center"
          wrap
          borderTop
        >
          {footer}
        </Row>
      ) : null}
    </Column>
  );
}
