"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

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

export function ConsumptionTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConsumptionData[]>([]);

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
          // Filtere Überträge (isBalanceForward) heraus und sortiere die Daten
          const filteredData = result.data
            .filter((entry: ConsumptionData) => !entry.isBalanceForward)
            .sort((a: ConsumptionData, b: ConsumptionData) => {
              // Sortiere nach Jahr und Monat (absteigend)
              if (a.year === b.year) {
                return (b.month || 0) - (a.month || 0);
              }
              return b.year - a.year;
            });
            
          setData(filteredData);
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

  // Monatsnamen für die Anzeige
  const getMonthName = (monthNumber?: number): string => {
    if (!monthNumber || monthNumber < 1 || monthNumber > 12) return "-";
    
    const months = [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    return months[monthNumber - 1];
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center p-4">
            <p>Lade Daten...</p>
          </div>
        ) : error ? (
          <div className="p-3 mb-4 text-white bg-red-500 rounded-md">
            <p>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Keine Verbrauchsdaten verfügbar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col className="w-[15%]" /> {/* Monat */}
                <col className="w-[10%]" /> {/* Jahr */}
                <col className="w-[19%]" /> {/* Verbrauch */}
                <col className="w-[19%]" /> {/* Preis */}
                <col className="w-[19%]" /> {/* Kosten */}
                <col className="w-[18%]" /> {/* Bezahlt */}
              </colgroup>
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left font-medium">Monat</th>
                  <th className="p-2 text-left font-medium">Jahr</th>
                  <th className="p-2 text-right font-medium">Verbrauch (kWh)</th>
                  <th className="p-2 text-right font-medium">Preis (€/kWh)</th>
                  <th className="p-2 text-right font-medium">Kosten (€)</th>
                  <th className="p-2 text-right font-medium">Bezahlt (€)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry) => (
                  <tr key={entry._id} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-left">{getMonthName(entry.month)}</td>
                    <td className="p-2 text-left">{entry.year}</td>
                    <td className="p-2 text-right font-mono">{formatNumber(entry.consumption)}</td>
                    <td className="p-2 text-right font-mono">{formatNumber(entry.price, 4)}</td>
                    <td className="p-2 text-right font-mono">{formatNumber(entry.cost)}</td>
                    <td className="p-2 text-right font-mono">{formatNumber(entry.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 