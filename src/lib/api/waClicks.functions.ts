import { createServerFn } from "@tanstack/react-start";

export const getWaClickSummary = createServerFn({ method: "GET" }).handler(
  async () => {
    const { buildWaClickSummary } = await import("../waClicks.server");
    return await buildWaClickSummary();
  },
);
