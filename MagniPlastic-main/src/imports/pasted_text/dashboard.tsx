// ═══════════════════════════════════════════════════════════════
//  src/pages/Dashboard.tsx
// ═══════════════════════════════════════════════════════════════

import { Activity, Boxes, Factory, Gauge } from "lucide-react";
import { SectionHeader } from "@/components/erp/SectionHeader";
import { KpiCard } from "@/components/erp/KpiCard";
import { StockAlerts } from "@/components/erp/StockAlerts";
import { ProductionStatus } from "@/components/erp/ProductionStatus";
import { RecentMovements } from "@/components/erp/RecentMovements";
import { SalesSparkChart } from "@/components/erp/SalesSparkChart";
import { kpis } from "@/data/mock";
import { Button } from "@/components/ui/button";

const icons = [Gauge, Factory, Activity, Boxes];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Panel operativo"
        description="Vista en tiempo real de la planta. KPIs, alertas y bitácoras del turno en curso."
        actions={
          <>
            <Button variant="outline" className="bg-surface-2 border-border">Exportar</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Nueva bitácora</Button>
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
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ProductionStatus />
          <SalesSparkChart />
        </div>
        <div className="space-y-4">
          <StockAlerts />
          <RecentMovements />
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
//  src/pages/Inventario.tsx
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SectionHeader } from "@/components/erp/SectionHeader";
import { inventory } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/context/RoleContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ArrowDownToLine, ArrowUpFromLine, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Inventario() {
  const { isGerencia } = useRole();
  const [q, setQ] = useState("");
  const filtered = inventory.filter((i) =>
    i.sku.toLowerCase().includes(q.toLowerCase()) || i.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Inventario"
        description="Materias primas, pigmentos, reproceso y empaque. Captura rápida desde tablet."
        actions={
          <>
            <MovementDialog type="entrada" />
            <MovementDialog type="salida" />
          </>
        }
      />

      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="SKU o nombre…"
            className="pl-9 bg-surface-2 border-border font-mono text-sm placeholder:font-sans"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Todos", "Resina", "Pigmento", "Reproceso", "Empaque"].map((c) => (
            <Badge key={c} variant="outline" className="cursor-pointer border-border bg-surface-2 hover:border-accent">{c}</Badge>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-[11px] uppercase">SKU</TableHead>
              <TableHead>Material</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden md:table-cell">Ubicación</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => {
              const ratio = i.stock / i.min;
              const status = ratio < 0.5 ? "critico" : ratio < 1 ? "bajo" : "ok";
              return (
                <TableRow key={i.sku} className="border-border hover:bg-surface-2/40">
                  <TableCell className="font-mono text-xs text-muted-foreground">{i.sku}</TableCell>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{i.category}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />{i.location}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {i.stock} <span className="text-muted-foreground text-xs">{i.unit}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                      status === "critico" && "bg-destructive/10 text-destructive border-destructive/30",
                      status === "bajo" && "bg-warning/10 text-warning border-warning/30",
                      status === "ok" && "bg-success/10 text-success border-success/30",
                    )}>
                      {status === "critico" ? "Crítico" : status === "bajo" ? "Bajo" : "OK"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!isGerencia && (
        <p className="text-xs text-muted-foreground italic">
          Como operador puedes registrar entradas y salidas. Edición de catálogo restringida a gerencia.
        </p>
      )}
    </div>
  );
}

