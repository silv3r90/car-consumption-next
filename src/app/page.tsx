import { Dashboard } from "@/components/dashboard/dashboard";
import { SiteFooter } from "@/components/site-footer";
import dynamic from "next/dynamic";

// Dynamisches Laden der Header-Komponente, um Client/Server-Komponenten-Probleme zu vermeiden
const SiteHeader = dynamic(() => import("@/components/site-header").then(mod => mod.SiteHeader), {
  ssr: true
});

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Dashboard />
      </main>
      <SiteFooter />
    </div>
  );
}