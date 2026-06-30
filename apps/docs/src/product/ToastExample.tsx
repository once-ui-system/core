"use client";

import React, { useState } from "react";
import { Button, Row, useToast } from "@once-ui-system/core";

export function ToastExample() {
  const { addToast } = useToast();
  const [count, setCount] = useState(0);

  const handleAddToast = (variant: 'success' | 'danger' | 'warning' | 'info') => {
    setCount(prev => prev + 1);
    const labels: Record<string, string> = {
      success: 'Success!',
      danger: 'Error!',
      warning: 'Warning!',
      info: 'Info',
    };
    addToast({
      variant,
      message: `Toast #${count + 1} - ${labels[variant]}`,
      action: (variant === 'danger' || variant === 'warning') ? (
        <Button size="s" onClick={() => addToast({ variant: 'success', message: 'Retry successful!' })}>
          Retry
        </Button>
      ) : undefined,
    });
  };

  return (
    <Row gap="8" wrap>
      <Button size="s" onClick={() => handleAddToast('success')}>
        Show Success
      </Button>
      <Button size="s" variant="secondary" onClick={() => handleAddToast('danger')}>
        Show Error
      </Button>
      <Button size="s" variant="tertiary" onClick={() => handleAddToast('warning')}>
        Show Warning
      </Button>
      <Button size="s" variant="tertiary" onClick={() => handleAddToast('info')}>
        Show Info
      </Button>
    </Row>
  );
}
