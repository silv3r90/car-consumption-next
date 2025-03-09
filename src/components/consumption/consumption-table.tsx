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
            {/* Grid-basierte Tabellendarstellung */}
            <div className="w-full">
              {/* Header-Zeile */}
              <div className="grid grid-cols-6 bg-muted mb-2 font-medium">
                <div className="p-2 text-left">Monat</div>
                <div className="p-2 text-left">Jahr</div>
                <div className="p-2 text-right">Verbrauch (kWh)</div>
                <div className="p-2 text-right">Preis (€/kWh)</div>
                <div className="p-2 text-right">Kosten (€)</div>
                <div className="p-2 text-right">Bezahlt (€)</div>
              </div>
              
              {/* Datenzeilen */}
              {data.map((entry) => (
                <div key={entry._id} className="grid grid-cols-6 border-b py-1 hover:bg-muted/50">
                  <div className="p-2 text-left">{getMonthName(entry.month)}</div>
                  <div className="p-2 text-left">{entry.year}</div>
                  <div className="p-2 text-right font-mono">{formatNumber(entry.consumption)}</div>
                  <div className="p-2 text-right font-mono">{formatNumber(entry.price, 4)}</div>
                  <div className="p-2 text-right font-mono">{formatNumber(entry.cost)}</div>
                  <div className="p-2 text-right font-mono">{formatNumber(entry.paid)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 