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
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  getColorForDataKey
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

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

interface CostsPaymentsChartProps {
  title: string;
  year?: number;
  className?: string;
}

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export function CostsPaymentsChart({ title, year, className }: CostsPaymentsChartProps) {
  const currentYear = year || new Date().getFullYear();
  const [chartData, setChartData] = useState<Array<{
    month: string;
    Kosten: number;
    Zahlungen: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<{
    percentage: number;
    isUp: boolean;
  } | null>(null);

  const chartConfig = {
    finances: {
      label: "Finanzen",
      color: "hsl(var(--primary))",
    },
    Kosten: {
      label: `Kosten ${currentYear}`,
      color: "hsl(var(--chart-1))",
    },
    Zahlungen: {
      label: `Zahlungen ${currentYear}`,
      color: "hsl(var(--chart-2))",
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
          
          // Filtere reguläre Einträge des angegebenen Jahres
          const yearData = allData.filter(
            entry => !entry.isBalanceForward && entry.year === currentYear && entry.month !== undefined
          );
          
          // Erzeuge ein Array mit allen 12 Monaten
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const monthNumber = i + 1;
            const entry = yearData.find(d => d.month === monthNumber);
            
            return {
              month: MONTHS[i].slice(0, 3),
              Kosten: entry?.cost || 0,
              Zahlungen: entry?.paid || 0
            };
          });
          
          setChartData(monthlyData);
          
          // Berechne Trend
          const completedMonths = yearData.filter(entry => entry.month && entry.month <= new Date().getMonth() + 1);
          if (completedMonths.length >= 2) {
            const thisMonth = completedMonths[completedMonths.length - 1];
            const lastMonth = completedMonths[completedMonths.length - 2];
            
            if (thisMonth && lastMonth && thisMonth.cost && lastMonth.cost) {
              const diff = thisMonth.cost - lastMonth.cost;
              const percentage = (diff / lastMonth.cost) * 100;
              setTrend({
                percentage: Math.abs(percentage),
                isUp: diff > 0
              });
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
  }, [currentYear]);

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Monatliche Kosten und Zahlungen {currentYear}</CardDescription>
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
          <CardDescription>Monatliche Kosten und Zahlungen {currentYear}</CardDescription>
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
  const kostenColor = chartConfig.Kosten.color;
  const zahlungenColor = chartConfig.Zahlungen.color;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Monatliche Kosten und Zahlungen {currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `${value} €`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip 
              cursor={false}
              content={<ChartTooltipContent labelKey="finances" indicator="dashed" />}
              defaultIndex={1}
            />
            <Bar dataKey="Kosten" fill={kostenColor} radius={[0, 0, 4, 4]} />
            <Bar dataKey="Zahlungen" fill={zahlungenColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {trend && (
        <div className="px-6 pb-4 flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {trend.isUp ? (
              <>
                Kosten um {trend.percentage.toFixed(1)}% gestiegen 
                <TrendingUp className="h-4 w-4 text-destructive" />
              </>
            ) : (
              <>
                Kosten um {trend.percentage.toFixed(1)}% gesunken 
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </>
            )}
          </div>
          <div className="leading-none text-muted-foreground pt-1">
            Vergleich zum Vormonat
          </div>
        </div>
      )}
    </Card>
  );
} 