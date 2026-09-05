export function MotivacaoCard({ message }: { message: string }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <p className="text-sm text-foreground">{message}</p>
    </section>
  );
}
