"use client";

import { Button, Column, Form, Input, Row, Text, Textarea } from "@once-ui-system/core";
import { useState } from "react";
import styles from "./hairline.module.scss";

/**
 * Form check page — permanent regression fixture.
 *
 * Anchors the cases that a hand-assigned `corners="top" | "none" | "bottom"`
 * stack gets wrong, plus the two-dimensional and responsive cases that have no
 * hand-written answer at all. Mechanism B (the hairline lattice that Form did
 * not ship) is rendered alongside so the comparison stays checkable.
 *
 * Expected behaviour:
 * 1. Stacked 1D: one shared hairline between fields, round corners only at the
 *    top of the first and the bottom of the last.
 * 2. Toggling a field out of the middle of a stack does not leave the group
 *    ending on a square edge.
 * 3. Stacked 2D with spans: corners follow the occupied region, including a
 *    ragged last row.
 * 4. Responsive columns: the corner set changes with the breakpoint, from CSS,
 *    with no re-render.
 * 5. A focused field paints its ring above all four neighbours, unclipped.
 */

const FOCUS_FIELDS = Array.from({ length: 9 }, (_, i) => `f${i}`);

const CASES = [
  { id: "first", placeholder: "First name" },
  { id: "last", placeholder: "Last name" },
];

export default function FormCheck() {
  const [showMiddle, setShowMiddle] = useState(true);

  return (
    <Column fillWidth gap="40" padding="24" maxWidth="l" data-testid="root">
      <Text variant="heading-strong-l">Form — density and grouping</Text>

      {/* 1. The motivating case: a plain stack. */}
      <Column gap="12" data-testid="case-stacked-1d">
        <Text variant="label-strong-s">1. density=&quot;stacked&quot;, one column</Text>
        <Form density="stacked">
          <Input id="s1" placeholder="Email" />
          <Input id="s2" placeholder="Password" type="password" />
          <Input id="s3" placeholder="Workspace" />
        </Form>
      </Column>

      {/* 2. The bug the component exists to remove: hide the middle field and
          the group must still end on a round edge. */}
      <Column gap="12" data-testid="case-conditional">
        <Text variant="label-strong-s">
          2. Conditional child — the group keeps its outer corners
        </Text>
        <Button
          size="s"
          variant="secondary"
          onClick={() => setShowMiddle((v) => !v)}
          data-testid="toggle-middle"
        >
          {showMiddle ? "Hide" : "Show"} middle field
        </Button>
        <Form density="stacked">
          <Input id="c1" placeholder="Street" />
          {showMiddle && <Input id="c2" placeholder="Apartment" />}
          <Input id="c3" placeholder="City" />
        </Form>
      </Column>

      {/* 3. The brief's example: two columns with spans. */}
      <Column gap="12" data-testid="case-stacked-2d">
        <Text variant="label-strong-s">3. density=&quot;stacked&quot;, columns=2, with spans</Text>
        <Form density="stacked" columns={2}>
          <Input id="g1" placeholder="First name" />
          <Input id="g2" placeholder="Last name" />
          <Input id="g3" placeholder="Email" span={2} />
          <Textarea id="g4" placeholder="Note" span={2} />
        </Form>
      </Column>

      {/* 4. Ragged last row — three cells in two columns. The second field's
          bottom-right is on the outside of the group even though it is not the
          last child. */}
      <Column gap="12" data-testid="case-ragged">
        <Text variant="label-strong-s">4. Ragged last row — 3 fields, 2 columns</Text>
        <Form density="stacked" columns={2}>
          <Input id="r1" placeholder="City" />
          <Input id="r2" placeholder="Postcode" />
          <Input id="r3" placeholder="Country" />
        </Form>
      </Column>

      {/* 5. Responsive: one column below `m`, two above. The cell that is
          bottom-left changes with the viewport, from CSS alone. */}
      <Column gap="12" data-testid="case-responsive">
        <Text variant="label-strong-s">
          5. columns=&#123;&#123; xs: 1, m: 2 &#125;&#125; — resize across 1024px
        </Text>
        <Form density="stacked" columns={{ xs: 1, m: 2 }}>
          <Input id="b1" placeholder="First name" />
          <Input id="b2" placeholder="Last name" />
          <Input id="b3" placeholder="Email" span={2} />
        </Form>
      </Column>

      {/* 6. Focus ring over four neighbours. */}
      <Column gap="12" data-testid="case-focus">
        <Text variant="label-strong-s">6. Focus ring in 2D — click the centre field</Text>
        <Form density="stacked" columns={3}>
          {FOCUS_FIELDS.map((id, i) => (
            <Input key={id} id={id} placeholder={`Field ${i + 1}`} focusRing />
          ))}
        </Form>
      </Column>

      {/* 7. The non-fusing densities, for contrast. */}
      <Row fillWidth gap="24" s={{ direction: "column" }}>
        <Column gap="12" fillWidth data-testid="case-tight">
          <Text variant="label-strong-s">7a. density=&quot;tight&quot;</Text>
          <Form density="tight">
            {CASES.map((c) => (
              <Input key={c.id} id={`t-${c.id}`} placeholder={c.placeholder} />
            ))}
          </Form>
        </Column>
        <Column gap="12" fillWidth data-testid="case-spacious">
          <Text variant="label-strong-s">7b. density=&quot;spacious&quot;</Text>
          <Form density="spacious">
            {CASES.map((c) => (
              <Input key={c.id} id={`sp-${c.id}`} placeholder={c.placeholder} />
            ))}
          </Form>
        </Column>
      </Row>

      {/* 7c. size, set once for the whole group. */}
      <Column gap="12" data-testid="case-size">
        <Text variant="label-strong-s">7c. size on the Form, and a field overriding it</Text>
        <Form density="stacked" columns={2} size="s">
          <Input id="sz1" placeholder="Small" />
          <Input id="sz2" placeholder="Small" />
          <Input id="sz3" placeholder="This one sets size=xl" size="xl" span={2} />
          <Textarea id="sz4" placeholder="Small textarea" span={2} />
        </Form>
      </Column>

      {/* 8. Mechanism B, hand-rolled, for the written comparison. */}
      <Column gap="12" data-testid="case-hairline">
        <Text variant="label-strong-s">
          8. Mechanism B prototype — 1px gap, container paints the line
        </Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Fields ghosted so the container owns the line. Compare the field fill against case 3: the
          cell has to restore an opaque backdrop, because a 15%-alpha field composites against the
          line colour otherwise.
        </Text>
        <div className={`${styles.lattice} ${styles.twoCol}`} data-testid="hairline-grid">
          <div className={styles.cell}>
            <Input id="h1" placeholder="First name" variant="ghost" />
          </div>
          <div className={styles.cell}>
            <Input id="h2" placeholder="Last name" variant="ghost" />
          </div>
          <div className={`${styles.cell} ${styles.span2}`}>
            <Input id="h3" placeholder="Email" variant="ghost" />
          </div>
        </div>
      </Column>

      {/* 9. Mechanism B without ghosting — shows the tint the brief warned
          about, and the doubled border. */}
      <Column gap="12" data-testid="case-hairline-untreated">
        <Text variant="label-strong-s">
          9. Mechanism B without ghosting — the tint and the doubled border
        </Text>
        <div className={`${styles.lattice} ${styles.twoCol}`} data-testid="hairline-untreated">
          <div className={styles.cell}>
            <Input id="u1" placeholder="First name" />
          </div>
          <div className={styles.cell}>
            <Input id="u2" placeholder="Last name" />
          </div>
        </div>
      </Column>
    </Column>
  );
}
