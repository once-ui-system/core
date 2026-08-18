"use client";

import { forwardRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";

export interface PasswordInputProps extends InputProps {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      type={showPassword ? "text" : "password"}
      hasSuffix={
        <IconButton
          onClick={() => {
            setShowPassword((prev) => !prev);
          }}
          variant="ghost"
          icon={showPassword ? "eyeOff" : "eye"}
          size="s"
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
        />
      }
    />
  );
});

PasswordInput.displayName = "PasswordInput";
