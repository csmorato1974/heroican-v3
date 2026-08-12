import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const EventSchema = z.object({
  session_id: z.string().min(1).max(64),
  event_type: z.enum(["started", "success", "failed", "whatsapp_clicked"]),
  detected_animal: z.string().max(64).optional().nullable(),
  size_guess: z.string().max(32).optional().nullable(),
  recommended_focus: z.string().max(32).optional().nullable(),
  fallback_used: z.boolean().optional().nullable(),
  error_type: z.string().max(64).optional().nullable(),
  source: z.string().max(64).optional().nullable(),
  campaign: z.string().max(64).optional().nullable(),
});

export const Route = createFileRoute("/api/public/pet-event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.json();
          const parsed = EventSchema.safeParse(raw);
          if (!parsed.success) {
            return new Response(null, { status: 204 });
          }
          const { supabaseAdmin } = await import(
            "@/integrations/heroican/client.server"
          );
          const { error } = await supabaseAdmin
            .from("pet_analysis_events")
            .insert(parsed.data);
          if (error) {
            console.error("[pet-event] insert failed", error);
          }
        } catch (err) {
          console.error("[pet-event] handler error", err);
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
