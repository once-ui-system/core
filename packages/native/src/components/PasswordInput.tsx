import { forwardRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";
import type { RefComponent, TextInputRef } from "./refs";

export type PasswordInputProps = Omit<InputProps, "suffix" | "secureTextEntry">;

/**
 * Core's `PasswordInput`: an `Input` that hides what is typed, with an eye
 * button that shows it. It turns off autocorrect and capitals, and offers the
 * platform's saved passwords unless `textContentType` or `autoComplete` say otherwise.
 */
export const PasswordInput: RefComponent<PasswordInputProps, TextInputRef> = forwardRef<
  TextInputRef,
  PasswordInputProps
>(function PasswordInput(props, ref) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Input
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="current-password"
      textContentType="password"
      {...props}
      ref={ref}
      secureTextEntry={!showPassword}
      suffix={
        <IconButton
          onPress={() => setShowPassword(!showPassword)}
          variant="ghost"
          icon={showPassword ? "eyeOff" : "eye"}
          ariaLabel={showPassword ? "Hide password" : "Show password"}
          size="s"
          disabled={props.disabled}
        />
      }
    />
  );
});
