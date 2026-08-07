import { createServerFn } from "@tanstack/react-start";

export const getAiUsageSummary = createServerFn({ method: "GET" }).handler(
  async () => {
    const { buildAiUsageSummary } = await import("../aiUsageSummary.server");
    return await buildAiUsageSummary();
  },
);
