import * as React from "react"
import { 
  Bar,
  Line, 
  Pie,
  Radar,
  RadialBar,
  Scatter,
  PieChart,
  LineChart,
  BarChart,
  AreaChart,
  RadarChart,
  ScatterChart,
  RadialBarChart,
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis, 
  Cell,
  Tooltip,
  TooltipProps,
  Legend,
  Area
} from "recharts"

// Definiere die Struktur für die Chart-Konfiguration
export type ChartConfig = Record<
  string,
  {
    color: string
    label: string
  }
>

// Context für die Chart-Konfiguration
const ChartContext = React.createContext<ChartConfig | null>(null)

// Props für den Chart-Container
interface ChartContainerProps extends React.PropsWithChildren {
  config: ChartConfig
}

// Chart-Container Komponente
export function ChartContainer({
  config,
  children,
}: ChartContainerProps) {
  return (
    <div className="chart-container w-full">
      <ChartContext.Provider value={config}>
        <ResponsiveContainer width="100%" height={350}>
          {children}
        </ResponsiveContainer>
      </ChartContext.Provider>
    </div>
  )
}

// Props für den Chart-Tooltip-Inhalt
interface ChartTooltipContentProps extends Omit<TooltipProps<number, string>, "content"> {
  className?: string;
  indicator?: "line" | "dashed" | "dot";
  labelKey?: string;
  formatter?: (value: number) => string;
  showUnit?: boolean;
  unit?: string;
  colorMode?: "fill" | "border" | "both";
}

// Tooltip-Inhalt Komponente
export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "line",
  labelKey,
  formatter,
  showUnit = true,
  unit,
  colorMode = "both",
}: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext)

  if (!active || !payload || !payload.length || !config) {
    return null
  }

  // Wenn ein labelKey angegeben ist, verwenden wir das entsprechende Label aus der Konfiguration
  const tooltipTitle = labelKey && config[labelKey] ? config[labelKey].label : label

  // Funktion zum Formatieren der Werte
  const formatValue = (value: number | string | null | undefined, dataKey: string): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    // Wenn der Formatter existiert, verwende ihn
    if (formatter) {
      return formatter(typeof value === 'number' ? value : 0);
    }
    
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    
    // Wenn es kein gültiger numerischer Wert ist, gib den Originalwert zurück
    if (isNaN(numValue)) {
      return String(value);
    }

    // Standardformatierung basierend auf dem Datentyp
    if (dataKey.toLowerCase().includes('price')) {
      return `${numValue.toFixed(2)} €/kWh`;
    } else if (
      dataKey.toLowerCase().includes('cost') || 
      dataKey.toLowerCase().includes('paid') ||
      dataKey.toLowerCase().includes('balance') ||
      dataKey.toLowerCase().includes('amount')
    ) {
      return `${numValue.toFixed(2)} €`;
    } else if (dataKey.toLowerCase().includes('consumption')) {
      return `${numValue.toFixed(2)} kWh`;
    }

    // Überschreibung, wenn Unit explizit angegeben wurde
    if (showUnit && unit) {
      return `${numValue.toFixed(2)} ${unit}`;
    }

    // Fallback für unbekannte Datentypen
    return numValue.toFixed(2);
  }

  return (
    <div
      className={`rounded-lg border bg-background p-2 shadow-md ${className || ""}`}
      style={{
        animation: "fadeIn 0.2s ease-in-out",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="grid grid-flow-col items-center justify-between gap-2">
        <p className="text-sm font-medium">{tooltipTitle}</p>
        <div className="flex items-center">
          {payload.map((item: any) => (
            <div
              key={item.dataKey}
              className="ml-2 flex items-center gap-1 text-xs font-semibold"
            >
              <div
                className={`h-2 w-4 rounded-sm transition-all duration-200`}
                style={{
                  backgroundColor: colorMode !== "border" ? item.color : "transparent",
                  borderRadius: indicator === "dot" ? "50%" : indicator === "line" ? "0" : "2px",
                  borderStyle: colorMode !== "fill" ? "solid" : "none",
                  borderWidth: colorMode !== "fill" ? "1px" : "0",
                  borderColor: item.color,
                  width: indicator === "dot" ? "8px" : "16px",
                  height: indicator === "dot" ? "8px" : "8px"
                }}
              />
              <span>{config[item.dataKey]?.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5">
        {payload.map((item: any) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-3 rounded px-2 py-1 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
              <span className="text-sm">{config[item.dataKey]?.label}</span>
            </div>
            <span className="text-sm font-medium tabular-nums">
              {formatValue(item.value, item.dataKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Prop-Typen für die Legende
interface ChartLegendProps {
  className?: string
  payload?: Array<{
    dataKey: string
    color: string
    value?: any
  }>
  [key: string]: any
}

// Legende Komponente
export function ChartLegend({
  className,
  payload,
  ...props
}: ChartLegendProps) {
  const config = React.useContext(ChartContext)

  if (!config || !payload?.length) {
    return null
  }

  return (
    <div
      className={`my-2 flex flex-wrap items-center justify-center gap-8 ${className || ""}`}
      {...props}
    >
      {payload.map((item) => {
        const { dataKey } = item
        return (
          <div
            key={dataKey}
            className="flex items-center gap-1.5"
          >
            <div
              className="h-3 w-3 rounded-[1px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className="text-sm text-muted-foreground">
              {config[dataKey]?.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Tooltip Wrapper-Komponente mit korrigierter Typendefinition
export function ChartTooltip(props: Omit<React.ComponentProps<typeof Tooltip>, "content">) {
  return (
    <Tooltip 
      content={(tooltipProps: any) => <ChartTooltipContent {...tooltipProps} />}
      wrapperStyle={{ outline: 'none' }}
      cursor={{ 
        strokeDasharray: '3 3', 
        stroke: 'var(--muted)', 
        strokeWidth: 1 
      }}
      {...props} 
    />
  )
}

// Hilfsfunction zum Ermitteln der Farbe für ein Element
export function getColorForDataKey(config: ChartConfig, dataKey: string) {
  return config[dataKey]?.color || "currentColor";
}

// Exportiere alle benötigten Komponenten
export {
  Bar,
  Cell,
  Line,
  Pie,
  Area,
  Radar,
  RadialBar,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  PieChart,
  LineChart, 
  BarChart,
  AreaChart,
  RadarChart,
  ScatterChart,
  RadialBarChart,
  ComposedChart,
  ResponsiveContainer
} 