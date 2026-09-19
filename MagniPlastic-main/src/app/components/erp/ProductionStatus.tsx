import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Factory } from "lucide-react";
import { productionLines } from "@/data/mock";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  running: { bg: "bg-success/15", text: "text-success", label: "Operando" },
  idle: { bg: "bg-secondary", text: "text-foreground", label: "Detenida" },
  maintenance: { bg: "bg-warning/15", text: "text-warning", label: "Mantenimiento" },
};

interface ProductionStatusProps {
  onClick?: () => void;
}

export function ProductionStatus({ onClick }: ProductionStatusProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border p-5 shadow-card",
        onClick && "cursor-pointer hover:bg-surface-2 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-5">
        <Factory className="h-6 w-6 text-accent" />
        <h3 className="font-display font-bold text-xl">Estado de líneas</h3>
      </div>
      <div className="space-y-4">
        {productionLines.map((line) => {
          const status = statusStyles[line.status];
          const progress = line.target > 0 ? (line.output / line.target) * 100 : 0;

          return (
            <div key={line.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base text-foreground font-bold">
                    {line.id}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("border", status.bg, status.text, "text-sm font-bold")}
                  >
                    {status.label}
                  </Badge>
                </div>
                {line.status === "running" && (
                  <span className="text-base text-foreground font-bold">
                    OEE: <span className="font-mono font-bold text-foreground text-lg">{line.oee}%</span>
                  </span>
                )}
              </div>
              {line.status === "running" && (
                <>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-between text-base">
                    <span className="text-foreground font-bold">{line.operator}</span>
                    <span className="font-mono font-bold text-lg">
                      {line.output} / {line.target} <span className="text-foreground font-bold text-base">pzas</span>
                    </span>
                  </div>
                </>
              )}
              {line.status !== "running" && (
                <p className="text-base text-foreground font-bold italic">
                  {line.operator}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
