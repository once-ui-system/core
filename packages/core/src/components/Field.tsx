"use client";

import classNames from "clsx";
import React, { type ReactNode, useId } from "react";
import { Column } from "./Column.js";
import { type FieldControl, FieldControlContext } from "./FormContext.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

/**
 * Field — a label, a hint and an error around one control, wired together.
 *
 * The wiring is the point. A label above a control, a hint under it and an
 * error that appears on submit are three elements that each need an id, and
 * the control needs `aria-describedby` pointing at whichever of the last two
 * rendered, and `aria-invalid` while the error shows. Written by hand that is
 * id bookkeeping repeated on every field, and the usual way it breaks is
 * silent: the error renders and a screen reader never hears it.
 *
 * Field hands the control its `id`, `aria-describedby`, `aria-invalid` and
 * `aria-required` as props, merged with the control's own. `Input` and
 * `Textarea` (and the fields built on them) also read the invalid state from
 * context, so they draw their error styling without a separate `error` prop.
 * A control that is not an element — a render function — gets the same
 * attributes as an argument to spread where it wants them.
 */

/** The attributes a `Field` gives its control. */
interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
}

interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Visible label above the control, linked to it with `htmlFor`. */
  label?: ReactNode;
  /** Helper text under the control, read out as part of its description. */
  hint?: ReactNode;
  /**
   * The error message. While it is set the control is marked invalid. The
   * hint stays beside it, so the instruction is still there when the user
   * goes back to fix the value.
   */
  error?: ReactNode;
  /** Mark the control required: an asterisk after the label and `aria-required`. */
  required?: boolean;
  /**
   * The control's id. Defaults to the id the control already has, then to a
   * generated one, so `<Field><Input id="email" /></Field>` needs no repeat.
   */
  controlId?: string;
  /** How many columns to occupy inside a `Form` grid. `Form` reads this off
   *  the child and strips it; outside a `Form` it does nothing. */
  span?: number;
  /** One control element, or a function that receives the control's props. */
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

/** Whether a node draws anything, so an empty hint gets no element and no reference. */
const renders = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

const Field = ({
  ref,
  label,
  hint,
  error,
  required = false,
  controlId,
  // Consumed by `Form`, never rendered. See Input.tsx.
  span,
  children,
  className,
  style,
  ...rest
}: FieldProps) => {
  const generatedId = useId();
  // The one element among the children, ignoring the whitespace text an MDX
  // or template author leaves around it. Anything else — several elements,
  // a fragment of text — is rendered as given, wired by context only.
  const elements =
    typeof children === "function"
      ? []
      : React.Children.toArray(children).filter(React.isValidElement);
  const child = elements.length === 1 ? elements[0] : null;
  const childProps = (child?.props ?? {}) as {
    id?: string;
    "aria-describedby"?: string;
  };

  const id = controlId ?? childProps.id ?? `field-${generatedId.replace(/:/g, "")}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-field-error`;
  const hasHint = renders(hint);
  const invalid = renders(error);

  // The control's own description comes first, then the error — the newest
  // and most urgent thing — and the hint last.
  const describedBy =
    [childProps["aria-describedby"], invalid ? errorId : undefined, hasHint ? hintId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  const controlProps: FieldControlProps = {
    id,
    "aria-describedby": describedBy,
    ...(invalid ? { "aria-invalid": true as const } : {}),
    ...(required ? { "aria-required": true as const } : {}),
  };

  const context = React.useMemo<FieldControl>(
    () => ({ id, invalid, required, describedBy }),
    [id, invalid, required, describedBy],
  );

  const control =
    typeof children === "function"
      ? children(controlProps)
      : child
        ? React.cloneElement(child as React.ReactElement<FieldControlProps>, controlProps)
        : children;

  return (
    <Column
      ref={ref}
      gap="8"
      fillWidth
      className={classNames(className)}
      style={style}
      data-invalid={invalid || undefined}
      {...rest}
    >
      {renders(label) && (
        <Row paddingX="4" gap="4" vertical="center">
          <Text as="label" htmlFor={id} textVariant="label-strong-s" onBackground="neutral-strong">
            {label}
          </Text>
          {required && (
            // The asterisk is decoration; `aria-required` is what a screen
            // reader announces, so it is not read out twice.
            <Text textVariant="label-strong-s" onBackground="danger-weak" aria-hidden="true">
              *
            </Text>
          )}
        </Row>
      )}
      <FieldControlContext.Provider value={context}>{control}</FieldControlContext.Provider>
      {invalid && (
        <Row paddingX="16" id={errorId} textVariant="body-default-s" onBackground="danger-weak">
          {error}
        </Row>
      )}
      {hasHint && (
        <Row paddingX="16" id={hintId} textVariant="body-default-s" onBackground="neutral-weak">
          {hint}
        </Row>
      )}
    </Column>
  );
};

Field.displayName = "Field";

export { useField } from "./FormContext.js";
export type { FieldControlProps, FieldProps };
export { Field };
