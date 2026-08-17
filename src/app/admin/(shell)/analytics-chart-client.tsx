"use client";

import { useTheme } from "@/components/theme-provider";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface ChartData {
  date: string;
  views: number;
  unique: number;
}

export function AnalyticsChartClient({ data }: { data: ChartData[] }) {
  const { theme } = useTheme();

  return (
    <div className="h-[250px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="currentColor" className="text-primary" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="currentColor" className="text-primary" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            cursor={{ stroke: theme === 'dark' ? '#555' : '#ccc', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: theme === 'dark' ? '#09090b' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              padding: '12px 16px'
            }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Total Kunjungan"
            stroke="currentColor"
            fillOpacity={1}
            fill="url(#colorViews)"
            className="text-primary"
            strokeWidth={3}
            activeDot={{ r: 6, strokeWidth: 0, fill: "currentColor" }}
          />
          <Area
            type="monotone"
            dataKey="unique"
            name="Pengunjung Unik"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorUnique)"
            strokeWidth={3}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
