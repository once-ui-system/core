import { render, waitFor } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { CodeBlock } from "../modules/code/CodeBlock";

/**
 * Prism highlights every `code[class*="language-"]` in the document by itself,
 * a frame after its module evaluates, unless `Prism.manual` is set first. On a
 * docs page of server-rendered CodeBlocks that pass reached the blocks React
 * had not hydrated yet and rewrote their text into token spans, so hydrating
 * them failed with a text mismatch (React #418) on whichever page lost the
 * race. A CodeBlock highlights only its own element, once it owns it.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const frames = (n: number) => new Promise((resolve) => setTimeout(resolve, n * 20));

describe("CodeBlock and Prism's automatic highlighting", () => {
  it("leaves code it does not own alone", async () => {
    // Stands in for a server-rendered block that has not hydrated yet.
    const foreign = document.createElement("code");
    foreign.className = "language-js";
    foreign.textContent = "const a = 1;";
    document.body.appendChild(foreign);

    const { container } = render(
      <CodeBlock codes={[{ code: "const b = 2;", language: "tsx", label: "Example" }]} />,
      { wrapper: wrap },
    );

    // The block's own code is highlighted once Prism has loaded…
    await waitFor(() => expect(container.querySelector("code .token")).not.toBeNull(), {
      timeout: 5000,
    });
    // …and Prism's automatic pass, had it run, would have had its frame by now.
    await frames(5);

    expect(foreign.querySelector(".token")).toBeNull();
    expect(foreign.textContent).toBe("const a = 1;");
    expect((window as unknown as { Prism?: { manual?: boolean } }).Prism?.manual).toBe(true);
    foreign.remove();
  });
});
