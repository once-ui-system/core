export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="font-serif text-xl font-semibold">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
