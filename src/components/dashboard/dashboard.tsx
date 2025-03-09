"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ConsumptionData {
  _id: string;
  month?: number;
  year: number;
  price?: number;
  consumption?: number;
  cost?: number;
  paid?: number;
  isBalanceForward?: boolean;
  amount?: number;
}

// Sortieroptionen
type SortField = "month" | "consumption" | "price" | "cost" | "paid" | "saldo";
type SortDirection = "asc" | "desc";

// Funktion zur Umwandlung von Monatszahlen in deutsche Monatsnamen
const getMonthName = (monthNumber?: number): string => {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) return "-";
  
  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  
  return months[monthNumber - 1];
};

export function Dashboard() {
  const { data: session, status } = useSession();
  const isAdmin = status === "authenticated";
  const router = useRouter();
  
  // Sortierzustand
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({
    field: "month",
    direction: "desc" // Standardmäßig absteigend sortiert (neueste zuerst)
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    totalVerbrauch: number;
    durchschnittlicherVerbrauch: number;
    verbrauchshistorie: ConsumptionData[];
    balanceForward: number;
    totalPaid: number;
    totalCost: number;
    currentYear: number;
    currentBalance: number;
  }>({
    totalVerbrauch: 0,
    durchschnittlicherVerbrauch: 0,
    verbrauchshistorie: [],
    balanceForward: 0,
    totalPaid: 0,
    totalCost: 0,
    currentYear: new Date().getFullYear(),
    currentBalance: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/consumption');
        
        if (!response.ok) {
          throw new Error(`HTTP Fehler: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const allData = result.data as ConsumptionData[];
          const currentYear = new Date().getFullYear();
          
          // Manuelle Berechnung, die genau der Tabelle folgt
          
          // Überträge extrahieren
          const uebertrag2023 = allData.find(entry => entry.isBalanceForward && entry.year === 2023)?.amount || 0;
          const uebertrag2024 = allData.find(entry => entry.isBalanceForward && entry.year === 2024)?.amount || 0;
          
          // Einträge für 2025 filtern
          const entries2025 = allData.filter(
            entry => !entry.isBalanceForward && entry.year === 2025
          ).sort((a, b) => (a.month || 0) - (b.month || 0));
          
          // Berechne den aktuellen Kontostand nach der Formel:
          // Übertrag 2024 + (Summe aller Zahlungen 2025 - Summe aller Kosten 2025)
          const paid2025 = entries2025.reduce((sum, entry) => sum + (entry.paid || 0), 0);
          const cost2025 = entries2025.reduce((sum, entry) => sum + (entry.cost || 0), 0);
          
          // Kontostand berechnen
          const calculatedCurrentBalance = parseFloat((uebertrag2024 + paid2025 - cost2025).toFixed(2));
          
          console.log("Übertrag 2024:", uebertrag2024);
          console.log("Zahlungen 2025:", paid2025);
          console.log("Kosten 2025:", cost2025);
          console.log("Berechneter Kontostand:", calculatedCurrentBalance);
          
          // Für das Dashboard nur Einträge des aktuellen Jahres filtern
          const currentYearEntries = allData.filter(
            entry => !entry.isBalanceForward && entry.year === currentYear
          );
          
          // Berechne die Statistiken des aktuellen Jahres für das Dashboard
          const totalConsumption = currentYearEntries.reduce(
            (sum, entry) => sum + (entry.consumption || 0), 
            0
          );
          
          const avgConsumption = currentYearEntries.length > 0 
            ? totalConsumption / currentYearEntries.length 
            : 0;

          const totalCost = currentYearEntries.reduce(
            (sum, entry) => sum + (entry.cost || 0),
            0
          );

          const totalPaid = currentYearEntries.reduce(
            (sum, entry) => sum + (entry.paid || 0),
            0
          );
          
          // Für 2025 nutzen wir den Übertrag von 2024 als Startwert
          const balanceForward = currentYear === 2025 ? uebertrag2024 : 0;

          setData({
            totalVerbrauch: parseFloat(totalConsumption.toFixed(2)),
            durchschnittlicherVerbrauch: parseFloat(avgConsumption.toFixed(2)),
            verbrauchshistorie: currentYearEntries.sort((a, b) => (b.month || 0) - (a.month || 0)),
            balanceForward,
            totalPaid,
            totalCost,
            currentYear,
            currentBalance: calculatedCurrentBalance,
          });
        }
      } catch (err) {
        console.error("Fehler beim Abrufen der Daten:", err);
        setError("Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Hilfsfunktion zum sicheren Formatieren von Zahlen
  const formatNumber = (value: any, decimals: number = 2): string => {
    if (value === undefined || value === null) return '0.00';
    if (typeof value === 'number') return value.toFixed(decimals);
    return '0.00';
  };

  const handleAddMeasurement = () => {
    router.push("/verbrauch");
  };
  
  // Sortierungsfunktion
  const handleSort = (field: SortField) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.field === field) {
        // Wenn bereits nach diesem Feld sortiert wird, Richtung umkehren
        return {
          field,
          direction: prevConfig.direction === "asc" ? "desc" : "asc"
        };
      } else {
        // Sonst nach diesem Feld mit Standardrichtung sortieren
        return {
          field,
          direction: field === "month" ? "desc" : "asc" // Bei Monaten standardmäßig absteigend
        };
      }
    });
  };
  
  // Sortierte Daten basierend auf der aktuellen Konfiguration
  const sortedData = [...data.verbrauchshistorie].sort((a, b) => {
    let comparison = 0;
    
    switch (sortConfig.field) {
      case "month":
        comparison = ((a.month || 0) - (b.month || 0));
        break;
      case "consumption":
        comparison = ((a.consumption || 0) - (b.consumption || 0));
        break;
      case "price":
        comparison = ((a.price || 0) - (b.price || 0));
        break;
      case "cost":
        comparison = ((a.cost || 0) - (b.cost || 0));
        break;
      case "paid":
        comparison = ((a.paid || 0) - (b.paid || 0));
        break;
      case "saldo":
        const saldoA = (a.paid || 0) - (a.cost || 0);
        const saldoB = (b.paid || 0) - (b.cost || 0);
        comparison = (saldoA - saldoB);
        break;
    }
    
    // Umkehren, wenn die Richtung absteigend ist
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
  
  // Rendering der Sortierungssymbole
  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    
    return sortConfig.direction === "asc" 
      ? <ChevronUp className="inline-block ml-1 h-4 w-4" /> 
      : <ChevronDown className="inline-block ml-1 h-4 w-4" />;
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">KFZ-Stromverbrauchs-Dashboard {data.currentYear}</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p className="text-lg">Lade Daten...</p>
        </div>
      ) : error ? (
        <div className="p-4 mb-6 text-center text-white bg-red-500 rounded-md">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Gesamtverbrauch {data.currentYear}</CardTitle>
                <CardDescription>Gesamter Stromverbrauch des Fahrzeugs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{data.totalVerbrauch} kWh</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Durchschnittlicher Verbrauch</CardTitle>
                <CardDescription>Durchschnittlicher monatlicher Verbrauch</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{data.durchschnittlicherVerbrauch} kWh</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Aktueller Kontostand</CardTitle>
                <CardDescription>Übertrag + Zahlungen - Kosten</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-4xl font-bold ${data.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(data.currentBalance)} €
                </p>
                <div className="mt-2 text-sm">
                  <p>Übertrag: {formatNumber(data.balanceForward)} €</p>
                  <p>Zahlungen: {formatNumber(data.totalPaid)} €</p>
                  <p>Kosten: {formatNumber(data.totalCost)} €</p>
                </div>
                {isAdmin && (
                  <Button onClick={handleAddMeasurement} className="w-full mt-4">
                    Neue Messung hinzufügen
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Verbrauchshistorie {data.currentYear}</CardTitle>
                <CardDescription>Monatliche Verbrauchseinträge</CardDescription>
              </CardHeader>
              <CardContent>
                {data.verbrauchshistorie.length === 0 ? (
                  <p className="text-center text-gray-500">Keine Daten verfügbar</p>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Grid-basierte Tabellendarstellung */}
                    <div className="w-full">
                      {/* Header-Zeile */}
                      <div className="grid grid-cols-6 bg-muted mb-2">
                        <div className="p-2 text-left">
                          <button 
                            onClick={() => handleSort("month")}
                            className="flex items-center font-semibold hover:text-primary"
                          >
                            Monat {renderSortIcon("month")}
                          </button>
                        </div>
                        <div className="p-2 text-right">
                          <button 
                            onClick={() => handleSort("consumption")}
                            className="flex items-center justify-end w-full font-semibold hover:text-primary"
                          >
                            Verbrauch (kWh) {renderSortIcon("consumption")}
                          </button>
                        </div>
                        <div className="p-2 text-right">
                          <button 
                            onClick={() => handleSort("price")}
                            className="flex items-center justify-end w-full font-semibold hover:text-primary"
                          >
                            Preis (€/kWh) {renderSortIcon("price")}
                          </button>
                        </div>
                        <div className="p-2 text-right">
                          <button 
                            onClick={() => handleSort("cost")}
                            className="flex items-center justify-end w-full font-semibold hover:text-primary"
                          >
                            Kosten (€) {renderSortIcon("cost")}
                          </button>
                        </div>
                        <div className="p-2 text-right">
                          <button 
                            onClick={() => handleSort("paid")}
                            className="flex items-center justify-end w-full font-semibold hover:text-primary"
                          >
                            Bezahlt (€) {renderSortIcon("paid")}
                          </button>
                        </div>
                        <div className="p-2 text-right">
                          <button 
                            onClick={() => handleSort("saldo")}
                            className="flex items-center justify-end w-full font-semibold hover:text-primary"
                          >
                            Saldo (€) {renderSortIcon("saldo")}
                          </button>
                        </div>
                      </div>
                      
                      {/* Datenzeilen */}
                      {sortedData.map((entry) => {
                        const monatsSaldo = (entry.paid || 0) - (entry.cost || 0);
                        return (
                          <div key={entry._id} className="grid grid-cols-6 border-b py-1 hover:bg-muted/50">
                            <div className="p-2 text-left">{getMonthName(entry.month)}</div>
                            <div className="p-2 text-right font-mono">{formatNumber(entry.consumption)}</div>
                            <div className="p-2 text-right font-mono">{formatNumber(entry.price, 4)}</div>
                            <div className="p-2 text-right font-mono">{formatNumber(entry.cost)}</div>
                            <div className="p-2 text-right font-mono">{formatNumber(entry.paid)}</div>
                            <div className={`p-2 text-right font-mono ${monatsSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatNumber(monatsSaldo)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 