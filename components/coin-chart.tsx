"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const generateDummyData = (length: number) => {
  const data = []
  let lastPrice = 100 + Math.random() * 100
  for (let i = 0; i < length; i++) {
    lastPrice = lastPrice + (Math.random() - 0.5) * 10
    data.push({
      time: i,
      price: lastPrice,
    })
  }
  return data
}

export function CoinChart({ coinSymbol }: { coinSymbol: string }) {
  const data = generateDummyData(24)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

