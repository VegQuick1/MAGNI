import { Card } from "@/app/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  trend?: "up" | "down";
  hint?: string;
  icon?: React.ReactNode;
  positiveOnDown?: boolean;
  onClick?: () => void;
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  trend,
  hint,
  icon,
  positiveOnDown = false,
  onClick,
}: KpiCardProps) {
  const isPositive = positiveOnDown ? trend === "down" : trend === "up";

  return (
    <Card
      className={cn(
        "bg-card border-border p-5",
        onClick && "cursor-pointer hover:bg-surface-2 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-base uppercase tracking-wider text-foreground font-bold">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="stat-number text-4xl md:text-5xl font-bold">
              {value}
            </p>
            {unit && (
              <span className="text-xl text-foreground font-mono font-bold">
                {unit}
              </span>
            )}
          </div>
          {delta && (
            <div className="flex items-center gap-2 mt-3">
              {trend === "up" ? (
                <ArrowUp className={cn("h-5 w-5", isPositive ? "text-success" : "text-destructive")} />
              ) : (
                <ArrowDown className={cn("h-5 w-5", isPositive ? "text-success" : "text-destructive")} />
              )}
              <span className={cn("text-base font-bold", isPositive ? "text-success" : "text-destructive")}>
                {delta}
              </span>
              {hint && (
                <span className="text-base text-foreground font-bold">· {hint}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-accent">{icon}</div>
        )}
      </div>
    </Card>
  );
}
