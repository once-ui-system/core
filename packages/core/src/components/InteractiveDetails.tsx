"use client";

import classNames from "clsx";
import React from "react";
import { CONTROL_TEXT, type ControlSize } from "../internal/controlChrome.js";
import { Column } from "./Column.js";
import { IconButton, IconButtonProps } from "./IconButton.js";
import { Row } from "./Row.js";
import shared from "./SharedInteractiveStyles.module.scss";
import { Text } from "./Text.js";

interface InteractiveDetailsProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  iconButtonProps?: IconButtonProps;
  onClick: () => void;
  className?: string;
  id?: string;
  /** Goes on the label text alone, so the control beside it is named by its
   *  label and not by the description and help button `id` also covers. */
  labelId?: string;
  /** Goes on the description text, for the control's `aria-describedby`. */
  descriptionId?: string;
  /** The control's size; sets the text presets. */
  size?: ControlSize;
  /** No size was given: the theme's `density` restyles the text in CSS. */
  auto?: boolean;
  /** Shown under the description, in the danger colour. */
  errorMessage?: React.ReactNode;
  /** Goes on the error message, for the control's `aria-describedby`. */
  errorId?: string;
}

const InteractiveDetails = ({
  ref,
  label,
  description,
  iconButtonProps,
  onClick,
  className,
  id,
  labelId,
  descriptionId,
  disabled,
  size = "m",
  auto = false,
  errorMessage,
  errorId,
}: InteractiveDetailsProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <Column
      ref={ref}
      cursor={disabled ? "not-allowed" : undefined}
      className={classNames(auto && shared.autoText, className)}
      onClick={onClick}
      id={id}
    >
      <Row gap="4" vertical="center">
        <Text
          as="span"
          id={labelId}
          textVariant={CONTROL_TEXT[size].label}
          className={auto ? shared.detailLabel : undefined}
          onBackground={disabled ? "neutral-weak" : "neutral-strong"}
        >
          {label}
        </Text>
        {iconButtonProps?.tooltip && (
          <div onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="s"
              variant="ghost"
              icon="help"
              aria-label="More information"
              {...iconButtonProps}
            />
          </div>
        )}
      </Row>
      {description && (
        <Text
          as="span"
          id={descriptionId}
          textVariant={CONTROL_TEXT[size].body}
          className={auto ? shared.detailBody : undefined}
          onBackground="neutral-weak"
        >
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text
          as="span"
          id={errorId}
          textVariant={CONTROL_TEXT[size].body}
          className={auto ? shared.detailBody : undefined}
          onBackground="danger-weak"
        >
          {errorMessage}
        </Text>
      )}
    </Column>
  );
};

InteractiveDetails.displayName = "InteractiveDetails";

export type { InteractiveDetailsProps };
export { InteractiveDetails };
