"use client";

import { Button, Column, Dialog, Input, Row, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { useLumen } from "./LumenProvider";

export function CreateProjectDialog() {
  const { createOpen, closeCreate } = useLumen();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    closeCreate();
    setName("");
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2) {
      setError("Give the project a name of at least two characters.");
      return;
    }
    addToast({ variant: "success", message: `Project “${value}” created` });
    close();
  };

  return (
    <Dialog
      open={createOpen}
      onClose={close}
      title="Create a project"
      description="Projects group issues and analytics for one product."
    >
      <form onSubmit={submit} noValidate>
        <Column gap="16" paddingTop="8">
          <Input
            id="project-name"
            label="Project name"
            value={name}
            error={error !== null}
            errorMessage={error ?? undefined}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
          <Row gap="8" horizontal="end">
            <Button type="button" variant="tertiary" label="Cancel" onClick={close} />
            <Button type="submit" label="Create project" prefixIcon="plus" />
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
