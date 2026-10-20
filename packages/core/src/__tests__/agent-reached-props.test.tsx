import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Column } from "../components/Column";
import { DateRangeInput } from "../components/DateRangeInput";
import { DateRangePicker } from "../components/DateRangePicker";
import { Heading } from "../components/Heading";
import { Row } from "../components/Row";
import { ServerFlex } from "../components/ServerFlex";
import { Text } from "../components/Text";
import { LayoutProvider } from "../contexts/LayoutProvider";
import type { BarChartProps } from "../modules/data/BarChart.impl";
import LineChart, { type LineChartProps } from "../modules/data/LineChart.impl";
import type { PieChartProps } from "../modules/data/PieChart.impl";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Props and values agents wrote on a first attempt that failed strict tsc,
 * in the benchmark transcripts (2.1.0 claim run, rc.0, pilot), and that keep
 * one meaning, so they are accepted rather than documented around:
 *
 * - `marginLeft="auto"` (3 runs): margin props took tokens and numbers only.
 * - chart `data` typed with an `interface` (3 runs): `DataPoint` has an index
 *   signature, which an interface never satisfies.
 * - a DateRange `value` typed `{ startDate?: Date; endDate?: Date }`, or `{}`
 *   for no range (2 runs).
 */

const classesOf = (el: React.ReactElement) => {
  const html = renderToStaticMarkup(el);
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ");
};

describe('margin="auto"', () => {
  it("is a class on Row, Column, Text and Heading", () => {
    expect(classesOf(<Row marginLeft="auto">x</Row>)).toContain("ml-auto");
    expect(classesOf(<Column marginX="auto">x</Column>)).toContain("mx-auto");
    expect(classesOf(<Text marginTop="auto">x</Text>)).toContain("mt-auto");
    expect(classesOf(<Heading margin="auto">x</Heading>)).toContain("m-auto");
  });

  it("works at a breakpoint, both ways", () => {
    const classes = classesOf(
      <ServerFlex marginLeft="auto" s={{ marginLeft: "0" }} m={{ marginY: "auto" }}>
        x
      </ServerFlex>,
    );
    expect(classes).toEqual(expect.arrayContaining(["ml-auto", "s-ml-0", "m-my-auto"]));
  });

  it("has a class behind every margin prop, at the base and at every breakpoint", () => {
    const css = readFileSync(
      join(__dirname, "../../../foundations/scss/styles/spacing.generated.scss"),
      "utf8",
    );
    for (const prefix of ["m", "mx", "my", "mt", "mr", "mb", "ml"]) {
      expect(css).toContain(`.${prefix}-auto {`);
      for (const bp of ["xl", "l", "m", "s", "xs"])
        expect(css).toContain(`.${bp}-${prefix}-auto {`);
    }
  });

  it("is a margin value only: padding and gap still refuse it", () => {
    // Checked by `pnpm typecheck`, which covers the test files.
    // @ts-expect-error padding has no auto
    void (<Row padding="auto">x</Row>);
    // @ts-expect-error gap has no auto
    void (<Row gap="auto">x</Row>);
  });

  it("renders a pushed-right item without axe violations", async () => {
    const { container } = render(
      <Row fillWidth vertical="center">
        <Text>Invoices</Text>
        <Text marginLeft="auto">3 due</Text>
      </Row>,
    );
    await expectNoAxeViolations(container);
  });
});

interface RevenuePoint {
  month: string;
  revenue: number;
}

describe("chart data typed with an interface", () => {
  it("is accepted by every chart, readonly arrays too", () => {
    expectTypeOf<RevenuePoint[]>().toExtend<LineChartProps["data"]>();
    expectTypeOf<readonly RevenuePoint[]>().toExtend<LineChartProps["data"]>();
    expectTypeOf<RevenuePoint[]>().toExtend<BarChartProps["data"]>();
    expectTypeOf<RevenuePoint[]>().toExtend<PieChartProps["data"]>();
    // Still rows, not bare values.
    expectTypeOf<number[]>().not.toExtend<LineChartProps["data"]>();
  });

  it("draws the same chart as the index-signature rows", () => {
    const rows: RevenuePoint[] = [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 20 },
    ];
    const { container } = render(
      <LineChart title="Revenue" height={24} series={{ key: "revenue" }} data={rows} />,
    );
    expect(screen.getByText("Revenue")).toBeTruthy();
    expect((container.firstElementChild as HTMLElement).style.height).toBe("24rem");
  });
});

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** The range state agents write: either end may be missing. */
type Range = { startDate?: Date; endDate?: Date };

describe("a DateRange value with optional ends", () => {
  it("takes {} and a start-only range, and hands both keys back", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const empty: Range = {};
    const { container, rerender } = render(
      <DateRangeInput
        id="stay"
        startLabel="Check-in"
        endLabel="Check-out"
        value={empty}
        onChange={onChange}
      />,
      { wrapper: wrap },
    );
    const start = () => screen.getByRole("combobox", { name: "Check-in" }) as HTMLInputElement;
    const end = () => screen.getByRole("combobox", { name: "Check-out" }) as HTMLInputElement;
    expect(start().value).toBe("");
    expect(end().value).toBe("");
    await expectNoAxeViolations(container);

    const startOnly: Range = { startDate: new Date(2026, 0, 5) };
    rerender(
      <DateRangeInput
        id="stay"
        startLabel="Check-in"
        endLabel="Check-out"
        value={startOnly}
        onChange={onChange}
      />,
    );
    await waitFor(() => expect(start().value).toBe("Jan 5, 2026"));
    expect(end().value).toBe("");

    await user.click(start());
    const day = await waitFor(() => {
      const button = document.querySelector<HTMLButtonElement>(
        `button[data-value="${new Date(2026, 0, 9).toISOString()}"]`,
      );
      if (!button) throw new Error("no day button");
      return button;
    });
    await user.click(day);
    const picked = onChange.mock.calls.at(-1)?.[0];
    expect(Object.keys(picked).sort()).toEqual(["endDate", "startDate"]);
  });

  it("is accepted by DateRangePicker too", () => {
    const { container } = render(<DateRangePicker value={{}} onChange={() => {}} />, {
      wrapper: wrap,
    });
    expect(container.firstElementChild).toBeTruthy();
  });
});
