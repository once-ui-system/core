"use client";

import styles from "./haven.module.css";

export function SaveButton({
  title,
  saved,
  onToggle,
  inline = false,
}: {
  title: string;
  saved: boolean;
  onToggle: () => void;
  inline?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.saveBtn} ${saved ? styles.saveBtnOn : ""} ${inline ? styles.saveBtnInline : ""}`}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove from saved" : "Save"}: ${title}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.3 3 4.5 6.6 4.5c2 0 3.7 1.1 5.4 3.2 1.7-2.1 3.4-3.2 5.4-3.2 3.6 0 5.8 3.8 4.2 7.3C19.5 16.4 12 21 12 21z" />
      </svg>
      {inline ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
