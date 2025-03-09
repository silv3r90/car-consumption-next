"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
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
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

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

interface ConsumptionChartProps {
  title: string;
  dataType: "consumption" | "price" | "cost" | "paid";
  year?: number;
  className?: string;
}

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

// Beschreibungen für verschiedene Datentypen
const descriptions = {
  consumption: "Monatlicher Stromverbrauch in Kilowattstunden",
  price: "Strompreis pro Kilowattstunde",
  cost: "Monatliche Stromkosten in Euro",
  paid: "Monatliche Zahlungen in Euro"
};

// Einheiten für verschiedene Datentypen
const units = {
  consumption: "kWh",
  price: "€/kWh",
  cost: "€",
  paid: "€"
};

export function ConsumptionChart({ title, dataType, year, className }: ConsumptionChartProps) {
  const currentYear = year || new Date().getFullYear();
  const [chartData, setChartData] = useState<Array<{
    month: string;
    value: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<{
    percentage: number;
    isUp: boolean;
  } | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  
  const chartConfig = {
    metrics: {
      label: "Verbrauchsmetriken",
      color: "hsl(var(--primary))",
    },
    value: {
      label: title,
      color: getColorForDataType(dataType),
    }
  } satisfies ChartConfig;

  function getColorForDataType(type: string): string {
    switch (type) {
      case "consumption": return "hsl(var(--chart-2))";
      case "price": return "hsl(var(--chart-3))";
      case "cost": return "hsl(var(--chart-1))";
      case "paid": return "hsl(var(--chart-4))";
      default: return "hsl(var(--primary))";
    }
  }

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
          
          // Filtere reguläre Einträge des angegebenen Jahres
          const yearData = allData.filter(
            entry => !entry.isBalanceForward && entry.year === currentYear && entry.month !== undefined
          );
          
          // Erzeuge ein Array mit allen 12 Monaten
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const monthNumber = i + 1;
            const entry = yearData.find(d => d.month === monthNumber);
            
            let value = 0;
            switch (dataType) {
              case "consumption":
                value = entry?.consumption || 0;
                break;
              case "price":
                value = entry?.price || 0;
                break;
              case "cost":
                value = entry?.cost || 0;
                break;
              case "paid":
                value = entry?.paid || 0;
                break;
            }
            
            return {
              month: MONTHS[i].slice(0, 3),
              value
            };
          });
          
          setChartData(monthlyData);
          
          // Berechne Trend
          const completedMonths = yearData.filter(entry => entry.month && entry.month <= new Date().getMonth() + 1);
          if (completedMonths.length >= 2) {
            const thisMonth = completedMonths[completedMonths.length - 1];
            const lastMonth = completedMonths[completedMonths.length - 2];
            
            let currentValue = 0;
            let previousValue = 0;
            
            switch (dataType) {
              case "consumption":
                currentValue = thisMonth.consumption || 0;
                previousValue = lastMonth.consumption || 0;
                break;
              case "price":
                currentValue = thisMonth.price || 0;
                previousValue = lastMonth.price || 0;
                break;
              case "cost":
                currentValue = thisMonth.cost || 0;
                previousValue = lastMonth.cost || 0;
                break;
              case "paid":
                currentValue = thisMonth.paid || 0;
                previousValue = lastMonth.paid || 0;
                break;
            }
            
            if (currentValue && previousValue) {
              const diff = currentValue - previousValue;
              const percentage = (diff / previousValue) * 100;
              setTrend({
                percentage: Math.abs(percentage),
                isUp: diff > 0
              });
            }
          }
          
          // Berechne Durchschnitt
          if (completedMonths.length > 0) {
            let sum = 0;
            switch (dataType) {
              case "consumption":
                sum = completedMonths.reduce((acc, curr) => acc + (curr.consumption || 0), 0);
                break;
              case "price":
                sum = completedMonths.reduce((acc, curr) => acc + (curr.price || 0), 0);
                break;
              case "cost":
                sum = completedMonths.reduce((acc, curr) => acc + (curr.cost || 0), 0);
                break;
              case "paid":
                sum = completedMonths.reduce((acc, curr) => acc + (curr.paid || 0), 0);
                break;
            }
            
            setAverage(sum / completedMonths.length);
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
  }, [dataType, currentYear]);

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{descriptions[dataType]}</CardDescription>
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
          <CardTitle>{title}</CardTitle>
          <CardDescription>{descriptions[dataType]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] bg-destructive/10 rounded-md flex items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Die Farbe aus der Konfiguration extrahieren
  const valueColor = chartConfig.value.color;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{descriptions[dataType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={10}
            />
            <YAxis 
              tickFormatter={(value) => {
                switch (dataType) {
                  case "consumption": return `${value} kWh`;
                  case "price": return `${value} €/kWh`;
                  default: return `${value} €`;
                }
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ stroke: 'var(--muted)', strokeDasharray: '3 3', strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                
                // Bestimme die richtige Einheit
                let unit = '';
                switch (dataType) {
                  case "consumption": unit = " kWh"; break;
                  case "price": unit = " €/kWh"; break;
                  default: unit = " €"; break;
                }
                
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md"
                       style={{ backdropFilter: "blur(2px)" }}>
                    <p className="text-sm font-medium mb-2">{label} {currentYear}</p>
                    <div className="space-y-1.5">
                      {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 rounded px-1.5 py-1 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{title}</span>
                          </div>
                          <span className="text-sm font-medium tabular-nums">
                            {item.value.toFixed(2)}{unit}
                          </span>
                        </div>
                      ))}
                      {average !== null && (
                        <div className="mt-2 pt-2 border-t flex items-center justify-between gap-4 px-1.5">
                          <span className="text-sm text-muted-foreground">Ø Durchschnitt:</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {average.toFixed(2)}{unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={chartConfig.value.color} 
              strokeWidth={2.5}
              dot={{ strokeWidth: 2, r: 4, fill: 'var(--background)' }}
              activeDot={{ strokeWidth: 2, r: 6, fill: 'var(--background)' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm px-6 pb-4">
        {trend && (
          <div className="flex gap-2 font-medium leading-none">
            {trend.isUp ? (
              <>
                Um {trend.percentage.toFixed(1)}% gestiegen 
                <TrendingUp className="h-4 w-4 text-destructive" />
              </>
            ) : (
              <>
                Um {trend.percentage.toFixed(1)}% gesunken 
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </>
            )}
          </div>
        )}
        {average !== null && (
          <div className="flex gap-2 items-center leading-none text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Durchschnitt: {average.toFixed(2)} {units[dataType]}
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 