import { Dashboard } from "@/components/dashboard/dashboard";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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