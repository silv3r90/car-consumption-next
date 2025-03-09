export function SiteFooter() {
  return (
    <footer className="py-6 border-t">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} KFZ-Stromverbrauchs-Dashboard. Alle Rechte vorbehalten.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            Datenschutz
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Impressum
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Kontakt
          </a>
        </div>
      </div>
    </footer>
  );
} 