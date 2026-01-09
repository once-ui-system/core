"use client";

import React, { useState } from "react";
import { Textarea } from "@once-ui-system/core";

// Textarea with validation
export function ValidationTextareaExample() {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const validateContent = (value: React.ReactNode) => {
    if (value && typeof value === "string" && value.length < 20) {
      return "Please enter at least 20 characters";
    }
    return null;
  };

  return (
    <Textarea
      id="validation-textarea"
      label="Review"
      placeholder="Write your review"
      value={value}
      onChange={handleChange}
      validate={validateContent}
    />
  );
}

export function TextareaCharacterCountExample() {
  const [bio, setBio] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };
  
  return (
    <Textarea
      id="character-count-textarea"
      placeholder="Bio"
      value={bio}
      onChange={handleChange}
      maxLength={200}
      characterCount
      lines={4}
    />
  );
}
