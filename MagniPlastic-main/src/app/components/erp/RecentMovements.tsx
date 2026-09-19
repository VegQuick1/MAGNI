import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { recentMovements } from "@/data/mock";
import { cn } from "@/lib/utils";

interface RecentMovementsProps {
  onClick?: () => void;
}

export function RecentMovements({ onClick }: RecentMovementsProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border p-5 shadow-card",
        onClick && "cursor-pointer hover:bg-surface-2 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-5">
        <History className="h-6 w-6 text-accent" />
        <h3 className="font-display font-bold text-xl">Movimientos recientes</h3>
      </div>
      <div className="space-y-3">
        {recentMovements.map((mov) => {
          const isIn = mov.type === "entrada";
          return (
            <div key={mov.id} className="flex items-start gap-3">
              <div className={isIn ? "text-success" : "text-info"}>
                {isIn ? (
                  <ArrowDownToLine className="h-6 w-6" />
                ) : (
                  <ArrowUpFromLine className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-lg font-bold truncate">{mov.name}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold text-base",
                      isIn ? "border-success/30 text-success bg-success/10" : "border-info/30 text-info bg-info/10"
                    )}
                  >
                    {isIn ? "+" : "-"}{mov.qty} {mov.unit}
                  </Badge>
                </div>
                <p className="text-base text-foreground mt-1 font-bold">
                  {mov.timestamp} · {mov.user}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
