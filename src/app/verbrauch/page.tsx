"use client";

import { SiteFooter } from "@/components/site-footer";
import { ConsumptionForm } from "@/components/consumption/consumption-form";
import { ConsumptionTable } from "@/components/consumption/consumption-table";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LockIcon } from "lucide-react";

// Dynamisches Laden der Header-Komponente, um Client/Server-Komponenten-Probleme zu vermeiden
const SiteHeader = dynamic(() => import("@/components/site-header").then(mod => mod.SiteHeader), {
  ssr: true
});

export default function VerbrauchPage() {
  const { data: session, status } = useSession();
  const isAdmin = status === "authenticated";
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Verbrauchsdaten</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {isAdmin ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Neue Messung hinzufügen</h2>
              <ConsumptionForm />
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Neue Messung hinzufügen</h2>
              <Alert className="bg-muted">
                <LockIcon className="h-4 w-4" />
                <AlertTitle>Eingeschränkter Zugriff</AlertTitle>
                <AlertDescription>
                  Sie müssen als Administrator angemeldet sein, um neue Messungen hinzuzufügen.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div>
            <h2 className="mb-4 text-xl font-semibold">Verbrauchshistorie</h2>
            <ConsumptionTable />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
} 