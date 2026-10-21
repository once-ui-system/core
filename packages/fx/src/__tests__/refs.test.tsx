import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ShineFx } from "../ShineFx.js";
import { TypeFx } from "../TypeFx.js";

/** ShineFx and TypeFx render a core `Text` and hand it their ref (core's text-ref test). */
describe("Text-based effects", () => {
  it("passes ShineFx's and TypeFx's refs through to their text", () => {
    const shine = createRef<HTMLSpanElement>();
    const type = createRef<HTMLSpanElement>();
    render(
      <>
        <ShineFx ref={shine}>shine</ShineFx>
        <TypeFx ref={type} words={["typed"]} />
      </>,
    );
    expect(shine.current?.textContent).toBe("shine");
    expect(type.current).toBeInstanceOf(HTMLElement);
  });
});
