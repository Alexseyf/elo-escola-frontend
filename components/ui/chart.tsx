"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
]
const NEUTRAL_COLOR = "#525252"

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex justify-center text-xs w-full overflow-x-auto min-w-0",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-default-tooltip]:border-border [&_.recharts-default-tooltip]:bg-background [&_.recharts-default-tooltip]:shadow-md [&_.recharts-dot[name=active]_.recharts-dot]:stroke-current [&_.recharts-layer]:outline-none [&_.recharts-pie-sector[data-active=true]]:opacity-80 [&_.recharts-reference-line]:stroke-border [&_.recharts-surface]:overflow-visible",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer minWidth={0} minHeight={0}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || typeof config.color === "string"
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: [
          `#${id} {`,
          colorConfig
            .map(([key, itemConfig]) => {
              const color =
                itemConfig.color ||
                itemConfig.theme?.light ||
                itemConfig.theme?.dark

              return color ? `--color-${key}: ${color};` : null
            })
            .join("\n"),
          "}",
          `#${id} [data-color] {`,
          colorConfig
            .map(([key]) => `--color-${key}: var(--color-${key});`)
            .join("\n"),
          "}",
        ]
          .filter(Boolean)
          .join("\n"),
      }}
    />
  )
}

const ChartLegend = RechartsPrimitive.Legend

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[]
    label?: string
    indicator?: "dot" | "line"
  }
>(({ active, payload, label, className, indicator = "dot", ...props }, ref) => {
  const { config } = useChart()

  if (!active || !payload || payload.length === 0) {
    return null
  }
  const validHtmlProps = new Set([
    "id", "className", "style", "title", "data", "aria", "role",
    "tabIndex", "onClick", "onMouseEnter", "onMouseLeave", "onFocus", "onBlur",
    "onKeyDown", "onKeyUp", "onMouseMove", "onMouseOut", "onMouseOver",
    "onTouchStart", "onTouchEnd", "onTouchMove"
  ])

  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => {
      return validHtmlProps.has(key) || key.startsWith("data") || key.startsWith("aria")
    })
  )

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-sm shadow-xl",
        className
      )}
      {...filteredProps}
    >
      {label && <div className="text-muted-foreground">{label}</div>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((item: any, index: number) => {
        const key = `${item.dataKey}`
        const itemConfig = config[key as keyof typeof config]
        const value =
          typeof item.value === "string" ? item.value : item.value?.toFixed(2)

        return (
          <div
            key={`${item.dataKey}-${index}`}
            className="flex w-full flex-wrap items-center gap-2 pt-1.5 first:pt-0"
          >
            {indicator === "dot" ? (
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            ) : (
              <div className="mr-2 h-4 w-1 shrink-0 bg-[--color-bg]" />
            )}
            <div className="flex flex-1 justify-between gap-8">
              <span className="text-muted-foreground">{itemConfig?.label}</span>
              {value && <span className="font-mono font-medium">{value}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartBar = RechartsPrimitive.Bar
const ChartLine = RechartsPrimitive.Line
const ChartPie = RechartsPrimitive.Pie
const ChartArea = RechartsPrimitive.Area
const ChartRadar = RechartsPrimitive.Radar
const ChartRadarChart = RechartsPrimitive.RadarChart
const ChartLineChart = RechartsPrimitive.LineChart
const ChartBarChart = RechartsPrimitive.BarChart
const ChartPieChart = RechartsPrimitive.PieChart
const ChartAreaChart = RechartsPrimitive.AreaChart
const ChartXAxis = RechartsPrimitive.XAxis
const ChartYAxis = RechartsPrimitive.YAxis
const ChartCartesianGrid = RechartsPrimitive.CartesianGrid
const ChartCell = RechartsPrimitive.Cell
const ChartResponsiveContainer = RechartsPrimitive.ResponsiveContainer

export {
  ChartContainer,
  ChartStyle,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartArea,
  ChartRadar,
  ChartRadarChart,
  ChartLineChart,
  ChartBarChart,
  ChartPieChart,
  ChartAreaChart,
  ChartXAxis,
  ChartYAxis,
  ChartCartesianGrid,
  ChartCell,
  ChartResponsiveContainer,
  COLORS,
  NEUTRAL_COLOR,
}
export type { ChartConfig }
