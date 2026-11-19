import { render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { User } from "../components/User";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

/**
 * User is the avatar-plus-name row that UserMenu and lists build on. What it
 * promises: an avatar that is always a named image, the name and subline as
 * text, a tag beside the name, and skeletons that say they are loading.
 */
describe("User", () => {
  it("renders an empty, named avatar with minimal props", async () => {
    const { container } = render(<User />, { wrapper: wrap });
    expect(screen.getByRole("img", { name: "Empty avatar" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows the name, the subline and the avatar's initials", async () => {
    const { container } = render(
      <User name="Lorant One" subline="Design Engineer" avatarProps={{ value: "LO" }} />,
      { wrapper: wrap },
    );
    expect(screen.getByText("Lorant One")).toBeInTheDocument();
    expect(screen.getByText("Design Engineer")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Avatar with initials LO" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows a tag from tagProps beside the name", () => {
    render(<User name="Lorant One" tagProps={{ label: "Admin", tone: "brand" }} />, {
      wrapper: wrap,
    });
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  /** Documented as "Short label shown next to the name", and never read. */
  it("shows the `tag` shorthand beside the name", () => {
    render(<User name="Lorant One" tag="Owner" />, { wrapper: wrap });
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("lets tagProps.label win over tag", () => {
    render(<User name="Lorant One" tag="Owner" tagProps={{ label: "Admin" }} />, {
      wrapper: wrap,
    });
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.queryByText("Owner")).toBeNull();
  });

  it("shows no name column, and so no subline or tag, without a name", () => {
    render(<User subline="Design Engineer" tag="Owner" />, { wrapper: wrap });
    expect(screen.queryByText("Design Engineer")).toBeNull();
    expect(screen.queryByText("Owner")).toBeNull();
  });

  it("replaces the avatar, name and subline with labelled skeletons while loading", async () => {
    const { container } = render(<User loading name="Lorant One" subline="Design Engineer" />, {
      wrapper: wrap,
    });
    expect(screen.queryByText("Lorant One")).toBeNull();
    expect(screen.queryByText("Design Engineer")).toBeNull();
    expect(screen.getByRole("status", { name: "Loading avatar" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    // Each labelled skeleton is a named status, as the avatar's: a bare
    // aria-label on a role-less div is not announced.
    expect(screen.getByRole("status", { name: "Loading name" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading subline" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("renders custom children after the avatar", () => {
    render(
      <User avatarProps={{ value: "Q" }}>
        <span>Quasar</span>
      </User>,
      { wrapper: wrap },
    );
    const avatar = screen.getByRole("img", { name: "Avatar with initials Q" });
    expect(avatar.nextElementSibling).toHaveTextContent("Quasar");
  });

  it("forwards its ref and className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<User ref={ref} className="mine" name="A" />, { wrapper: wrap });
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("mine");
  });
});