function MovementDialog({ type }: { type: "entrada" | "salida" }) {
  const [open, setOpen] = useState(false);
  const isIn = type === "entrada";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "h-10 gap-2",
            isIn ? "bg-success text-success-foreground hover:bg-success/90" : "bg-info text-info-foreground hover:bg-info/90",
          )}
        >
          {isIn ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
          Registrar {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display capitalize">Nueva {type} de material</DialogTitle>
          <DialogDescription>Captura optimizada para tablet en piso de producción.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">SKU</label>
            <Select>
              <SelectTrigger className="h-12 bg-surface-2 border-border font-mono">
                <SelectValue placeholder="Escanear o seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((i) => (
                  <SelectItem key={i.sku} value={i.sku} className="font-mono text-xs">
                    {i.sku} — {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Cantidad</label>
              <Input type="number" placeholder="0" className="h-12 bg-surface-2 border-border text-lg font-mono" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Lote</label>
              <Input placeholder="L-2026-…" className="h-12 bg-surface-2 border-border font-mono" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Notas</label>
            <Input placeholder="Opcional" className="h-11 bg-surface-2 border-border" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            className={cn("min-w-32", isIn ? "bg-success text-success-foreground" : "bg-info text-info-foreground")}
            onClick={() => setOpen(false)}
          >
            Confirmar {type}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ═══════════════════════════════════════════════════════════════
//  src/pages/Produccion.tsx
// ═══════════════════════════════════════════════════════════════

import { SectionHeader } from "@/components/erp/SectionHeader";
import { ProductionStatus } from "@/components/erp/ProductionStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Gauge, ThermometerSun, Timer } from "lucide-react";

export default function Produccion() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Producción"
        description="Líneas activas, OEE y bitácoras de turno. Acceso operativo desde tablet."
        actions={<Button className="bg-accent text-accent-foreground hover:bg-accent/90">Iniciar bitácora</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: "Líneas activas", value: "4 / 5" },
          { icon: Gauge, label: "OEE promedio", value: "82%" },
          { icon: Timer, label: "Ciclo medio", value: "9.4 s" },
          { icon: ThermometerSun, label: "Alertas térmicas", value: "0" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border p-4">
            <s.icon className="h-5 w-5 text-accent mb-2" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="stat-number text-2xl font-semibold mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <ProductionStatus />

      <div className="rounded-lg border border-dashed border-border blueprint-grid bg-card/50 p-8 text-center">
        <p className="font-display text-sm text-muted-foreground">
          Selecciona una línea para iniciar bitácora de inyección, molido o extrusión.
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
//  src/pages/Bitacoras.tsx
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/erp/SectionHeader";
import { processLogs as seedLogs } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, FileSignature, Clock, User, Factory } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

  const save = () => {
    if (!process || !machine || !operator || !shift || !startedAt) {
      toast({ title: "Faltan datos", description: "Proceso, máquina, operador, turno e inicio son obligatorios.", variant: "destructive" });
      return;
    }
    const next: Log = {
      id: `BIT-${3321 + (logs.length - seedLogs.length)}`,
      process, machine, operator, shift, startedAt,
      endedAt: endedAt || "—",
      note: note || "Sin observaciones.",
    };
    setLogs([next, ...logs]);
    toast({ title: "Bitácora guardada", description: `${next.id} · ${process} ${machine}` });
    reset();
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Bitácoras de proceso"
        description="Registro por turno de inyección, molido y extrusión. Optimizado para captura táctil en tablet."
      />

      {/* Formulario */}
      <Card className="bg-card border-border p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileSignature className="h-4 w-4 text-accent" />
          <h3 className="font-display font-semibold">Nueva entrada</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Proceso">
            <Select value={process} onValueChange={(v) => { setProcess(v); setMachine(""); }}>
              <SelectTrigger className="h-12 bg-surface-2 border-border"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
              <SelectContent>
                {processes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Máquina / Línea">
            <Select value={machine} onValueChange={setMachine} disabled={!process}>
              <SelectTrigger className="h-12 bg-surface-2 border-border font-mono">
                <SelectValue placeholder={process ? "Seleccionar…" : "Elige proceso"} />
              </SelectTrigger>
              <SelectContent>
                {(machinesByProcess[process] || []).map((m) => (
                  <SelectItem key={m} value={m} className="font-mono">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Operador">
            <Input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="Tu nombre" className="h-12 bg-surface-2 border-border" />
          </Field>

          <Field label="Turno">
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="h-12 bg-surface-2 border-border"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
              <SelectContent>
                {shifts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Hora inicio">
            <Input type="time" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="h-12 bg-surface-2 border-border font-mono" />
          </Field>

          <Field label="Hora fin">
            <Input type="time" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} className="h-12 bg-surface-2 border-border font-mono" />
          </Field>

          <div className="md:col-span-2" />
        </div>

        <div className="mt-3">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Notas del turno</label>
          <Textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Parámetros, paros, ajustes, incidencias…"
            className="mt-1.5 bg-surface-2 border-border min-h-24"
          />
        </div>

        <div className="flex justify-end mt-3 gap-2">
          <Button variant="ghost" onClick={reset}>Borrar</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-11" onClick={save}>
            <ClipboardCheck className="h-4 w-4" /> Guardar bitácora
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
            <p className="text-sm text-muted-foreground">Sin registros para este filtro.</p>
          )}
          {byMachine.map(([m, items]) => (
            <section key={m}>
              <header className="flex items-center gap-2 mb-2">
                <Factory className="h-4 w-4 text-accent" />
                <h4 className="font-display font-semibold tracking-tight">Línea <span className="font-mono">{m}</span></h4>
                <Badge variant="outline" className="border-border text-muted-foreground">{items.length} registros</Badge>
              </header>
              <div className="grid gap-3">
                {items.map((l) => (
                  <Card key={l.id} className="bg-card border-border p-4 hover:border-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] text-muted-foreground">{l.id}</span>
                          <Badge variant="outline" className="border-accent/40 text-accent bg-accent/10">{l.process}</Badge>
                          <Badge variant="outline" className={cn("border-border", shiftColor(l.shift))}>Turno {l.shift}</Badge>
                        </div>
                        <p className="text-sm mt-2">{l.note}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" /> {l.startedAt} → {l.endedAt}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" /> {l.operator}
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
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function shiftColor(shift: string) {
  if (shift === "Matutino") return "text-warning";
  if (shift === "Vespertino") return "text-info";
  return "text-accent";
}


// ═══════════════════════════════════════════════════════════════
//  src/pages/Ventas.tsx
// ═══════════════════════════════════════════════════════════════

import { SectionHeader } from "@/components/erp/SectionHeader";
import { SalesSparkChart } from "@/components/erp/SalesSparkChart";
import { KpiCard } from "@/components/erp/KpiCard";
import { quotes } from "@/data/mock";
import { DollarSign, ShoppingBag, Users, Target } from "lucide-react";

export default function Ventas() {
  const total = quotes.reduce((s, q) => s + q.amount, 0);
  return (
    <div className="space-y-5">
      <SectionHeader title="Ventas" description="Pipeline, cotizaciones y desempeño comercial por segmento." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Pipeline activo" value={`$${(total / 1_000_000).toFixed(2)}M`} delta="+8.4%" trend="up" icon={<DollarSign className="h-5 w-5" />} hint="6 cotizaciones" />
        <KpiCard label="Tasa de cierre" value="34%" delta="+2.1%" trend="up" icon={<Target className="h-5 w-5" />} hint="Últimos 90 días" />
        <KpiCard label="Clientes activos" value="48" delta="+3" trend="up" icon={<Users className="h-5 w-5" />} hint="vs mes anterior" />
        <KpiCard label="Ticket promedio" value="$232K" delta="-1.2%" trend="down" icon={<ShoppingBag className="h-5 w-5" />} hint="MXN" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><SalesSparkChart /></div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold mb-3">Por segmento</h3>
          <div className="space-y-3">
            {[
              { s: "OEM Automotriz", v: 42 },
              { s: "Industrial", v: 28 },
              { s: "Distribuidor", v: 14 },
              { s: "Farmacéutico", v: 10 },
              { s: "Retail / Consumo", v: 6 },
            ].map((row) => (
              <div key={row.s}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{row.s}</span>
                  <span className="font-mono">{row.v}%</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-accent" style={{ width: `${row.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
//  src/pages/Cotizaciones.tsx
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/erp/SectionHeader";
import { quotes, segments } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";

const statusStyles: Record<string, string> = {
  Aprobada: "bg-success/15 text-success border-success/30",
  Enviada: "bg-info/15 text-info border-info/30",
  Negociación: "bg-warning/15 text-warning border-warning/30",
  "En revisión": "bg-secondary text-foreground border-border",
  Perdida: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function Cotizaciones() {
  const [seg, setSeg] = useState("Todos");
  const filtered = useMemo(
    () => seg === "Todos" ? quotes : quotes.filter((q) => q.segment === seg),
    [seg],
  );
  const total = filtered.reduce((s, q) => s + q.amount, 0);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Cotizaciones"
        description="Seguimiento segmentado por tipo de cliente. Pipeline en MXN."
        actions={<Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"><Plus className="h-4 w-4" /> Nueva cotización</Button>}
      />

      <div className="flex flex-wrap gap-2">
        {segments.map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
              seg === s
                ? "bg-accent text-accent-foreground border-accent shadow-glow"
                : "bg-surface-2 text-muted-foreground border-border hover:border-accent/40",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="bg-card border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total filtrado</p>
          <p className="stat-number text-2xl font-semibold mt-1">${total.toLocaleString("es-MX")} <span className="text-xs text-muted-foreground font-mono">MXN</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Cotizaciones</p>
          <p className="stat-number text-2xl font-semibold mt-1">{filtered.length}</p>
        </div>
      </Card>

      <div className="grid gap-3">
        {filtered.map((q) => (
          <Card key={q.id} className="bg-card border-border p-4 hover:border-accent/50 transition-colors">
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="font-mono text-[11px] text-muted-foreground">{q.id}</span>
                  <Badge variant="outline" className="border-border text-[10px]">{q.segment}</Badge>
                </div>
                <p className="font-medium mt-1">{q.client}</p>
              </div>
              <div className="col-span-6 md:col-span-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Monto</p>
                <p className="font-mono font-medium">${q.amount.toLocaleString("es-MX")}</p>
              </div>
              <div className="col-span-6 md:col-span-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Responsable</p>
                <p className="text-sm">{q.owner}</p>
              </div>
              <div className="col-span-6 md:col-span-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Fecha</p>
                <p className="font-mono text-sm">{q.date}</p>
              </div>
              <div className="col-span-6 md:col-span-1 md:text-right">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                  statusStyles[q.status],
                )}>
                  {q.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
//  src/pages/Compras.tsx
// ═══════════════════════════════════════════════════════════════

import { SectionHeader } from "@/components/erp/SectionHeader";
import { purchases } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "En tránsito": "bg-info/15 text-info border-info/30"
