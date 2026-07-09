import logoAsset from "@/assets/heroican-logo-footer.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-background">
      <span className="gold-rule" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 py-14 grid gap-10 sm:grid-cols-3 text-sm">
        <div>
          <img src={logoAsset.url} alt="HEROICAN" className="h-12 w-auto" />
          <p className="mt-4 italic text-foreground/70 max-w-xs">
            Alimenta tu lealtad. Nutrición premium hecha en Tacna, con el cariño que tu compañero merece.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-display text-xs uppercase tracking-wider text-accent">
            Contacto
          </p>
          <a
            href="https://wa.me/59161212107"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-foreground hover:text-primary"
          >
            WhatsApp · +591 6121 2107
          </a>
          <a
            href="mailto:ventas@heroican.com"
            className="block text-foreground hover:text-primary"
          >
            ventas@heroican.com
          </a>
          <p className="text-foreground/60">Pocollay, Tacna · Perú</p>
        </div>
        <div className="space-y-2">
          <p className="font-display text-xs uppercase tracking-wider text-accent">
            Legal
          </p>
          <a className="block text-foreground/70 hover:text-primary" href="#">
            Privacidad
          </a>
          <a className="block text-foreground/70 hover:text-primary" href="#">
            Términos
          </a>
          <a className="block text-foreground/70 hover:text-primary" href="#">
            Libro de reclamaciones
          </a>
        </div>
      </div>
      <p className="text-center text-xs italic text-foreground/50 pb-8 px-4">
        Hecho con cariño en Tacna, Perú. Esta orientación es informativa y no reemplaza la evaluación de un veterinario.
      </p>
    </footer>
  );
}
