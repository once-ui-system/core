"use client";

import classNames from "clsx";
import React, { forwardRef, type ReactNode, useId } from "react";
import { FieldsetDisabledContext, useFieldsetDisabled } from "../internal/fieldsetDisabled";
import styles from "./Fieldset.module.scss";
import { Form, type FormProps } from "./Form";
import { Text } from "./Text";

/**
 * Fieldset — a titled section of a form.
 *
 * A real `<fieldset>` with a `<legend>`, so a screen reader announces the
 * section's name on entering it, and `disabled` disables every native control
 * inside at once. The fields themselves are laid out by a `Form` grid, so a
 * section takes the same `density`, `columns` and `span` as a whole form and
 * fuses its own group of corners. The size of the form around it carries in
 * unless the section sets its own.
 */
interface FieldsetProps
  extends Omit<FormProps, "as" | "onSubmit" | "pending" | "title">,
    Pick<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "disabled" | "name"> {
  /** The section's name, rendered as its `<legend>`. */
  legend?: ReactNode;
  /** A line under the legend, read out as the section's description. */
  description?: ReactNode;
  /** How many columns to occupy inside an outer `Form` grid. */
  span?: number;
}

const renders = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  (
    {
      legend,
      description,
      disabled,
      name,
      // Consumed by an outer `Form`, never rendered.
      span,
      density,
      columns,
      size,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const descriptionId = `fieldset-${useId().replace(/:/g, "")}-description`;
    const hasDescription = renders(description);
    // A Fieldset inside a disabled one is disabled too, as the browser does.
    const disabledHere = useFieldsetDisabled(disabled);

    return (
      <fieldset
        ref={ref}
        disabled={disabled}
        name={name}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className={classNames(styles.fieldset, className)}
        style={style}
        {...(rest as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}
      >
        {renders(legend) && (
          <Text
            as="legend"
            variant="heading-strong-s"
            onBackground="neutral-strong"
            className={styles.legend}
          >
            {legend}
          </Text>
        )}
        {hasDescription && (
          <Text
            as="p"
            id={descriptionId}
            variant="body-default-s"
            onBackground="neutral-weak"
            className={styles.description}
          >
            {description}
          </Text>
        )}
        <FieldsetDisabledContext.Provider value={disabledHere}>
          <Form density={density} columns={columns} size={size}>
            {children}
          </Form>
        </FieldsetDisabledContext.Provider>
      </fieldset>
    );
  },
);

Fieldset.displayName = "Fieldset";

export type { FieldsetProps };
export { Fieldset };
