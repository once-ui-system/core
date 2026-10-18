/** One node of an SVG tree, as core's icon data writes it. */
export interface IconNode {
  tag: string;
  attr: Record<string, string | number | undefined>;
  child: IconNode[];
}
