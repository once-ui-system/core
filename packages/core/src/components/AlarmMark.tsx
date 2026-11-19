import classNames from "clsx";
import type React from "react";
import type { AlarmPriority } from "../hooks/useAlarms.js";
import { defaultAlarmLabels } from "../internal/alarmText.js";
import styles from "./Alarm.module.scss";

const shapes: Record<AlarmPriority, React.ReactNode> = {
  critical: (
    <polygon points="5.2,0.8 10.8,0.8 15.2,5.2 15.2,10.8 10.8,15.2 5.2,15.2 0.8,10.8 0.8,5.2" />
  ),
  high: <polygon points="8,0.6 15.6,14.8 0.4,14.8" />,
  medium: <polygon points="8,0.4 15.6,8 8,15.6 0.4,8" />,
  low: <circle cx="8" cy="8" r="7.4" />,
};

const number: Record<AlarmPriority, string> = { critical: "1", high: "2", medium: "3", low: "4" };

interface AlarmMarkProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  priority: AlarmPriority;
  /** The mark's size in px. Defaults to 16. */
  size?: number;
  /**
   * What a screen reader hears. Defaults to the priority's name (`"Critical"`);
   * pass `""` when the text beside the mark already says it.
   */
  label?: string;
}

/**
 * An alarm priority as a shape with its number in it, so it reads without its
 * colour: critical is an octagon with 1, high a triangle with 2, medium a
 * diamond with 3, low a circle with 4. The fills are fixed palette hues that
 * stay the same in dark and light themes, as alarm colours on a panel do.
 */
const AlarmMark = ({ priority, size = 16, label, className, ...rest }: AlarmMarkProps) => {
  const name = label ?? defaultAlarmLabels.priority[priority];
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={classNames(styles.mark, styles[`mark-${priority}`], className)}
      role={name ? "img" : undefined}
      aria-label={name || undefined}
      aria-hidden={name ? undefined : true}
      focusable="false"
      data-priority={priority}
      {...rest}
    >
      {shapes[priority]}
      <text x="8" y={priority === "high" ? 12.2 : 11.3} textAnchor="middle">
        {number[priority]}
      </text>
    </svg>
  );
};

AlarmMark.displayName = "AlarmMark";

export type { AlarmMarkProps };
export { AlarmMark };
