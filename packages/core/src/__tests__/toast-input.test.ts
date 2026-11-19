import { describe, expect, it } from "vitest";
import { normalizeToast } from "../contexts/ToastContext";

describe("normalizeToast", () => {
  it("keeps the 3.0 shape", () => {
    expect(normalizeToast({ tone: "success", message: "Saved", duration: 1000 })).toEqual({
      tone: "success",
      message: "Saved",
      duration: 1000,
    });
  });

  it("maps the 2.x variant and children to tone and message", () => {
    expect(normalizeToast({ variant: "danger", message: "Failed" })).toEqual({
      tone: "danger",
      message: "Failed",
    });
    expect(normalizeToast({ tone: "info", children: "Soon" })).toEqual({
      tone: "info",
      message: "Soon",
    });
  });
});
