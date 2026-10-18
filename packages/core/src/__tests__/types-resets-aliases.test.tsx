import { render as rtlRender, screen } from "@testing-library/react";
import { type ComponentProps, createRef, type FormEvent, type Ref } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { Column } from "../components/Column";
import type { DateRange } from "../components/DatePicker";
import { Flex } from "../components/Flex";
import { Form } from "../components/Form";
import { Grid } from "../components/Grid";
import { Heading } from "../components/Heading";
import { List } from "../components/List";
import { RadioButton } from "../components/RadioButton";
import { RadioGroup } from "../components/RadioGroup";
import { Row } from "../components/Row";
import { Switch } from "../components/Switch";
import { Tag } from "../components/Tag";
import { Text } from "../components/Text";
import { VisuallyHidden } from "../components/VisuallyHidden";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { BarChart } from "../modules/data/BarChart";
import type { BarChartProps } from "../modules/data/BarChart.impl";
import type { LineChart } from "../modules/data/LineChart";

/**
 * 3.0 G1, G3, G4, G5, C6. The JSX in the type tests is the test: `tsc`
 * compiles this file, and each `@ts-expect-error` fails it if the line ever
 * stops being an error.
 */

const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: LayoutProvider });

const classesOf = (html: string) =>
  (/class="([^"]*)"/.exec(html)?.[1] ?? "").split(/\s+/).filter(Boolean);

describe("G1: as is typed by the element", () => {
  it("takes the element's attributes and types the ref", () => {
    const ul = createRef<HTMLUListElement>();
    const anchor = createRef<HTMLAnchorElement>();
    const button = createRef<HTMLButtonElement>();
    const div = createRef<HTMLDivElement>();
    const elements = (
      <>
        <Flex as="a" href="/x" ref={anchor} target="_blank">
          link
        </Flex>
        <Row as="a" href="/x" gap="8">
          link
        </Row>
        <Column as="ul" ref={ul} gap="8">
          <li>item</li>
        </Column>
        <Row as="ol" start={3} reversed>
          <li>item</li>
        </Row>
        <Column
          as="form"
          noValidate
          onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
        >
          form
        </Column>
        <Row as="button" type="submit" ref={button} disabled padding="8">
          button
        </Row>
        <Grid as="ul" columns={3} ref={ul}>
          <li>a</li>
        </Grid>
        <VisuallyHidden as="a" href="#main" focusable>
          Skip to content
        </VisuallyHidden>
        <Row ref={div}>default div</Row>
        <Column
          as="a"
          href="/x"
          ref={(el) => {
            expectTypeOf(el).toEqualTypeOf<HTMLAnchorElement | null>();
          }}
        >
          callback
        </Column>
        {/* @ts-expect-error a div has no href */}
        <Flex href="/x">no href</Flex>
        {/* @ts-expect-error a ul ref is not an anchor ref */}
        <Row as="a" href="/x" ref={ul}>
          wrong ref
        </Row>
        {/* @ts-expect-error not an element */}
        <Flex as="nonsense">x</Flex>
        {/* @ts-expect-error a span has no href */}
        <VisuallyHidden href="/">x</VisuallyHidden>
      </>
    );
    expect(elements).toBeTruthy();
  });

  it("gives composite components a div's props and no untyped as", () => {
    type CardLike = ComponentProps<typeof Tag>;
    expectTypeOf<ComponentProps<typeof Flex>["ref"]>().toEqualTypeOf<
      Ref<HTMLDivElement> | undefined
    >();
    expectTypeOf<ComponentProps<typeof Column>>().toHaveProperty("onClick");
    expectTypeOf<ComponentProps<typeof Column>>().not.toHaveProperty("as");
    expectTypeOf<CardLike>().not.toHaveProperty("as");
    // Text-based components were `any` before: they now have real props.
    expectTypeOf<ComponentProps<typeof Text>>().not.toBeAny();
    expectTypeOf<ComponentProps<typeof Heading>>().toHaveProperty("textVariant");
  });

  it("renders the element as names", () => {
    const html = renderToStaticMarkup(
      <Row as="a" href="/x">
        link
      </Row>,
    );
    expect(html).toMatch(/^<a [^>]*href="\/x"/);
  });
});

