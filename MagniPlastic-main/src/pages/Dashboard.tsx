import { useState } from "react";
import { Activity, Boxes, Factory, Gauge, X, Download, ClipboardCheck, Clock, User } from "lucide-react";
import { useNavigate } from "react-router";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { KpiCard } from "@/app/components/erp/KpiCard";
import { StockAlerts } from "@/app/components/erp/StockAlerts";
import { ProductionStatus } from "@/app/components/erp/ProductionStatus";
import { RecentMovements } from "@/app/components/erp/RecentMovements";
import { SalesSparkChart } from "@/app/components/erp/SalesSparkChart";
import { kpis } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { guardarBitacoraApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const icons = [Gauge, Factory, Activity, Boxes];

const processes = ["Inyección", "Molido", "Extrusión"] as const;
const shifts = ["Matutino", "Vespertino", "Nocturno"] as const;
const machinesByProcess: Record<string, string[]> = {
  Inyección: ["INY-01", "INY-02", "INY-03"],
  Molido: ["MOL-01", "MOL-02"],
  Extrusión: ["EXT-01"],
};

const EMPTY_FORM = { process: "", machine: "", operator: "", shift: "", startedAt: "", endedAt: "", note: "" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [bitacoraOpen, setBitacoraOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const getKpiNavigation = (kpiId: string) => {
    switch (kpiId) {
      case "oee":
      case "production":
      case "utilization":
      case "scrap":
        return () => navigate("/produccion");
      default:
        return undefined;
    }
  };

  const handleExport = () => {
    const now = new Date().toLocaleString("es-MX");
    const rows = [
      ["Panel Operativo — Magni Plastic ERP"],
      [`Exportado: ${now}`],
      [],
      ["KPI", "Valor", "Unidad", "Tendencia"],
      ...kpis.map((k) => [k.label, k.value, k.unit ?? "", k.trend === "up" ? "↑" : "↓"]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitBitacora = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        codigo_bitacora: `BIT-DASH-${Math.floor(100 + Math.random() * 900)}`,
        proceso: form.process,
        maquina: form.machine,
        operador: form.operator,
        turno: form.shift,
        hora_inicio: form.startedAt,
        hora_fin: form.endedAt || "—",
        observaciones: form.note,
      };

      await guardarBitacoraApi(payload);

      setSubmitted(true);
      toast({ title: "Bitácora registrada", description: "El evento se guardó correctamente en la base de datos." });

      setTimeout(() => {
        setBitacoraOpen(false);
        setForm(EMPTY_FORM);
        setSubmitted(false);
      }, 1800);
    } catch (error) {
      console.error("Error al guardar bitácora desde dashboard:", error);
      toast({ title: "Error", description: "No se pudo conectar con la base de datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBitacoraOpen(false);
    setForm(EMPTY_FORM);
    setSubmitted(false);
  };

  const machines = machinesByProcess[form.process] ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Panel operativo"
        description="Vista en tiempo real de la planta. KPIs, alertas y bitácoras del turno en curso."
        actions={
          <>
            <Button
              variant="outline"
              className="bg-surface-2 border-border gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              onClick={() => setBitacoraOpen(true)}
            >
              <ClipboardCheck className="h-4 w-4" />
              Nueva bitácora
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k, i) => {
          const Icon = icons[i];
          return (
            <KpiCard
              key={k.id}
              label={k.label}
              value={k.value}
              unit={k.unit}
              delta={k.delta}
              trend={k.trend as "up" | "down"}
              hint={k.hint}
              icon={<Icon className="h-5 w-5" />}
              positiveOnDown={k.id === "scrap"}
              onClick={getKpiNavigation(k.id)}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProductionStatus onClick={() => navigate("/produccion")} />
        <SalesSparkChart onClick={() => navigate("/ventas")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockAlerts onClick={() => navigate("/inventario")} />
        <RecentMovements onClick={() => navigate("/inventario")} />
      </div>

      {/* Modal Nueva Bitácora */}
      {bitacoraOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-7 py-5 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#2563eb" }}>Nueva Bitácora</h2>
                <p className="text-sm text-foreground font-bold mt-1">Registra el evento del turno en curso</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="rounded-full p-5 bg-success/10">
                    <ClipboardCheck className="h-14 w-14 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-success">¡Bitácora registrada!</h3>
                  <p className="text-base text-foreground font-bold text-center px-8">
                    El registro fue guardado correctamente en la base de datos del turno.
                  </p>
                </div>
              ) : (
                <form id="form-bitacora" onSubmit={handleSubmitBitacora} className="px-7 py-5 space-y-4">
                  {/* Proceso y máquina */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">
                        Proceso <span className="text-destructive">*</span>
                      </label>
                      <select
                        required
                        value={form.process}
                        onChange={(e) => { set("process", e.target.value); set("machine", ""); }}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                      >
                        <option value="">Seleccionar...</option>
                        {processes.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">
                        Máquina <span className="text-destructive">*</span>
                      </label>
                      <select
                        required
                        value={form.machine}
                        onChange={(e) => set("machine", e.target.value)}
                        disabled={!form.process}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold disabled:opacity-50"
                      >
                        <option value="">Seleccionar...</option>
                        {machines.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Operador y turno */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">
                        <User className="h-4 w-4 inline mr-1" />
                        Operador <span className="text-destructive">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Nombre del operador"
                        value={form.operator}
                        onChange={(e) => set("operator", e.target.value)}
                        className="h-11 border-2 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Turno <span className="text-destructive">*</span>
                      </label>
                      <select
                        required
                        value={form.shift}
                        onChange={(e) => set("shift", e.target.value)}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                      >
                        <option value="">Seleccionar...</option>
                        {shifts.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Horas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Inicio <span className="text-destructive">*</span></label>
                      <Input
                        type="datetime-local"
                        required
                        value={form.startedAt}
                        onChange={(e) => set("startedAt", e.target.value)}
                        className="h-11 border-2 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Fin</label>
                      <Input
                        type="datetime-local"
                        value={form.endedAt}
                        onChange={(e) => set("endedAt", e.target.value)}
                        className="h-11 border-2 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Nota */}
                  <div>
                    <label className="text-sm font-bold mb-1.5 block">
                      Observaciones / Nota <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe el evento, incidencia o novedad del turno..."
                      value={form.note}
                      onChange={(e) => set("note", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border-2 border-border bg-surface-2 text-base font-semibold resize-none"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="px-7 py-5 border-t border-border flex gap-3">
                <Button type="button" onClick={handleClose} variant="outline" className="flex-1 h-12 text-base font-bold border-2">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} form="form-bitacora" className="flex-1 h-12 text-base font-bold" style={{ backgroundColor: "#2563eb", color: "white" }}>
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  {loading ? "Guardando..." : "Guardar Bitácora"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}