"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  getColorForDataKey
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

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

interface YearlyData {
  year: number;
  totalConsumption: number;
  totalPaid: number;
  totalCost: number;
  averagePrice: number;
  balanceForward: number;
  count?: number;
  name?: string;
  balance?: number;
}

interface YearlyChartProps {
  className?: string;
}

export function YearlyChart({ className }: YearlyChartProps) {
  const [chartData, setChartData] = useState<YearlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<{
    percentage: number;
    isUp: boolean;
    type: 'consumption' | 'cost';
  } | null>(null);

  const chartConfig = {
    summary: {
      label: "Jahresübersicht",
      color: "hsl(var(--primary))",
    },
    totalConsumption: {
      label: "Verbrauch (kWh)",
      color: "hsl(var(--chart-2))",
    },
    totalCost: {
      label: "Kosten (€)",
      color: "hsl(var(--chart-1))",
    },
    totalPaid: {
      label: "Zahlungen (€)",
      color: "hsl(var(--chart-3))",
    }
  } satisfies ChartConfig;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api/consumption");
        
        if (!response.ok) {
          throw new Error(`HTTP Fehler: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const allData = result.data as ConsumptionData[];
          
          // Daten nach Jahren gruppieren
          const yearlyData: Record<number, YearlyData> = {};
          
          // Erst die regulären Einträge verarbeiten
          allData.filter(entry => !entry.isBalanceForward).forEach(entry => {
            if (!yearlyData[entry.year]) {
              yearlyData[entry.year] = {
                year: entry.year,
                name: entry.year.toString(),
                totalConsumption: 0,
                totalPaid: 0,
                totalCost: 0,
                averagePrice: 0,
                balanceForward: 0,
                count: 0,
              };
            }
            
            yearlyData[entry.year].totalConsumption += entry.consumption || 0;
            yearlyData[entry.year].totalPaid += entry.paid || 0;
            yearlyData[entry.year].totalCost += entry.cost || 0;
            
            if (entry.price) {
              yearlyData[entry.year].averagePrice += entry.price;
              yearlyData[entry.year].count = (yearlyData[entry.year].count || 0) + 1;
            }
          });
          
          // Überträge hinzufügen
          allData.filter(entry => entry.isBalanceForward).forEach(entry => {
            if (yearlyData[entry.year]) {
              yearlyData[entry.year].balanceForward = entry.amount || 0;
            } else {
              yearlyData[entry.year] = {
                year: entry.year,
                name: entry.year.toString(),
                totalConsumption: 0,
                totalPaid: 0,
                totalCost: 0,
                averagePrice: 0,
                balanceForward: entry.amount || 0,
                count: 0,
              };
            }
          });
          
          // Durchschnittspreis berechnen
          Object.values(yearlyData).forEach(data => {
            if (data.count && data.count > 0) {
              data.averagePrice = data.averagePrice / data.count;
            }
          });
          
          // In Array umwandeln und nach Jahr sortieren
          const sortedYears = Object.values(yearlyData).sort((a, b) => a.year - b.year);
          
          // Balance berechnen
          sortedYears.forEach(data => {
            data.balance = data.balanceForward + data.totalPaid - data.totalCost;
          });
          
          setChartData(sortedYears);
          
          // Berechne Trend
          if (sortedYears.length >= 2) {
            const thisYear = sortedYears[sortedYears.length - 1];
            const lastYear = sortedYears[sortedYears.length - 2];
            
            // Trend für Verbrauch
            if (thisYear.totalConsumption && lastYear.totalConsumption) {
              const diff = thisYear.totalConsumption - lastYear.totalConsumption;
              const percentage = (diff / lastYear.totalConsumption) * 100;
              
              if (Math.abs(percentage) > 5) {
                setTrend({
                  percentage: Math.abs(percentage),
                  isUp: diff > 0,
                  type: 'consumption'
                });
              }
            }
            
            // Wenn kein Verbrauchstrend gefunden, prüfe Kosten-Trend
            if (!trend && thisYear.totalCost && lastYear.totalCost) {
              const diff = thisYear.totalCost - lastYear.totalCost;
              const percentage = (diff / lastYear.totalCost) * 100;
              
              if (Math.abs(percentage) > 10) {
                setTrend({
                  percentage: Math.abs(percentage),
                  isUp: diff > 0,
                  type: 'cost'
                });
              }
            }
          }
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

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Jährliche Zusammenfassung</CardTitle>
          <CardDescription>Vergleich der jährlichen Verbrauchsdaten und Kosten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Lade Daten...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Jährliche Zusammenfassung</CardTitle>
          <CardDescription>Vergleich der jährlichen Verbrauchsdaten und Kosten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] bg-destructive/10 rounded-md flex items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Die Farben aus der Konfiguration extrahieren
  const consumptionColor = chartConfig.totalConsumption.color;
  const costColor = chartConfig.totalCost.color;
  const paidColor = chartConfig.totalPaid.color;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Jährliche Zusammenfassung</CardTitle>
        <CardDescription>Vergleich der jährlichen Verbrauchsdaten und Kosten</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tickFormatter={(value) => `${value} kWh`}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value} €`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ opacity: 0.15 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                
                // Gruppiere die Daten in Kategorien
                const consumptionData = payload.find(p => p.dataKey === 'totalConsumption');
                const financialData = payload.filter(p => 
                  p.dataKey === 'totalCost' || 
                  p.dataKey === 'totalPaid'
                );
                
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md" 
                       style={{ backdropFilter: "blur(2px)" }}>
                    <p className="text-sm font-semibold mb-2">Jahresübersicht {label}</p>
                    
                    {/* Verbrauchsdaten */}
                    {consumptionData && (
                      <>
                        <div className="mb-2 text-xs font-medium text-muted-foreground">Verbrauch</div>
                        <div className="flex items-center justify-between gap-4 rounded px-1.5 py-1 hover:bg-muted/50 transition-colors mb-3">
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: consumptionData.color }}
                            />
                            <span className="text-sm">Stromverbrauch</span>
                          </div>
                          <span className="text-sm font-medium tabular-nums">
                            {typeof consumptionData.value === 'number' 
                              ? consumptionData.value.toFixed(2) 
                              : consumptionData.value} kWh
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Finanzdaten */}
                    {financialData.length > 0 && (
                      <>
                        <div className="mb-2 text-xs font-medium text-muted-foreground">Finanzen</div>
                        <div className="space-y-1.5">
                          {financialData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 rounded px-1.5 py-1 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm">
                                  {item.dataKey === 'totalCost' ? 'Gesamtkosten' : 'Zahlungen'}
                                </span>
                              </div>
                              <span className="text-sm font-medium tabular-nums">
                                {typeof item.value === 'number' 
                                  ? item.value.toFixed(2) 
                                  : item.value} €
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              }}
            />
            <Bar 
              yAxisId="left"
              dataKey="totalConsumption" 
              fill={consumptionColor} 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right"
              dataKey="totalCost" 
              fill={costColor}
              radius={[0, 0, 0, 0]} 
            />
            <Bar 
              yAxisId="right"
              dataKey="totalPaid" 
              fill={paidColor}
              radius={[0, 0, 4, 4]} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm px-6 pb-4">
        {trend && (
          <div className="flex gap-2 font-medium leading-none">
            <Activity className="h-4 w-4" />
            {trend.type === 'consumption' ? 'Stromverbrauch' : 'Stromkosten'} 
            {trend.isUp ? (
              <span className="flex items-center gap-1">
                um {trend.percentage.toFixed(1)}% gestiegen
                <TrendingUp className="h-4 w-4 text-destructive" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                um {trend.percentage.toFixed(1)}% gesunken
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </span>
            )}
            im Vergleich zum Vorjahr
          </div>
        )}
        {chartData.length > 0 && (
          <div className="leading-none text-muted-foreground pt-1">
            Datenzeitraum: {chartData[0].year} bis {chartData[chartData.length - 1].year}
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 