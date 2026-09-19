import { Card } from "@/app/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { stockAlerts } from "@/data/mock";
import { cn } from "@/lib/utils";

interface StockAlertsProps {
  onClick?: () => void;
}

export function StockAlerts({ onClick }: StockAlertsProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border p-5 shadow-card",
        onClick && "cursor-pointer hover:bg-surface-2 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="h-6 w-6 text-warning" />
        <h3 className="font-display font-bold text-xl">Alertas de stock</h3>
      </div>
      <div className="space-y-4">
        {stockAlerts.map((alert) => {
          const percentage = (alert.stock / alert.min) * 100;
          const isCritical = alert.level === "critical";

          return (
            <div key={alert.sku} className="border-l-2 border-warning pl-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold truncate">{alert.name}</p>
                  <p className="text-base text-foreground font-mono font-bold">
                    {alert.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold">
                    {alert.stock} <span className="text-base text-foreground font-bold">kg</span>
                  </p>
                  <p className={cn(
                    "text-base font-bold",
                    isCritical ? "text-destructive" : "text-warning"
                  )}>
                    Min: {alert.min}
                  </p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      isCritical
                        ? "bg-gradient-to-r from-destructive to-destructive"
                        : "bg-gradient-to-r from-warning to-warning"
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-foreground font-bold">
                  <span>0</span>
                  <span className="font-mono font-bold text-base">
                    {percentage.toFixed(0)}% del mínimo
                  </span>
                  <span>{alert.min}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
