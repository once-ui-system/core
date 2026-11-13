export default function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
    </div>
  );
}
