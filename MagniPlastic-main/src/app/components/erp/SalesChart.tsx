import { TrendingUp } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesData = [
  { month: "Ene", ventas: 2.8 },
  { month: "Feb", ventas: 3.2 },
  { month: "Mar", ventas: 4.1 },
  { month: "Abr", ventas: 3.6 },
  { month: "May", ventas: 4.5 },
  { month: "Jun", ventas: 5.2 },
];

export function SalesChart() {
  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: "#2563eb" }} />
          <h3 className="text-lg font-bold">Ventas últimos 6 meses</h3>
        </div>
        <p className="text-sm font-bold text-foreground">MXN (Millones)</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            style={{ fontSize: '14px', fontWeight: 'bold' }}
            tickLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            labelStyle={{ color: '#2563eb', fontWeight: 'bold' }}
            formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Ventas']}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#colorVentas)"
            dot={{
              fill: '#0f172a',
              stroke: '#2563eb',
              strokeWidth: 3,
              r: 6,
            }}
            activeDot={{
              fill: '#2563eb',
              stroke: '#0f172a',
              strokeWidth: 3,
              r: 8,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
