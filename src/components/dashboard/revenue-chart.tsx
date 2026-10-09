"use client"

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: { date: string; amount: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Aggregate data by date (mock logic for demo)
  const chartData = [
    { date: 'Oct 1', amount: 12000 },
    { date: 'Oct 2', amount: 15000 },
    { date: 'Oct 3', amount: 8000 },
    { date: 'Oct 4', amount: 22000 },
    { date: 'Oct 5', amount: 18000 },
    { date: 'Oct 6', amount: 25000 },
    { date: 'Oct 7', amount: 32000 },
    { date: 'Oct 8', amount: data.reduce((acc, curr) => acc + curr.amount, 0) || 45000 },
  ]

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0E9F6E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0E9F6E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            tickFormatter={(value) => `₦${(value / 1000)}k`}
            dx={-10}
          />
          <RechartsTooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#0E9F6E" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
