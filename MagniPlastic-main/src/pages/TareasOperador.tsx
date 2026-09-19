import { useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Factory, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchTareasOperador, actualizarTareaOperadorApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  status: "pending" | "in_progress" | "completed";
  machine: string;
  product: string;
  target: number;
  current: number;
  priority: "low" | "medium" | "high";
}

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-secondary text-foreground border-border" },
  in_progress: { label: "En Progreso", color: "bg-info/10 text-info border-info" },
  completed: { label: "Completada", color: "bg-success/10 text-success border-success" },
};

const priorityConfig = {
  low: { label: "Baja", color: "bg-secondary text-foreground" },
  medium: { label: "Media", color: "bg-warning/10 text-warning" },
  high: { label: "Alta", color: "bg-destructive/10 text-destructive" },
};

export default function TareasOperador() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = async () => {
    try {
      const data = await fetchTareasOperador();
      if (data && data.length > 0) {
        setTasks(data);
      }
    } catch (err) {
      console.log("Error al cargar tareas de la BD", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;

  const handleStartTask = async (taskId: string) => {
    try {
      await actualizarTareaOperadorApi(taskId, { status: "in_progress" });
      await loadTasks();
      toast({ title: "Producción iniciada", description: `La orden ${taskId} pasó a En Progreso.` });
    } catch (error) {
      console.error("Error al iniciar tarea:", error);
      toast({ title: "Error", description: "No se pudo actualizar la tarea en la BD.", variant: "destructive" });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const targetVal = task ? task.target : 0;

    try {
      await actualizarTareaOperadorApi(taskId, { status: "completed", current: targetVal });
      await loadTasks();
      toast({ title: "Lote finalizado", description: `La orden ${taskId} se marcó como completada.` });
    } catch (error) {
      console.error("Error al completar tarea:", error);
      toast({ title: "Error", description: "No se pudo actualizar la tarea en la BD.", variant: "destructive" });
    }
  };

  const handleReportIssue = (taskId: string) => {
    toast({ title: "Reporte de incidencia", description: `Registrando falla/merma para orden ${taskId}`, variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Órdenes de Producción - Turno Matutino (MySQL)"
          description="Gestiona tus tareas de producción del día sincronizadas con base de datos"
        />

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-foreground font-bold">Progreso del Turno</p>
              <p className="text-2xl font-bold" style={{ color: "#6366F1" }}>
                {completedCount} de {totalCount} tareas
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Cards */}
        <div className="lg:col-span-2 space-y-4">
          {tasks.map((task) => {
            const progress = task.target > 0 ? (task.current / task.target) * 100 : 0;

            return (
              <Card
                key={task.id}
                className={cn(
                  "bg-card border-2 p-6 shadow-card transition-all hover:shadow-lg",
                  task.status === "in_progress" && "border-info"
                )}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Factory className="h-8 w-8" style={{ color: "#6366F1" }} />
                      <div>
                        <p className="text-sm text-foreground font-bold">Orden #{task.id}</p>
                        <h3 className="text-xl font-bold">{task.machine}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={cn("font-bold text-sm", statusConfig[task.status]?.color)}>
                        {statusConfig[task.status]?.label || task.status}
                      </Badge>
                      <Badge variant="outline" className={cn("font-bold text-sm", priorityConfig[task.priority]?.color)}>
                        Prioridad {priorityConfig[task.priority]?.label || task.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="bg-surface-2 p-4 rounded-lg">
                    <p className="text-sm text-foreground font-bold mb-1">Producto a Fabricar</p>
                    <p className="text-lg font-bold">{task.product}</p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-bold">Meta de Producción</span>
                      <span className="text-lg font-bold" style={{ color: "#6366F1" }}>
                        {task.current} / {task.target} piezas
                      </span>
                    </div>
                    <div className="h-5 bg-surface-2 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: task.status === "completed" ? "#10B981" : "#6366F1",
                        }}
                      />
                    </div>
                    <p className="text-sm text-foreground font-bold mt-1">{progress.toFixed(0)}% completado</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {task.status === "pending" && (
                      <Button
                        onClick={() => handleStartTask(task.id)}
                        className="flex-1 h-12 text-base font-bold"
                        style={{ backgroundColor: "#6366F1", color: "white" }}
                      >
                        <Clock className="h-5 w-5 mr-2" />
                        Comenzar Producción
                      </Button>
                    )}
                    {task.status === "in_progress" && (
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        className="flex-1 h-12 text-base font-bold"
                        style={{ backgroundColor: "#10B981", color: "white" }}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Finalizar Lote
                      </Button>
                    )}
                    {task.status === "completed" && (
                      <Button
                        disabled
                        className="flex-1 h-12 text-base font-bold"
                        style={{ backgroundColor: "#10B981", color: "white", opacity: 0.7 }}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Completada
                      </Button>
                    )}
                    <Button
                      onClick={() => handleReportIssue(task.id)}
                      variant="outline"
                      className="h-12 text-base font-bold border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Reportar Falla/Merma
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Metrics Panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border p-6">
            <h3 className="text-xl font-bold mb-6" style={{ color: "#6366F1" }}>
              Métricas de Hoy
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Piezas Buenas</p>
                <p className="text-4xl font-bold text-success">2,650</p>
              </div>

              <div>
                <p className="text-sm text-foreground font-bold mb-2">Merma / Scrap</p>
                <p className="text-4xl font-bold text-destructive">42</p>
                <p className="text-sm text-foreground font-bold mt-1">1.6% del total</p>
              </div>

              <div>
                <p className="text-sm text-foreground font-bold mb-2">Tiempo Activo</p>
                <p className="text-4xl font-bold" style={{ color: "#6366F1" }}>5h 23m</p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-foreground font-bold mb-2">Eficiencia del Turno</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold" style={{ color: "#6366F1" }}>94.2%</p>
                  <TrendingUp className="h-6 w-6 text-success mb-2" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 p-6">
            <h4 className="text-lg font-bold mb-3" style={{ color: "#6366F1" }}>
              ¡Buen Trabajo!
            </h4>
            <p className="text-sm font-bold text-foreground">
              Estás superando la meta del día. Mantén el ritmo para alcanzar el objetivo de la semana.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}