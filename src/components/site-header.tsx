"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleAuth = () => {
    if (status === "authenticated") {
      signOut({ redirect: false })
        .then(() => {
          toast.success("Erfolgreich abgemeldet");
          router.refresh();
        })
        .catch(() => {
          toast.error("Fehler bei der Abmeldung");
        });
    } else {
      router.push("/login");
    }
  };
  
  const handleNavigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex items-center h-16 space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              KFZ-Stromverbrauch
            </span>
          </Link>
          
          {/* Desktop-Navigation */}
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/verbrauch"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Verbrauchsdaten
            </Link>
            <Link
              href="/statistik"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Statistiken
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center justify-end flex-1 space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            {status === "authenticated" && (
              <span className="hidden text-sm mr-2 md:inline-block">
                Angemeldet als <strong>{session?.user?.name || "Admin"}</strong>
              </span>
            )}
            <Button variant="outline" onClick={handleAuth}>
              {status === "authenticated" ? "Abmelden" : "Anmelden"}
            </Button>
            
            {/* Mobiles Burger-Menü */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-0">
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-bold">Menü</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Menü schließen</span>
                    </Button>
                  </div>
                  
                  <nav className="flex flex-col gap-4">
                    <div 
                      className="flex items-center text-base font-medium transition-colors hover:text-primary cursor-pointer"
                      onClick={() => handleNavigate("/")}
                    >
                      Dashboard
                    </div>
                    <div 
                      className="flex items-center text-base font-medium transition-colors hover:text-primary cursor-pointer"
                      onClick={() => handleNavigate("/verbrauch")}
                    >
                      Verbrauchsdaten
                    </div>
                    <div 
                      className="flex items-center text-base font-medium transition-colors hover:text-primary cursor-pointer"
                      onClick={() => handleNavigate("/statistik")}
                    >
                      Statistiken
                    </div>
                  </nav>
                  
                  <div className="mt-auto">
                    {status === "authenticated" && (
                      <div className="mb-4 text-sm">
                        Angemeldet als <strong>{session?.user?.name || "Admin"}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
} 