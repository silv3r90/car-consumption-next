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
  className?: string
  indicator?: "line" | "dashed"
  labelKey?: string
}

// Tooltip-Inhalt Komponente
export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "line",
  labelKey,
}: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext)

  if (!active || !payload || !payload.length || !config) {
    return null
  }

  // Wenn ein labelKey angegeben ist, verwenden wir das entsprechende Label aus der Konfiguration
  const tooltipTitle = labelKey && config[labelKey] ? config[labelKey].label : label

  return (
    <div
      className={`rounded-lg border bg-background p-2 shadow-sm ${className || ""}`}
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
                className="h-1 w-4"
                style={{
                  backgroundColor: item.color,
                  borderRadius: indicator === "line" ? "0" : "1px",
                  borderStyle: indicator === "dashed" ? "dashed" : "solid",
                  borderWidth: indicator === "dashed" ? "1px" : "0",
                  borderColor: item.color
                }}
              />
              <span>{config[item.dataKey]?.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 grid grid-flow-col justify-start gap-3">
        {payload.map((item: any) => (
          <div
            key={item.dataKey}
            className="flex items-center gap-1 text-sm font-bold"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span>{typeof item.value === 'number' ? item.value.toFixed(2) : item.value}</span>
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

// Tooltip Wrapper-Komponente
export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip 
      content={<ChartTooltipContent />}
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