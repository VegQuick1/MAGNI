import { Card } from "@/app/components/ui/card";
import { TrendingUp } from "lucide-react";
import { salesData } from "@/data/mock";
import { cn } from "@/lib/utils";

interface SalesSparkChartProps {
  onClick?: () => void;
}

export function SalesSparkChart({ onClick }: SalesSparkChartProps) {
  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const maxValue = Math.max(...salesData.map(d => d.value));
  const minValue = 0;

  const xStep = (width - padding.left - padding.right) / (salesData.length - 1);
  const yScale = (height - padding.top - padding.bottom) / (maxValue - minValue);

  const points = salesData.map((d, i) => ({
    x: padding.left + i * xStep,
    y: height - padding.bottom - (d.value - minValue) * yScale
  }));

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Path for gradient fill area
  const areaPathD = `M ${padding.left} ${height - padding.bottom} L ${pathD.substring(2)} L ${padding.left + xStep * (salesData.length - 1)} ${height - padding.bottom} Z`;

  return (
    <Card
      className={cn(
        "bg-card border-border p-5 shadow-card",
        onClick && "cursor-pointer hover:bg-surface-2 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-6 w-6 text-info" />
        <h3 className="font-display font-bold text-xl">Ventas últimos 6 meses</h3>
        <span className="text-base text-foreground ml-auto font-bold">MXN (Millones)</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
            <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2}/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={padding.top + i * ((height - padding.top - padding.bottom) / 4)}
            x2={width - padding.right}
            y2={padding.top + i * ((height - padding.top - padding.bottom) / 4)}
            stroke="hsl(var(--border))"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            opacity={0.5}
          />
        ))}

        {/* X-axis labels */}
        {salesData.map((d, i) => (
          <text
            key={`label-${i}`}
            x={padding.left + i * xStep}
            y={height - 10}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="16"
            fontWeight="800"
          >
            {d.month}
          </text>
        ))}

        {/* Area gradient fill */}
        <path
          d={areaPathD}
          fill="url(#areaGradient)"
        />

        {/* Line with shadow */}
        <path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="12"
            fill="hsl(var(--card))"
            stroke="#3b82f6"
            strokeWidth="6"
            filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))"
          />
        ))}
      </svg>
    </Card>
  );
}
