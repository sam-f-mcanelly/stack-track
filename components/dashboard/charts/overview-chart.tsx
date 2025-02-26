"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

const data = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.25 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.31 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.38 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.42 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.45 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.52 },
  { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.58 },
  { name: "Aug", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.65 },
  { name: "Sep", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.71 },
  { name: "Oct", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.78 },
  { name: "Nov", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.85 },
  { name: "Dec", total: Math.floor(Math.random() * 5000) + 1000, totalBtc: 0.92 },
]

export default function OverViewChart() {
  return (
      <ChartContainer
        config={{
          usd: {
            label: "USD",
            color: "hsl(var(--usd-chart-line))",
          },
          btc: {
            label: "BTC",
            color: "hsl(var(--btc-chart-line))"
          },
        }}
        className="h-80 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              label={{ 
                value: 'USD',
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#888888' }
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              label={{ 
                value: 'BTC', // or 'BTC Value' for the right axis
                angle: -90, // 90 for right axis
                position: 'insideRight', // 'insideRight' for right axis
                style: { textAnchor: 'middle', fill: '#888888' }
              }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="total"
              stroke="var(--color-usd)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalBtc"
              stroke="var(--color-btc)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">BTC</span>
            <span className="font-bold text-sm">{payload[1].value}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">USD</span>
            <span className="font-bold text-sm">${payload[0].value}</span>
          </div>
        </div>
        <div className="mt-2 text-xs font-medium">{label}</div>
      </div>
    )
  }
}
