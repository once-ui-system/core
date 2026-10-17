"use client";

import React, { useState } from "react";
import { Dialog, Button, Column, Text, Input, BlobFx } from "@once-ui-system/core";

export function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <Dialog variant="sheet"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
      >
        <Column fillWidth gap="16" marginTop="12">
          <Text>
            Modal content goes here. This area can contain any React components.
          </Text>
          <Input id="example" label="Example input" />
        </Column>
      </Dialog>
    </>
  );
}

export function ModalWithBackdrop() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Modal with Backdrop
      </Button>
      <Dialog variant="sheet"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal with Backdrop"
        backdrop={
          <BlobFx position="absolute" fill translateY="50%" />
        }
      >
        <Column fillWidth gap="16" marginTop="12">
          <Text>
            The backdrop appears behind the modal content.
          </Text>
        </Column>
      </Dialog>
    </>
  );
}
