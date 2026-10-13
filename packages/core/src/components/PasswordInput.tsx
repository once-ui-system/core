"use client";

import React, { forwardRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Input, InputProps } from "./Input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      type={showPassword ? "text" : "password"}
      suffix={
        <IconButton
          onClick={() => {
            setShowPassword(!showPassword);
          }}
          variant="ghost"
          icon={showPassword ? "eyeOff" : "eye"}
          aria-label={showPassword ? "Hide password" : "Show password"}
          size="s"
          type="button"
        />
      }
    />
  );
});

PasswordInput.displayName = "PasswordInput";
