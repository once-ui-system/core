export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description ? (
        <p className="text-[0.8125rem] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
