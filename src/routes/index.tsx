import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

import { Benefits } from "@/components/Benefits";
import { HowItWorks } from "@/components/HowItWorks";
import { ARPreview } from "@/components/ARPreview";
import { ProductsMatrix } from "@/components/ProductsMatrix";
import { Footer } from "@/components/Footer";
import { ChatbotPanel } from "@/components/chatbot/ChatbotPanel";
import { parseQrParams } from "@/lib/qrParams";
import { track } from "@/lib/tracker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Heroican · Diagnóstico nutricional para tu perro" },
      {
        name: "description",
        content:
          "Escanea el QR del empaque Heroican y recibe una recomendación nutricional para tu perro en menos de 60 segundos.",
      },
      { property: "og:title", content: "Heroican · Diagnóstico nutricional para tu perro" },
      {
        property: "og:description",
        content: "Escanea el QR del empaque Heroican y recibe una recomendación nutricional para tu perro en menos de 60 segundos.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const qrParams = useMemo(() => {
    if (typeof window === "undefined") return {};
    return parseQrParams(window.location.search);
  }, []);

  useEffect(() => {
    track("qr_landing_loaded", qrParams);
  }, [qrParams]);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero qrParams={qrParams} />
      
      <Benefits />
      <HowItWorks />
      <ARPreview qrParams={qrParams} />

      <ProductsMatrix />
      <Footer />
      <ChatbotPanel qrParams={qrParams} />
    </main>
  );
}
