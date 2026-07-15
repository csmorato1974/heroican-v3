import heroicanLogo from "@/assets/heroican-logo-v2.png.asset.json";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <a href="/" aria-label="Heroican" className="flex items-center">
          <img
            src={heroicanLogo.url}
            alt="Heroican"
            className="h-10 w-auto select-none"
            loading="eager"
          />
        </a>
        <a
          href="https://wa.me/51942799091"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center text-xs font-semibold italic text-accent hover:text-primary transition-colors"
        >
          Alimenta tu lealtad
        </a>
      </div>
    </header>
  );
}