describe("G4: list and button resets", () => {
  it("resets a list rendered by a layout primitive", () => {
    for (const html of [
      renderToStaticMarkup(<Column as="ul">x</Column>),
      renderToStaticMarkup(<Row as="ol">x</Row>),
      renderToStaticMarkup(<Grid as="ul">x</Grid>),
    ]) {
      expect(classesOf(html)).toContain("reset-list");
    }
    expect(classesOf(renderToStaticMarkup(<Column>x</Column>))).not.toContain("reset-list");
  });

  it("keeps List's markers", () => {
    const ul = renderToStaticMarkup(<List>x</List>);
    expect(classesOf(ul)).toEqual(expect.arrayContaining(["reset-list", "list-disc"]));
    const ol = renderToStaticMarkup(<List as="ol">x</List>);
    expect(classesOf(ol)).toContain("list-decimal");
  });

  it("resets a button and makes it type=button unless told otherwise", () => {
    const html = renderToStaticMarkup(<Row as="button">x</Row>);
    expect(classesOf(html)).toContain("reset-button");
    expect(html).toContain('type="button"');
    expect(
      renderToStaticMarkup(
        <Row as="button" type="submit">
          x
        </Row>,
      ),
    ).toContain('type="submit"');
  });
});

describe("G3: values agents reach for", () => {
  it("aligns a row on the text baseline, as a class, on any axis", () => {
    expect(classesOf(renderToStaticMarkup(<Row vertical="baseline">x</Row>))).toContain(
      "align-baseline",
    );
    // On a column `vertical` is justify-content, which has no baseline.
    expect(classesOf(renderToStaticMarkup(<Column vertical="baseline">x</Column>))).toContain(
      "align-baseline",
    );
    expect(classesOf(renderToStaticMarkup(<Row s={{ vertical: "baseline" }}>x</Row>))).toContain(
      "s-align-baseline",
    );
  });

  it("takes auto margins, as classes on the server", () => {
    const html = renderToStaticMarkup(
      <Row marginLeft="auto" marginX="auto" m={{ marginTop: "auto" }}>
        x
      </Row>,
    );
    expect(classesOf(html)).toEqual(expect.arrayContaining(["ml-auto", "mx-auto", "m-mt-auto"]));
    expect(html).not.toContain("margin-left:auto");
    expect(classesOf(renderToStaticMarkup(<Grid margin="auto">x</Grid>))).toContain("m-auto");
    // @ts-expect-error padding has no auto
    expect(<Row padding="auto">x</Row>).toBeTruthy();
  });

  it("types chart data by the caller's own row type", () => {
    interface RevenueRow {
      month: string;
      revenue: number;
      cost: number;
    }
    const rows: RevenueRow[] = [{ month: "Jan", revenue: 1, cost: 2 }];
    const ok: BarChartProps<RevenueRow> = {
      data: rows,
      series: [{ key: "revenue" }, { key: "cost" }],
    };
    expect(ok).toBeTruthy();
    const bad: BarChartProps<RevenueRow> = {
      data: rows,
      // @ts-expect-error not a key of the row
      series: { key: "revnue" },
    };
    expect(bad).toBeTruthy();
    // JSX infers the row type from `data`.
    const charts = (
      <>
        <BarChart data={rows} series={[{ key: "revenue" }, { key: "cost" }]} />
        {/* @ts-expect-error not a key of the row */}
        <BarChart data={rows} series={{ key: "revnue" }} />
      </>
    );
    expect(charts).toBeTruthy();
    // The component infers the row type from `data`.
    type LineProps = Parameters<typeof LineChart<RevenueRow>>[0];
    expectTypeOf<LineProps["data"]>().toEqualTypeOf<RevenueRow[]>();
    // With no row type, the default index-signature row still works.
    const loose: BarChartProps = { data: [{ label: "a", x: 1 }], series: { key: "x" } };
    expect(loose).toBeTruthy();
  });

  it("leaves DateRange fields optional", () => {
    const range: DateRange = {};
    const half: DateRange = { startDate: new Date() };
    // A caller's own optional-field type is assignable.
    type MyRange = { startDate?: Date; endDate?: Date };
    expectTypeOf<MyRange>().toExtend<DateRange>();
    expect([range, half]).toHaveLength(2);
  });
});

