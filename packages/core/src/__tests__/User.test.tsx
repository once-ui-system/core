import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { User, userVariants } from "../components/User";

describe("User", () => {
  it("renders user details correctly", () => {
    render(<User name="Jane Doe" subline="Product Designer" avatarProps={{ value: "JD" }} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders with tag using tagProps", () => {
    render(
      <User
        name="Jane Doe"
        subline="Product Designer"
        tagProps={{ label: "Admin", variant: "accent" }}
      />,
    );

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders with tag shorthand prop", () => {
    render(<User name="Jane Doe" subline="Product Designer" tag="Member" />);

    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("renders loading state with skeletons", () => {
    render(<User name="Jane Doe" subline="Product Designer" loading={true} />);

    expect(screen.getByLabelText("Loading name")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading subline")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading avatar")).toBeInTheDocument();
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Product Designer")).not.toBeInTheDocument();
  });

  it("renders empty avatar when neither src nor value is given", () => {
    render(<User name="John Doe" />);

    expect(screen.getByLabelText("Empty avatar")).toBeInTheDocument();
  });

  it("renders custom children", () => {
    render(
      <User avatarProps={{ value: "Q" }}>
        <div data-testid="custom-child">Custom Content</div>
      </User>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("forwards ref to root Flex element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<User ref={ref} name="Jane Doe" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("items-center", "gap-8");
  });

  it("merges custom className and preserves style and flex props", () => {
    const { container } = render(
      <User
        name="Jane Doe"
        className="custom-user-class"
        style={{ opacity: 0.8 }}
        padding="16"
        background="surface"
      />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-user-class", "p-16", "bg-surface");
    expect((root as HTMLElement).style.opacity).toBe("0.8");
  });

  it("exports userVariants for composability", () => {
    expect(userVariants).toBeDefined();
    expect(typeof userVariants).toBe("function");
  });
});
