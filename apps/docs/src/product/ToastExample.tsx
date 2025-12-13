"use client";

import React, { useState } from "react";
import { Button, Row, useToast } from "@once-ui-system/core";

export function ToastExample() {
  const { addToast } = useToast();
  const [count, setCount] = useState(0);

  const handleAddToast = (variant: "success" | "danger") => {
    setCount((prev) => prev + 1);
    addToast({
      variant,
      message: `Toast #${count + 1} - ${variant === "success" ? "Success!" : "Error!"}`,
      action:
        variant === "danger" ? (
          <Button
            size="s"
            onClick={() => addToast({ variant: "success", message: "Retry successful!" })}
          >
            Retry
          </Button>
        ) : undefined,
    });
  };

  return (
    <Row gap="8">
      <Button size="s" onClick={() => handleAddToast("success")}>
        Show Success
      </Button>
      <Button size="s" variant="secondary" onClick={() => handleAddToast("danger")}>
        Show Error
      </Button>
    </Row>
  );
}
