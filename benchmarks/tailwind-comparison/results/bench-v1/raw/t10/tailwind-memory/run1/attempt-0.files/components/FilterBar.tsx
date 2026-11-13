"use client";

export type Filters = {
  type: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  sort: string;
};

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  minPrice: "",
  maxPrice: "",
  minBeds: "0",
  sort: "newest",
};

const PRICE_STEPS = [
  200000, 300000, 400000, 500000, 600000, 800000, 1000000, 1500000,
];

const eurShort = (n: number) =>
  n >= 1_000_000 ? `€${n / 1_000_000}M` : `€${n / 1000}k`;

const selectCls =
  "h-10 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-stone-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <form
      role="search"
      aria-label="Filter homes"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      <Field label="Type" htmlFor="f-type">
        <select
          id="f-type"
          className={selectCls}
          value={filters.type}
          onChange={(e) => set({ type: e.target.value })}
        >
          <option value="any">Any type</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Studio">Studio</option>
        </select>
      </Field>
      <Field label="Min price" htmlFor="f-min">
        <select
          id="f-min"
          className={selectCls}
          value={filters.minPrice}
          onChange={(e) => set({ minPrice: e.target.value })}
        >
          <option value="">No min</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              {eurShort(p)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Max price" htmlFor="f-max">
        <select
          id="f-max"
          className={selectCls}
          value={filters.maxPrice}
          onChange={(e) => set({ maxPrice: e.target.value })}
        >
          <option value="">No max</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              {eurShort(p)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Bedrooms" htmlFor="f-beds">
        <select
          id="f-beds"
          className={selectCls}
          value={filters.minBeds}
          onChange={(e) => set({ minBeds: e.target.value })}
        >
          <option value="0">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </Field>
      <Field label="Sort by" htmlFor="f-sort">
        <select
          id="f-sort"
          className={selectCls}
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="size-desc">Size: largest first</option>
          <option value="size-asc">Size: smallest first</option>
        </select>
      </Field>
      <div className="flex items-end">
        <button
          type="button"
          onClick={onReset}
          className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700"
        >
          Reset filters
        </button>
      </div>
    </form>
  );
}
