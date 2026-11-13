import { placeholderStyle } from "@/lib/placeholder";
import styles from "./haven.module.css";

/** A decorative photo placeholder drawn entirely with CSS gradients. */
export function Photo({
  id,
  shift = 0,
  label,
  small = false,
}: {
  id: string;
  shift?: number;
  label?: string;
  small?: boolean;
}) {
  return (
    <div
      className={`${styles.photo} ${small ? styles.photoSmall : ""}`}
      style={placeholderStyle(id, shift)}
      aria-hidden="true"
    >
      {label ? <span className={styles.photoLabel}>{label}</span> : null}
    </div>
  );
}
