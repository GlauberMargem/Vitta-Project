import { defineConfig } from "vitest/config";
import path from "node:path";

/** Só cobre `src/lib/**` por enquanto — funções puras (regras de negócio),
 * sem componentes React nem chamadas ao banco. `environment: "node"` é
 * suficiente e mais rápido que jsdom, que só seria necessário pra testar
 * componentes. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
