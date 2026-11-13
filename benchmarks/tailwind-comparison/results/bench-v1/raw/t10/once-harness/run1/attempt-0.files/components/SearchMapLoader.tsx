"use client";

import dynamic from "next/dynamic";
import styles from "./haven.module.css";

const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapFallback} role="status">
      Loading map…
    </div>
  ),
});

export default SearchMap;
