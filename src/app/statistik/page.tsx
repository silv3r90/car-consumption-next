"use client";

import { SiteFooter } from "@/components/site-footer";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamisches Laden der Header-Komponente, um Client/Server-Komponenten-Probleme zu vermeiden
const SiteHeader = dynamic(() => import("@/components/site-header").then(mod => mod.SiteHeader), {
  ssr: true
});

// Dynamisch laden, um SSR-Probleme mit recharts zu vermeiden
const ConsumptionChart = dynamic(
  () => import("@/components/charts/consumption-chart").then(mod => mod.ConsumptionChart),
  { ssr: false, loading: () => (
    <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Lade Diagramm...</p>
    </div>
  )}
);

const CostsPaymentsChart = dynamic(
  () => import("@/components/charts/costs-payments-chart").then(mod => mod.CostsPaymentsChart),
  { ssr: false, loading: () => (
    <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Lade Diagramm...</p>
    </div>
  )}
);

const YearlyChart = dynamic(
  () => import("@/components/charts/yearly-chart").then(mod => mod.YearlyChart),
  { ssr: false, loading: () => (
    <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Lade Diagramm...</p>
    </div>
  )}
);

export default function StatistikPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Verbrauchsstatistiken {currentYear}</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center"><p className="text-sm text-muted-foreground">Lädt...</p></div>}>
            <ConsumptionChart 
              title="Monatlicher Verbrauch" 
              dataType="consumption" 
              year={currentYear} 
            />
          </Suspense>
          
          <Suspense fallback={<div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center"><p className="text-sm text-muted-foreground">Lädt...</p></div>}>
            <CostsPaymentsChart 
              title="Kosten & Zahlungen" 
              year={currentYear} 
            />
          </Suspense>
        </div>
        
        <div className="mt-8">
          <Suspense fallback={<div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center"><p className="text-sm text-muted-foreground">Lädt...</p></div>}>
            <YearlyChart />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
} 