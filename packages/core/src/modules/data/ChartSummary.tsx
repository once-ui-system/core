import type { ReactNode } from "react";
import { VisuallyHidden } from "../../components/VisuallyHidden.js";
import { type ChartSummaryInput, chartSummaryTable } from "./utils/chartSummary.js";

/** ChartSummary's props: the chart's data and how it writes it, and an optional caption. */
export interface ChartSummaryProps extends ChartSummaryInput {
  /** The table's caption. Defaults to the title, or "Chart data". */
  caption?: ReactNode;
  id?: string;
}

/**
 * A chart's data as a table only screen readers see: the x values as rows,
 * one column per series, every value written in the chart's format and
 * locale. Every chart renders one inside its card, next to the plot, so a
 * reader who wants the numbers behind the summary can walk them cell by cell.
 * Render it yourself next to a custom visual built from the same data.
 */
const ChartSummary = ({ caption, id, ...input }: ChartSummaryProps) => {
  const { columns, rows } = chartSummaryTable(input);
  if (rows.length === 0) return null;
  return (
    <VisuallyHidden as="div" id={id}>
      <table>
        <caption>{caption ?? (input.title ? `${input.title}: data` : "Chart data")}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: two series may share a label
              <th key={index} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: x values may repeat
            <tr key={rowIndex}>
              <th scope="row">{row.x}</th>
              {row.values.map((value, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </VisuallyHidden>
  );
};

ChartSummary.displayName = "ChartSummary";

export { ChartSummary };
