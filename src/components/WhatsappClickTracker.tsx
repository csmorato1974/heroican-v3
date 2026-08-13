import { useEffect } from "react";
import { trackWhatsappClick } from "@/lib/waTracking";

const WA_HOSTS = /(^|\.)((wa\.me)|(whatsapp\.com)|(api\.whatsapp\.com))$/i;

function isWhatsappHref(href: string): boolean {
  if (href.startsWith("whatsapp:")) return true;
  try {
    return WA_HOSTS.test(new URL(href, window.location.href).hostname);
  } catch {
    return false;
  }
}

/** Escucha global: registra cualquier clic en enlaces a WhatsApp sin alterar la navegación. */
export function WhatsappClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!isWhatsappHref(href)) return;
      const place =
        anchor.dataset["waPlace"] ??
        anchor.closest("[data-wa-section]")?.getAttribute("data-wa-section") ??
        undefined;
      trackWhatsappClick(place);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
