import { useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Clock, LogIn, LogOut, Coffee, Calendar, CheckCircle2, X } from "lucide-react";
import { registrarAsistenciaApi } from "@/services/api";

type EventType = "entrada" | "salida" | "comida";

interface ConfirmModal {
  open: boolean;
  type: EventType | null;
  time: string;
}

interface HistoryRecord {
  day: string;
  entrada: string;
  salida: string;
  comida?: string;
}

const EVENT_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ElementType; confirmMsg: string }> = {
  entrada: {
    label: "Entrada",
    color: "#10B981",
    bg: "bg-emerald-50",
    icon: LogIn,
    confirmMsg: "Tu entrada ha sido registrada correctamente en el sistema.",
  },
  salida: {
    label: "Salida",
    color: "#EF4444",
    bg: "bg-red-50",
    icon: LogOut,
    confirmMsg: "Tu salida ha sido registrada. ¡Hasta mañana!",
  },
  comida: {
    label: "Hora de Comida",
    color: "#F59E0B",
    bg: "bg-amber-50",
    icon: Coffee,
    confirmMsg: "Tu descanso / hora de comida ha sido guardado exitosamente.",
  },
};

export default function Asistencia() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modal, setModal] = useState<ConfirmModal>({ open: false, type: null, time: "" });
  const [todayEvents, setTodayEvents] = useState<Partial<Record<EventType, string>>>({});
  const [loading, setLoading] = useState(false);
  const [weekHistory, setWeekHistory] = useState<HistoryRecord[]>([
    { day: "Lunes 24", entrada: "08:00 AM", salida: "05:00 PM" },
    { day: "Martes 25", entrada: "08:05 AM", salida: "05:02 PM" },
    { day: "Miércoles 26", entrada: "07:58 AM", salida: "05:00 PM" },
    { day: "Jueves 27", entrada: "08:02 AM", salida: "—" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const formatTimeShort = (date: Date) =>
    date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleAction = (type: EventType) => {
    setModal({ open: true, type, time: formatTimeShort(currentTime) });
  };

  const handleConfirm = async () => {
    if (!modal.type) return;
    const time = modal.time;
    const type = modal.type;

    setLoading(true);
    try {
      // Envía los datos reales al servidor backend conectado a MySQL
      await registrarAsistenciaApi({
        numero_empleado: "EMP-001",
        tipo_evento: type,
        hora: time,
      });

      setTodayEvents((prev) => ({ ...prev, [type]: time }));

      if (type === "entrada" || type === "salida") {
        setWeekHistory((prev) =>
          prev.map((r, i) =>
            i === prev.length - 1
              ? { ...r, [type === "entrada" ? "entrada" : "salida"]: time }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error al registrar asistencia en el servidor:", error);
      alert("Hubo un error al conectar con la base de datos.");
    } finally {
      setLoading(false);
      setModal({ open: false, type: null, time: "" });
    }
  };

  const handleClose = () => setModal({ open: false, type: null, time: "" });

  const cfg = modal.type ? EVENT_CONFIG[modal.type] : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Control de Asistencia"
        description="Registra tu entrada, salida y descansos del turno sincronizado con base de datos"
      />

      {/* Reloj Central */}
      <div className="flex justify-center">
        <Card className="bg-card border-border p-12 shadow-xl max-w-4xl w-full">
          <div className="text-center space-y-8">
            {/* Digital Clock */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Clock className="h-12 w-12 text-accent" />
                <h2 className="text-7xl font-bold tracking-tight" style={{ color: "#6366F1" }}>
                  {formatTime(currentTime)}
                </h2>
              </div>
              <p className="text-2xl font-bold text-foreground capitalize">
                {formatDate(currentTime)}
              </p>
            </div>

            {/* Estado del día */}
            {Object.keys(todayEvents).length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                {(["entrada", "salida", "comida"] as EventType[]).map((type) =>
                  todayEvents[type] ? (
                    <div
                      key={type}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                      style={{ borderColor: EVENT_CONFIG[type].color, color: EVENT_CONFIG[type].color }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold">{EVENT_CONFIG[type].label}: {todayEvents[type]}</span>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <Button
                onClick={() => handleAction("entrada")}
                disabled={!!todayEvents.entrada}
                className="h-32 text-2xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: "#10B981", color: "white" }}
              >
                <div className="flex flex-col items-center gap-3">
                  <LogIn className="h-12 w-12" />
                  <span>{todayEvents.entrada ? `Entrada: ${todayEvents.entrada}` : "Registrar Entrada"}</span>
                </div>
              </Button>

              <Button
                onClick={() => handleAction("salida")}
                disabled={!!todayEvents.salida}
                className="h-32 text-2xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: "#EF4444", color: "white" }}
              >
                <div className="flex flex-col items-center gap-3">
                  <LogOut className="h-12 w-12" />
                  <span>{todayEvents.salida ? `Salida: ${todayEvents.salida}` : "Registrar Salida"}</span>
                </div>
              </Button>
            </div>

            {/* Break Button */}
            <Button
              onClick={() => handleAction("comida")}
              disabled={!!todayEvents.comida}
              variant="outline"
              className="h-20 text-xl font-bold rounded-xl w-full max-w-md mx-auto mt-6 border-2 disabled:opacity-50"
              style={{ borderColor: "#F59E0B", color: "#F59E0B" }}
            >
              <Coffee className="h-8 w-8 mr-3" />
              {todayEvents.comida ? `Comida registrada: ${todayEvents.comida}` : "Iniciar Descanso / Comida"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Weekly History */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-accent" />
          <h3 className="text-2xl font-bold">Historial de la Semana</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2">
              <tr>
                <th className="text-left px-6 py-4 text-lg font-bold" style={{ color: "#6366F1" }}>Día</th>
                <th className="text-center px-6 py-4 text-lg font-bold" style={{ color: "#6366F1" }}>Hora de Entrada</th>
                <th className="text-center px-6 py-4 text-lg font-bold" style={{ color: "#6366F1" }}>Hora de Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {weekHistory.map((record, index) => (
                <tr key={index} className="hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-5 text-lg font-bold">{record.day}</td>
                  <td className="px-6 py-5 text-center text-lg font-bold text-success">{record.entrada}</td>
                  <td className="px-6 py-5 text-center text-lg font-bold text-foreground">{record.salida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Confirmación */}
      {modal.open && cfg && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>

              {/* Icono central */}
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div
                  className="rounded-full p-6"
                  style={{ backgroundColor: `${cfg.color}18` }}
                >
                  <cfg.icon className="h-16 w-16" style={{ color: cfg.color }} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold" style={{ color: cfg.color }}>
                    {cfg.label} Registrada
                  </h2>
                  <p className="text-5xl font-bold mt-3 tracking-tight" style={{ color: cfg.color }}>
                    {modal.time}
                  </p>
                  <p className="text-base text-foreground font-bold mt-3 capitalize">
                    {formatDate(currentTime)}
                  </p>
                </div>

                <p className="text-lg font-bold text-foreground mt-2">
                  {cfg.confirmMsg}
                </p>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full h-14 text-xl font-bold rounded-xl"
                style={{ backgroundColor: cfg.color, color: "white" }}
              >
                <CheckCircle2 className="h-6 w-6 mr-2" />
                {loading ? "Guardando en BD..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}