import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AccessibilityInfo, View } from "react-native";
import { Button, type ButtonProps } from "./Button";
import { Feedback, type FeedbackProps } from "./Feedback";
import { Column, type FlexProps, Row } from "./Flex";
import { Form, type FormProps } from "./Form";
import { FormFieldContext, FormStatusContext, useFormPending } from "./FormContext";
import type { ViewRef } from "./refs";
import { Heading, Text } from "./Text";

/** Whether a node draws anything, so an empty hint gets no line. */
const renders = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

const plain = (node: ReactNode) =>
  typeof node === "string" || typeof node === "number" ? String(node) : undefined;

/** The props a `Field` gives its control. */
export interface FieldControlProps {
  error?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
}

export interface FieldProps extends Omit<FlexProps, "children"> {
  /** The label above the control, and its spoken name. */
  label?: ReactNode;
  /** Helper text under the control, read as its hint. */
  hint?: ReactNode;
  /** The error message. While set, the control is drawn and announced as invalid. */
  error?: ReactNode;
  /** An asterisk after the label, and `aria-required` on the control. */
  required?: boolean;
  /** Core's id for the control. React Native wires the control by props instead; kept so web code compiles. */
  controlId?: string;
  /** How many columns to take inside a `Form`. */
  span?: number;
  /** One control element, or a function that receives the control's props. */
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
}

/**
 * Core's `Field`: a label, a hint and an error around one control, wired
 * together. The control gets `error`, its spoken name and hint, and
 * `aria-required`, merged under its own props.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  controlId: _controlId,
  span: _span,
  children,
  ...column
}: FieldProps) {
  const invalid = renders(error);
  const spoken = [invalid ? plain(error) : undefined, plain(hint)].filter(Boolean).join(". ");
  const control: FieldControlProps = {
    ...(invalid ? { error: true, "aria-invalid": true } : {}),
    ...(plain(label) ? { accessibilityLabel: plain(label) } : {}),
    ...(spoken ? { accessibilityHint: spoken } : {}),
    ...(required ? { "aria-required": true } : {}),
  };
  const elements =
    typeof children === "function" ? [] : Children.toArray(children).filter(isValidElement);
  const child = elements.length === 1 ? (elements[0] as ReactElement<FieldControlProps>) : null;
  const rendered =
    typeof children === "function"
      ? children(control)
      : child
        ? // The control's own props win over the Field's, except a floating
          // label repeating the Field's own, which would show it twice.
          cloneElement(child, {
            ...control,
            ...child.props,
            ...((child.props as { label?: unknown }).label === plain(label) && plain(label)
              ? { label: undefined }
              : {}),
          })
        : children;

  return (
    <Column gap="8" fillWidth {...column}>
      {renders(label) && (
        <Row paddingX="4" gap="4" vertical="center">
          {plain(label) ? (
            <Text textVariant="label-strong-s" onBackground="neutral-strong">
              {label}
            </Text>
          ) : (
            label
          )}
          {required && (
            <Text
              textVariant="label-strong-s"
              onBackground="danger-weak"
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              *
            </Text>
          )}
        </Row>
      )}
      {rendered}
      {invalid && (
        <Text
          paddingX="16"
          textVariant="body-default-s"
          onBackground="danger-weak"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
      {renders(hint) && (
        <Text paddingX="16" textVariant="body-default-s" onBackground="neutral-weak">
          {hint}
        </Text>
      )}
    </Column>
  );
}

export interface FieldsetProps extends Omit<FormProps, "as" | "onSubmit" | "pending"> {
  /** The section's name, as its heading. */
  legend?: ReactNode;
  /** A line under the legend. */
  description?: ReactNode;
  /** Disables every field inside, as a disabled `<fieldset>` does. */
  disabled?: boolean;
  /** How many columns to take inside an outer `Form`. */
  span?: number;
}

/**
 * Core's `Fieldset`: a titled section of a form whose fields are laid out by
 * a `Form` grid, so it takes the same `density`, `columns` and `span`.
 * `disabled` disables the fields inside.
 */
