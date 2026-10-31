"use client";

import dynamic from "next/dynamic";

// Recharts é pesado pro carregamento inicial (achado no levantamento de
// performance de 30/10/2026) — carrega só no cliente, sob demanda.
// `ssr: false` só é permitido dentro de um Client Component, por isso esse
// wrapper separado em vez de chamar dynamic() direto nas páginas (Server
// Components).
export const GlicemiaChartCard = dynamic(
  () =>
    import("./GlicemiaChartCard").then((mod) => mod.GlicemiaChartCard),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-card shadow-sm" />
    ),
  }
);
