export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-8 text-sm text-muted">
        This screen is a Phase 1 placeholder. Real data and the decision engine
        will be added after you confirm the foundation is running.
      </div>
    </section>
  );
}
