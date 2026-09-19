import { useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { ProductionStatus } from "@/app/components/erp/ProductionStatus";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Activity, Gauge, ThermometerSun, Timer,
  X, ClipboardCheck, Clock, User, CheckCircle2, Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchBitacorasProduccion, crearBitacoraProduccionApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const processes = ["Inyección", "Molido", "Extrusión"] as const;
const shifts = ["Matutino", "Vespertino", "Nocturno"] as const;
const machinesByProcess: Record<string, string[]> = {
  Inyección: ["INY-01", "INY-02", "INY-03"],
  Molido: ["MOL-01", "MOL-02"],
  Extrusión: ["EXT-01"],
};

interface Bitacora {
  id: number;
  process: string;
  machine: string;
  operator: string;
  shift: string;
  startedAt: string;
  endedAt: string;
  note: string;
  createdAt: Date;
}

const EMPTY = { process: "", machine: "", operator: "", shift: "", startedAt: "", endedAt: "", note: "" };

const shiftColor: Record<string, string> = {
  Matutino: "bg-warning/10 text-warning border-warning",
  Vespertino: "bg-info/10 text-info border-info",
  Nocturno: "bg-accent/10 text-accent border-accent",
};

const processColor: Record<string, string> = {
  Inyección: "bg-success/10 text-success border-success",
  Molido: "bg-warning/10 text-warning border-warning",
  Extrusión: "bg-destructive/10 text-destructive border-destructive",
};

export default function Produccion() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);

  const loadBitacoras = async () => {
    try {
      const data = await fetchBitacorasProduccion();
      if (data) {
        setBitacoras(data.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt) })));
      }
    } catch (err) {
      console.log("Error al cargar bitácoras de producción de la BD", err);
    }
  };

  useEffect(() => {
    loadBitacoras();
  }, []);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const machines = machinesByProcess[form.process] ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await crearBitacoraProduccionApi(form);
      await loadBitacoras();

      setSubmitted(true);
      toast({ title: "Bitácora guardada", description: "El registro se almacenó en la base de datos." });

      setTimeout(() => {
        setModalOpen(false);
        setForm(EMPTY);
        setSubmitted(false);
      }, 1600);
    } catch (error) {
      console.error("Error al registrar bitácora:", error);
      toast({ title: "Error", description: "No se pudo guardar la bitácora en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setForm(EMPTY);
    setSubmitted(false);
  };

  const formatRelative = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "hace unos segundos";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Producción"
        description="Líneas activas, OEE y bitácoras de turno sincronizadas con base de datos."
        actions={
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            Iniciar bitácora
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: "Líneas activas", value: "4 / 5" },
          { icon: Gauge, label: "OEE promedio", value: "82%" },
          { icon: Timer, label: "Ciclo medio", value: "9.4 s" },
          { icon: ThermometerSun, label: "Alertas térmicas", value: "0" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border p-4">
            <s.icon className="h-6 w-6 text-accent mb-2" />
            <p className="text-sm uppercase tracking-wider text-foreground font-bold">{s.label}</p>
            <p className="stat-number text-3xl font-bold mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <ProductionStatus />

      {/* Feed de bitácoras en tiempo real */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold uppercase tracking-wide text-foreground">
            Bitácoras del turno
          </h3>
          {bitacoras.length > 0 && (
            <span className="text-xs font-bold bg-accent/10 text-accent border border-accent px-2 py-0.5 rounded-full">
              {bitacoras.length} registro{bitacoras.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {bitacoras.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border blueprint-grid bg-card/50 p-8 text-center">
            <Factory className="h-8 w-8 text-foreground mx-auto mb-3 opacity-40" />
            <p className="font-display text-base text-foreground font-bold">
              No hay bitácoras registradas en la base de datos. Inicia una nueva.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bitacoras.map((b) => (
              <Card
                key={b.id}
                className="bg-card border-border p-4 animate-in slide-in-from-top-2 duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="rounded-full p-2 bg-accent/10 shrink-0">
                      <ClipboardCheck className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", processColor[b.process] ?? "")}>
                          {b.process}
                        </span>
                        <span className="text-xs font-bold text-foreground bg-surface-2 border border-border px-2 py-0.5 rounded">
                          {b.machine}
                        </span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", shiftColor[b.shift] ?? "")}>
                          {b.shift}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground leading-relaxed">{b.note}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground font-bold">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {b.operator}
                        </span>
                        {b.startedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {b.startedAt.replace("T", " ")}
                            {b.endedAt && ` → ${b.endedAt.replace("T", " ")}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-foreground font-bold">{formatRelative(b.createdAt)}</span>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-bold text-success">BD OK</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-7 py-5 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#2563eb" }}>Nueva Bitácora</h2>
                <p className="text-sm text-foreground font-bold mt-1">Registra el evento de la línea en la base de datos</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="rounded-full p-5 bg-success/10">
                    <CheckCircle2 className="h-14 w-14 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-success">¡Bitácora guardada!</h3>
                  <p className="text-base text-foreground font-bold text-center px-8">
                    El registro fue almacenado exitosamente en MySQL.
                  </p>
                </div>
              ) : (
                <form id="form-prod-bitacora" onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Proceso <span className="text-destructive">*</span></label>
                      <select
                        required
                        value={form.process}
                        onChange={(e) => { set("process", e.target.value); set("machine", ""); }}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-bold"
                      >
                        <option value="">Seleccionar...</option>
                        {processes.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Máquina <span className="text-destructive">*</span></label>
                      <select
                        required
                        value={form.machine}
                        onChange={(e) => set("machine", e.target.value)}
                        disabled={!form.process}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-bold disabled:opacity-50"
                      >
                        <option value="">Seleccionar...</option>
                        {machines.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

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
                        className="h-11 border-2 font-bold"
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
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-bold"
                      >
                        <option value="">Seleccionar...</option>
                        {shifts.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Inicio <span className="text-destructive">*</span></label>
                      <Input
                        type="datetime-local"
                        required
                        value={form.startedAt}
                        onChange={(e) => set("startedAt", e.target.value)}
                        className="h-11 border-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Fin</label>
                      <Input
                        type="datetime-local"
                        value={form.endedAt}
                        onChange={(e) => set("endedAt", e.target.value)}
                        className="h-11 border-2 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-1.5 block">
                      Observaciones <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe el evento, incidencia o novedad de la línea..."
                      value={form.note}
                      onChange={(e) => set("note", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border-2 border-border bg-surface-2 text-base font-bold resize-none"
                    />
                  </div>
                </form>
              )}
            </div>

            {!submitted && (
              <div className="px-7 py-5 border-t border-border flex gap-3">
                <Button type="button" onClick={handleClose} variant="outline" className="flex-1 h-12 text-base font-bold border-2">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} form="form-prod-bitacora" className="flex-1 h-12 text-base font-bold" style={{ backgroundColor: "#2563eb", color: "white" }}>
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