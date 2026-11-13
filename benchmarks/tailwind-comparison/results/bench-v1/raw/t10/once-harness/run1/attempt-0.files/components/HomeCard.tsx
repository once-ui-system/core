"use client";

import Link from "next/link";
import {
  bathsLabel,
  bedsLabel,
  formatPrice,
  isNew,
  type Home,
} from "@/lib/data";
import { Photo } from "./Photo";
import { SaveButton } from "./SaveButton";
import styles from "./haven.module.css";

export function HomeCard({
  home,
  active,
  saved,
  onToggleSave,
  onHover,
}: {
  home: Home;
  active: boolean;
  saved: boolean;
  onToggleSave: () => void;
  onHover: (id: string | null) => void;
}) {
  const fresh = isNew(home);

  return (
    <li
      id={`card-${home.id}`}
      className={`${styles.card} ${active ? styles.cardActive : ""}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Photo id={home.id} label={home.type} />
      {fresh ? <span className={styles.badgeNew}>New this week</span> : null}
      <SaveButton title={home.title} saved={saved} onToggle={onToggleSave} />
      <div className={styles.cardBody}>
        <span className={styles.price}>{formatPrice(home.price)}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          <Link
            href={`/homes/${home.id}`}
            className={styles.cardLink}
            onFocus={() => onHover(home.id)}
            onBlur={() => onHover(null)}
          >
            {home.title}
          </Link>
        </h3>
        <ul className={styles.facts} aria-label="Key facts">
          <li>{bedsLabel(home.beds)}</li>
          <li>{bathsLabel(home.baths)}</li>
          <li>{home.area_m2} m²</li>
        </ul>
        <span style={{ fontSize: "0.875rem", opacity: 0.75 }}>{home.district}, Lisbon</span>
      </div>
    </li>
  );
}
