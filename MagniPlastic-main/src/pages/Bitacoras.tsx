import { useMemo, useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { processLogs as seedLogs } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/app/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Card } from "@/app/components/ui/card";
import { ClipboardCheck, FileSignature, Clock, User, Factory } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchBitacoras, guardarBitacoraApi } from "@/services/api";

const processes = ["Inyección", "Molido", "Extrusión"] as const;
const shifts = ["Matutino", "Vespertino", "Nocturno"] as const;
const machinesByProcess: Record<string, string[]> = {
  Inyección: ["INY-01", "INY-02", "INY-03"],
  Molido: ["MOL-01", "MOL-02"],
  Extrusión: ["EXT-01"],
};

type Log = (typeof seedLogs)[number];

export default function Bitacoras() {
  const [logs, setLogs] = useState<Log[]>(seedLogs);
  const [tab, setTab] = useState<string>("Todas");

  // form state
  const [process, setProcess] = useState<string>("");
  const [machine, setMachine] = useState<string>("");
  const [operator, setOperator] = useState("");
  const [shift, setShift] = useState<string>("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar registros desde la base de datos MySQL al iniciar
  useEffect(() => {
    fetchBitacoras()
      .then((data) => {
        if (data && data.length > 0) {
          setLogs(data);
        }
      })
      .catch((err) => console.log("Usando datos locales por defecto", err));
  }, []);

  const tabs = ["Todas", ...processes];
  const filtered = tab === "Todas" ? logs : logs.filter((l) => l.process === tab);

  // historial agrupado por máquina/línea
  const byMachine = useMemo(() => {
    const map = new Map<string, Log[]>();
    for (const l of filtered) {
      if (!map.has(l.machine)) map.set(l.machine, []);
      map.get(l.machine)!.push(l);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const reset = () => {
    setProcess(""); setMachine(""); setOperator(""); setShift("");
    setStartedAt(""); setEndedAt(""); setNote("");
  };

  const save = async () => {
    if (!process || !machine || !operator || !shift || !startedAt) {
      toast({ title: "Faltan datos", description: "Proceso, máquina, operador, turno e inicio son obligatorios.", variant: "destructive" });
      return;
    }

    const codigoId = `BIT-${3321 + logs.length}`;
    const payload = {
      codigo_bitacora: codigoId,
      proceso: process,
      maquina: machine,
      operador: operator,
      turno: shift,
      hora_inicio: startedAt,
      hora_fin: endedAt || "—",
      observaciones: note || "Sin observaciones.",
    };

    setLoading(true);
    try {
      await guardarBitacoraApi(payload);

      const next: Log = {
        id: codigoId,
        process,
        machine,
        operator,
        shift,
        startedAt,
        endedAt: endedAt || "—",
        note: note || "Sin observaciones.",
      };

      setLogs([next, ...logs]);
      toast({ title: "Bitácora guardada en BD", description: `${next.id} · ${process} ${machine}` });
      reset();
    } catch (error) {
      console.error("Error al guardar bitácora:", error);
      toast({ title: "Error", description: "No se pudo guardar en la base de datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Bitácoras de proceso"
        description="Registro por turno de inyección, molido y extrusión"
      />

      {/* Formulario */}
      <Card className="bg-card border-border p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileSignature className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-lg">Nueva entrada</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Proceso">
            <Select value={process} onValueChange={(v) => { setProcess(v); setMachine(""); }}>
              <SelectTrigger className="h-12 bg-surface-2 border-border text-base"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
              <SelectContent>
                {processes.map((p) => <SelectItem key={p} value={p} className="text-base">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Máquina / Línea">
            <Select value={machine} onValueChange={setMachine} disabled={!process}>
              <SelectTrigger className="h-12 bg-surface-2 border-border font-mono text-base">
                <SelectValue placeholder={process ? "Seleccionar…" : "Elige proceso"} />
              </SelectTrigger>
              <SelectContent>
                {(machinesByProcess[process] || []).map((m) => (
                  <SelectItem key={m} value={m} className="font-mono text-base">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Operador">
            <Input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="Tu nombre" className="h-12 bg-surface-2 border-border text-base" />
          </Field>

          <Field label="Turno">
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="h-12 bg-surface-2 border-border text-base"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
              <SelectContent>
                {shifts.map((s) => <SelectItem key={s} value={s} className="text-base">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Hora inicio">
            <Input type="time" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="h-12 bg-surface-2 border-border font-mono text-base" />
          </Field>

          <Field label="Hora fin">
            <Input type="time" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} className="h-12 bg-surface-2 border-border font-mono text-base" />
          </Field>

          <div className="md:col-span-2" />
        </div>

        <div className="mt-3">
          <label className="text-sm uppercase tracking-wider text-foreground font-bold">Notas del turno</label>
          <Textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Parámetros, paros, ajustes, incidencias…"
            className="mt-1.5 bg-surface-2 border-border min-h-24 text-base"
          />
        </div>

        <div className="flex justify-end mt-3 gap-2">
          <Button variant="ghost" onClick={reset}>Borrar</Button>
          <Button disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-11" onClick={save}>
            <ClipboardCheck className="h-4 w-4" /> {loading ? "Guardando..." : "Guardar bitácora"}
          </Button>
        </div>
      </Card>

      {/* Historial */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface-2 border border-border">
          {tabs.map((p) => (
            <TabsTrigger key={p} value={p} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              {p}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-5">
          {byMachine.length === 0 && (
            <p className="text-base text-foreground font-bold">Sin registros para este filtro.</p>
          )}
          {byMachine.map(([m, items]) => (
            <section key={m}>
              <header className="flex items-center gap-2 mb-2">
                <Factory className="h-5 w-5 text-accent" />
                <h4 className="font-display font-bold tracking-tight text-lg">Línea <span className="font-mono">{m}</span></h4>
                <Badge variant="outline" className="border-border text-foreground font-bold">{items.length} registros</Badge>
              </header>
              <div className="grid gap-3">
                {items.map((l) => (
                  <Card key={l.id} className="bg-card border-border p-4 hover:border-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-foreground font-bold">{l.id}</span>
                          <Badge variant="outline" className="border-accent/40 text-accent bg-accent/10 font-semibold">{l.process}</Badge>
                          <Badge variant="outline" className={cn("border-border font-semibold", shiftColor(l.shift))}>Turno {l.shift}</Badge>
                        </div>
                        <p className="text-base mt-2 font-bold text-foreground">{l.note}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-foreground">
                          <span className="inline-flex items-center gap-1 font-mono font-bold">
                            <Clock className="h-4 w-4" /> {l.startedAt} → {l.endedAt}
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold">
                            <User className="h-4 w-4" /> {l.operator}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm uppercase tracking-wider text-foreground font-bold">{label}</label>
      {children}
    </div>
  );
}

function shiftColor(shift: string) {
  if (shift === "Matutino") return "text-warning";
  if (shift === "Vespertino") return "text-info";
  return "text-accent";
}