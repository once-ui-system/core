"use client";

import React, { forwardRef } from "react";
import { Column } from "./Column";
import { IconButton, IconButtonProps } from "./IconButton";
import { Row } from "./Row";
import { Text } from "./Text";

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
}

const InteractiveDetails = forwardRef<HTMLDivElement, InteractiveDetailsProps>(
  (
    {
      label,
      description,
      iconButtonProps,
      onClick,
      className,
      id,
      labelId,
      descriptionId,
      disabled,
    },
    ref,
  ) => {
    return (
      <Column
        ref={ref}
        cursor={disabled ? "not-allowed" : undefined}
        className={className}
        onClick={onClick}
        id={id}
      >
        <Row gap="4" vertical="center">
          <Text
            as="span"
            id={labelId}
            textVariant="label-default-m"
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
            textVariant="body-default-s"
            onBackground="neutral-weak"
          >
            {description}
          </Text>
        )}
      </Column>
    );
  },
);

InteractiveDetails.displayName = "InteractiveDetails";

export type { InteractiveDetailsProps };
export { InteractiveDetails };
