export function AlertaTendenciaCard({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <p className="text-sm text-foreground">{message}</p>
    </section>
  );
}