export function Fieldset({
  legend,
  description,
  disabled,
  span: _span,
  density,
  columns,
  size,
  children,
  ...column
}: FieldsetProps) {
  const outer = useContext(FormFieldContext);
  return (
    <Column fillWidth gap="12" accessibilityRole="none" aria-disabled={disabled} {...column}>
      {(renders(legend) || renders(description)) && (
        <Column gap="4" paddingX="4">
          {renders(legend) && (
            <Heading textVariant="heading-strong-s" accessibilityRole="header">
              {legend}
            </Heading>
          )}
          {renders(description) && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {description}
            </Text>
          )}
        </Column>
      )}
      <FormFieldContext.Provider value={{ ...outer, disabled: disabled || outer.disabled }}>
        <Form density={density} columns={columns} size={size}>
          {children}
        </Form>
      </FormFieldContext.Provider>
    </Column>
  );
}

export interface SubmitButtonProps extends ButtonProps {
  /** The label while the form is submitting, such as "Saving…". */
  pendingLabel?: string;
  /** Forces the pending look from outside. */
  pending?: boolean;
  /** Core's name for `onPress`; both work. */
  onClick?: () => void;
}

/**
 * Core's `SubmitButton`: a `Button` that submits the `Form` around it (React
 * Native has no form element) and shows a spinner, ignoring taps, while the
 * submit runs, so a double tap sends one request.
 */
export function SubmitButton({
  pendingLabel,
  pending,
  loading,
  label,
  onPress,
  onClick,
  ...rest
}: SubmitButtonProps) {
  const form = useContext(FormStatusContext);
  const formPending = useFormPending();
  const isPending = pending ?? formPending;
  return (
    <Button
      loading={loading || isPending}
      aria-busy={isPending || undefined}
      label={isPending && pendingLabel !== undefined ? pendingLabel : label}
      {...rest}
      onPress={(event) => {
        if (isPending) return;
        onPress?.(event);
        onClick?.();
        form.submit?.();
      }}
    />
  );
}

export interface FormErrorItem {
  /** Core's control id. Kept so the same error map works; entries are plain text here. */
  id?: string;
  message: ReactNode;
}

export interface FormErrorSummaryProps extends Omit<FeedbackProps, "variant" | "title"> {
  /** A list, or a map from control id to message: the shape validation libraries return. */
  errors: FormErrorItem[] | Record<string, ReactNode>;
  /** Defaults to "Check the highlighted fields". */
  title?: string;
  /** Moves the screen reader to the summary when it appears or its errors change. */
  autoFocus?: boolean;
  span?: number;
}

const errorItems = (errors: FormErrorSummaryProps["errors"]): FormErrorItem[] =>
  (Array.isArray(errors)
    ? errors
    : Object.entries(errors).map(([id, message]) => ({ id, message }))
  ).filter((item) => renders(item.message));

/** Core's `FormErrorSummary`: every error in a form in one alert, after a failed submit. */
export function FormErrorSummary({
  errors,
  title = "Check the highlighted fields",
  autoFocus = true,
  span: _span,
  ...rest
}: FormErrorSummaryProps) {
  const items = errorItems(errors);
  const ref = useRef<ViewRef>(null);
  const signature = `${items.map((item) => item.id ?? "").join("|")}#${items.length}`;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `signature` is the trigger
  useEffect(() => {
    if (!autoFocus || items.length === 0) return;
    if (ref.current) AccessibilityInfo.sendAccessibilityEvent?.(ref.current, "focus");
  }, [autoFocus, signature]);
  if (items.length === 0) return null;
  return (
    <View ref={ref} accessible={false}>
      <Feedback tone="danger" title={title} {...rest}>
        <Column gap="4">
          {items.map((item, i) => (
            <Row key={item.id ?? i} gap="8">
              <Text textVariant="body-default-s" onBackground="danger-weak">
                •
              </Text>
              <Text textVariant="body-default-s" onBackground="danger-weak" style={{ flex: 1 }}>
                {item.message}
              </Text>
            </Row>
          ))}
        </Column>
      </Feedback>
    </View>
  );
}

/** Tells a `Form` to give no cell (and no gap) to a summary with nothing to show. */
FormErrorSummary.drawsNothing = (props: FormErrorSummaryProps) =>
  errorItems(props.errors).length === 0;
