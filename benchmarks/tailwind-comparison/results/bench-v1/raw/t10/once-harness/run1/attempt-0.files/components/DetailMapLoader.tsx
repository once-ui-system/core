"use client";

import dynamic from "next/dynamic";
import styles from "./haven.module.css";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapFallback} role="status">
      Loading map…
    </div>
  ),
});

export default DetailMap;
