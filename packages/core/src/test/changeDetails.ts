import { expect } from "vitest";

/** Matches the `ChangeDetails` every `onXChange` passes after its value. */
export const changeDetails = expect.objectContaining({
  source: expect.any(String),
  cancel: expect.any(Function),
});