describe("G5: one name per prop", () => {
  it("shows an element in one theme with showIn", () => {
    expect(classesOf(renderToStaticMarkup(<Row showIn="dark">x</Row>))).toContain("dark-flex");
    expect(classesOf(renderToStaticMarkup(<Grid showIn="light">x</Grid>))).toContain("light-grid");
    // Logo: logo-theme-sources.test.tsx.
  });

  it("applies textVariant on Grid, which 2.x typed and dropped", () => {
    const html = renderToStaticMarkup(<Grid textVariant="label-strong-s">x</Grid>);
    expect(classesOf(html)).toEqual(
      expect.arrayContaining(["font-label", "font-strong", "font-s"]),
    );
  });

  it("keeps weight as the one piece that overrides a preset", () => {
    const swapped = renderToStaticMarkup(
      <Text textVariant="body-default-m" weight="strong">
        x
      </Text>,
    );
    expect(classesOf(swapped)).toEqual(
      expect.arrayContaining(["font-body", "font-strong", "font-m"]),
    );
    expect(classesOf(swapped)).not.toContain("font-default");
    expect(classesOf(renderToStaticMarkup(<Text weight="strong">x</Text>))).toEqual([
      "font-strong",
    ]);
    expect(classesOf(renderToStaticMarkup(<Heading weight="default">x</Heading>))).toEqual(
      expect.arrayContaining(["font-m", "font-default"]),
    );
  });

  it("drops the aliases from the types", () => {
    const removed = (
      <>
        {/* @ts-expect-error textSize is textVariant's size */}
        <Row textSize="m">x</Row>
        {/* @ts-expect-error dark is showIn="dark" */}
        <Column dark>x</Column>
        {/* @ts-expect-error size is textVariant's size */}
        <Text size="l">x</Text>
      </>
    );
    expect(removed).toBeTruthy();
  });
});

describe("C6: field chrome on checkbox, radio and switch", () => {
  it("marks the control invalid and links the message", () => {
    render(
      <>
        <Checkbox label="Terms" errorMessage="Accept the terms" />
        <Switch label="Alerts" error />
        <RadioButton label="One" value="1" errorMessage="Pick one" />
      </>,
    );
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    const message = screen.getByText("Accept the terms");
    expect(box.getAttribute("aria-describedby")).toContain(message.id);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("radio")).toHaveAttribute("aria-invalid", "true");
  });

  it("is not invalid without error or errorMessage", () => {
    render(<Checkbox label="Plain" />);
    expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-invalid");
  });

  it("takes its size from the Form, as Input does, and its own size wins", () => {
    render(
      <Form size="l">
        <Checkbox label="Large" />
        <Switch label="Small" size="s" />
      </Form>,
    );
    expect(screen.getByText("Large").className).toContain("font-l");
    expect(screen.getByText("Small").className).toContain("font-s");
  });

  it("gives RadioGroup an error message and passes its size to the radios", () => {
    render(
      <RadioGroup
        label="Plan"
        size="s"
        errorMessage="Choose a plan"
        options={[
          { value: "a", label: "Basic" },
          { value: "b", label: "Pro" },
        ]}
      />,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group.getAttribute("aria-describedby")).toContain(screen.getByText("Choose a plan").id);
    expect(screen.getByText("Basic").className).toContain("font-s");
  });
});
