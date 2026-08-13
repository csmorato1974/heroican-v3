import { createServerFn } from "@tanstack/react-start";

export const getChatbotMessagesSummary = createServerFn({ method: "GET" }).handler(
  async () => {
    const { buildChatbotMessagesSummary } = await import("../chatbotMessages.server");
    return await buildChatbotMessagesSummary();
  },
);
