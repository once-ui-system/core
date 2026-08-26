import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Fade, fadeVariants } from "../components/Fade";

describe("Fade", () => {
  it("exports fadeVariants with mask and background utilities", () => {
    const variants = fadeVariants();
    expect(variants).toContain("[mask-size:100%_100%]");
    expect(variants).toContain("[-webkit-mask-size:100%_100%]");
    expect(variants).toContain("[mask-image:linear-gradient");
    expect(variants).toContain("[-webkit-mask-image:linear-gradient");
    expect(variants).toContain("[background:linear-gradient");
    expect(variants).toContain("[backdrop-filter:blur(var(--fade-blur))]");
    expect(variants).toContain("[-webkit-backdrop-filter:blur(var(--fade-blur))]");
  });

  it("renders with default props", () => {
    const { container } = render(
      <Fade>
        <span>Fade Content</span>
      </Fade>,
    );
    const fadeEl = container.firstChild as HTMLElement;

    expect(fadeEl).toBeInTheDocument();
    expect(fadeEl).toHaveClass("w-full");
    expect(fadeEl.style.getPropertyValue("--base-color")).toBe("var(--page-background)");
    expect(fadeEl.style.getPropertyValue("--gradient-direction")).toBe("180deg");
    expect(fadeEl.style.getPropertyValue("--fade-blur")).toBe("0.5rem");
    expect(screen.getByText("Fade Content")).toBeInTheDocument();
  });

  it("applies correct gradient direction based on 'to' prop", () => {
    const { container: topContainer } = render(<Fade to="top" />);
    expect(
      (topContainer.firstChild as HTMLElement).style.getPropertyValue("--gradient-direction"),
    ).toBe("0deg");

    const { container: rightContainer } = render(<Fade to="right" />);
    expect(
      (rightContainer.firstChild as HTMLElement).style.getPropertyValue("--gradient-direction"),
    ).toBe("90deg");

    const { container: bottomContainer } = render(<Fade to="bottom" />);
    expect(
      (bottomContainer.firstChild as HTMLElement).style.getPropertyValue("--gradient-direction"),
    ).toBe("180deg");

    const { container: leftContainer } = render(<Fade to="left" />);
    expect(
      (leftContainer.firstChild as HTMLElement).style.getPropertyValue("--gradient-direction"),
    ).toBe("270deg");
  });

  it("resolves named base colors correctly", () => {
    const { container: pageCont } = render(<Fade base="page" />);
    expect((pageCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--page-background)",
    );

    const { container: surfaceCont } = render(<Fade base="surface" />);
    expect((surfaceCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--surface-background)",
    );

    const { container: overlayCont } = render(<Fade base="overlay" />);
    expect((overlayCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--backdrop)",
    );

    const { container: transCont } = render(<Fade base="transparent" />);
    expect((transCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--static-transparent)",
    );
  });

  it("resolves token-based solid and alpha base colors", () => {
    const { container: brandCont } = render(<Fade base="brand-medium" />);
    expect((brandCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--brand-background-medium)",
    );

    const { container: neutralCont } = render(<Fade base="neutral-strong" />);
    expect((neutralCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--neutral-background-strong)",
    );

    const { container: alphaCont } = render(<Fade base="brand-alpha-weak" />);
    expect((alphaCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--brand-alpha-weak)",
    );

    const { container: accentAlphaCont } = render(<Fade base="accent-alpha-medium" />);
    expect((accentAlphaCont.firstChild as HTMLElement).style.getPropertyValue("--base-color")).toBe(
      "var(--accent-alpha-medium)",
    );
  });

  it("applies custom blur amount", () => {
    const { container } = render(<Fade blur={2} />);
    const fadeEl = container.firstChild as HTMLElement;
    expect(fadeEl.style.getPropertyValue("--fade-blur")).toBe("2rem");
  });

  it("configures dot pattern when pattern display is true", () => {
    const { container } = render(<Fade pattern={{ display: true, size: "8" }} />);
    const fadeEl = container.firstChild as HTMLElement;

    expect(fadeEl.style.backgroundImage).toContain("radial-gradient(transparent 1px");
    expect(fadeEl.style.backgroundSize).toContain("var(--static-space-8)");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Fade ref={ref}>
        <span>Content</span>
      </Fade>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Fade className="custom-fade-class" style={{ zIndex: 10 }}>
        <span>Content</span>
      </Fade>,
    );
    const fadeEl = container.firstChild as HTMLElement;

    expect(fadeEl).toHaveClass("custom-fade-class");
    expect(fadeEl.style.zIndex).toBe("10");
  });

  it("passes Flex props down to root element", () => {
    const { container } = render(
      <Fade position="absolute" top="0" left="0" height={12} topRadius="l">
        <span>Content</span>
      </Fade>,
    );
    const fadeEl = container.firstChild as HTMLElement;

    expect(fadeEl).toHaveClass("absolute", "top-0", "left-0", "h-[12px]", "rounded-t-l");
  });
});
