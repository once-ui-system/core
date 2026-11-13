"use client";

import {
  DEFAULT_FILTERS,
  type Filters,
  type HomeType,
  type SortKey,
} from "@/lib/data";
import styles from "./haven.module.css";

const TYPE_OPTIONS: { value: Filters["type"]; label: string }[] = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const MIN_PRICES = [0, 200000, 300000, 400000, 500000, 750000, 1000000];
const MAX_PRICES = [0, 300000, 400000, 500000, 750000, 1000000, 1500000];

const BED_OPTIONS = [0, 1, 2, 3, 4];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function isDefault(f: Filters) {
  return (
    f.type === DEFAULT_FILTERS.type &&
    f.minPrice === DEFAULT_FILTERS.minPrice &&
    f.maxPrice === DEFAULT_FILTERS.maxPrice &&
    f.minBeds === DEFAULT_FILTERS.minBeds &&
    f.sort === DEFAULT_FILTERS.sort
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <form
      className={styles.filterBar}
      role="search"
      aria-label="Filter homes"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-type">
          Type
        </label>
        <select
          id="f-type"
          className={styles.select}
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value as "any" | HomeType })}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-min">
          Min price
        </label>
        <select
          id="f-min"
          className={styles.select}
          value={filters.minPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              minPrice: v,
              maxPrice: v !== 0 && filters.maxPrice !== 0 && filters.maxPrice < v ? 0 : filters.maxPrice,
            });
          }}
        >
          {MIN_PRICES.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? "No min" : eur.format(p)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-max">
          Max price
        </label>
        <select
          id="f-max"
          className={styles.select}
          value={filters.maxPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              maxPrice: v,
              minPrice: v !== 0 && filters.minPrice > v ? 0 : filters.minPrice,
            });
          }}
        >
          {MAX_PRICES.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? "No max" : eur.format(p)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-beds">
          Bedrooms
        </label>
        <select
          id="f-beds"
          className={styles.select}
          value={filters.minBeds}
          onChange={(e) => onChange({ ...filters, minBeds: Number(e.target.value) })}
        >
          {BED_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b === 0 ? "Any" : `${b}+ beds`}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-sort">
          Sort by
        </label>
        <select
          id="f-sort"
          className={styles.select}
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {!isDefault(filters) ? (
        <button type="button" className={styles.resetBtn} onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset filters
        </button>
      ) : null}
    </form>
  );
}
