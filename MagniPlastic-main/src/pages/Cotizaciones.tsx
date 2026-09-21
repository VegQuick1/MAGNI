import { useState, useMemo, useEffect } from "react";
import { Plus, FileText, X, User, Package, DollarSign, CheckCircle2, Phone, Mail, Calendar, CreditCard, Tag, TrendingUp } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { SalesChart } from "@/app/components/erp/SalesChart";
import { cn } from "@/lib/utils";
import { quotes as seedQuotes, segments } from "@/data/mock";
import { fetchCotizaciones, crearCotizacionApi, fetchContactos } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const statusStyles: Record<string, string> = {
  Aprobada: "bg-success/15 text-success border-success/30",
  Enviada: "bg-info/15 text-info border-info/30",
  Negociación: "bg-warning/15 text-warning border-warning/30",
  "En revisión": "bg-secondary text-foreground border-border",
  Perdida: "bg-destructive/15 text-destructive border-destructive/30",
};

interface NuevaCotizacion {
  cliente: string;
  segmento: string;
  responsable: string;
  producto: string;
  cantidad: string;
  unidad: string;
  precioUnitario: string;
  validez: string;
  condiciones: string;
  notas: string;
}

const EMPTY: NuevaCotizacion = {
  cliente: "",
  segmento: "Automotriz",
  responsable: "",
  producto: "",
  cantidad: "",
  unidad: "pza",
  precioUnitario: "",
  validez: "",
  condiciones: "30 días",
  notas: "",
};

export default function Cotizaciones() {
  const [quotes, setQuotes] = useState(seedQuotes);
  const [seg, setSeg] = useState("Todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<NuevaCotizacion>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [contactosList, setContactosList] = useState<any[]>([]);

  // Cargar cotizaciones y contactos desde la BD local al iniciar
  useEffect(() => {
    fetchCotizaciones()
      .then((data) => {
        if (data && data.length > 0) {
          setQuotes(data);
        }
      })
      .catch((err) => console.log("Usando cotizaciones locales por defecto", err));

    fetchContactos()
      .then((data) => {
        if (data) setContactosList(data);
      })
      .catch((err) => console.log("Error al cargar contactos", err));
  }, []);

  const filtered = useMemo(
    () => (seg === "Todos" ? quotes : quotes.filter((q) => q.segment === seg)),
    [seg, quotes]
  );
  const total = filtered.reduce((s, q) => s + q.amount, 0);

  const set = (field: keyof NuevaCotizacion, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const subtotal =
    form.cantidad && form.precioUnitario
      ? parseFloat(form.cantidad) * parseFloat(form.precioUnitario)
      : 0;
  const iva = subtotal * 0.16;
  const totalCot = subtotal + iva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearCotizacionApi(form);

      const updated = await fetchCotizaciones();
      if (updated && updated.length > 0) {
        setQuotes(updated);
      }

      setSubmitted(true);
      toast({ title: "Cotización creada", description: "Guardada exitosamente en la base de datos local." });
      
      setTimeout(() => {
        setDrawerOpen(false);
        setForm(EMPTY);
        setSubmitted(false);
      }, 1800);
    } catch (error) {
      console.error("Error al registrar cotización:", error);
      toast({ title: "Error", description: "No se pudo guardar la cotización en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setForm(EMPTY);
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Cotizaciones"
        description="Seguimiento segmentado por tipo de cliente sincronizado con base de datos local."
        actions={
          <Button
            onClick={() => setDrawerOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            <Plus className="h-4 w-4" /> Nueva cotización
          </Button>
        }
      />

      <SalesChart />

      <div className="flex flex-wrap gap-2">
        {segments.map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-semibold border transition-all",
              seg === s
                ? "bg-accent text-accent-foreground border-accent shadow-glow"
                : "bg-surface-2 text-foreground border-border hover:border-accent/40"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="bg-card border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-foreground font-bold">Total filtrado</p>
          <p className="stat-number text-3xl font-bold mt-1">
            ${total.toLocaleString("es-MX")} <span className="text-sm text-foreground font-mono font-semibold">MXN</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-wider text-foreground font-bold">Cotizaciones</p>
          <p className="stat-number text-3xl font-bold mt-1">{filtered.length}</p>
        </div>
      </Card>

      <div className="grid gap-3">
        {filtered.map((q) => (
          <Card key={q.id} onClick={() => setSelectedQuote(q)} className="bg-card border-border p-4 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span className="font-mono text-sm text-foreground font-bold">{q.id}</span>
                  <Badge variant="outline" className="border-border text-xs font-semibold">{q.segment}</Badge>
                </div>
                <p className="font-semibold mt-1 text-base">{q.client}</p>
              </div>
              <div className="col-span-6 md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-foreground font-bold">Monto</p>
                <p className="font-mono font-bold text-base">${q.amount.toLocaleString("es-MX")}</p>
              </div>
              <div className="col-span-6 md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-foreground font-bold">Responsable</p>
                <p className="text-base font-medium">{q.owner}</p>
              </div>
              <div className="col-span-6 md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-foreground font-bold">Fecha</p>
                <p className="font-mono text-base font-semibold">{q.date}</p>
              </div>
              <div className="col-span-6 md:col-span-1 md:text-right">
                <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border", statusStyles[q.status] || statusStyles["En revisión"])}>
                  {q.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal detalle de cotización */}
      {selectedQuote && (() => {
        const subtotalDet = selectedQuote.cantidad ? selectedQuote.cantidad * selectedQuote.precioUnitario : selectedQuote.amount / 1.16;
        const ivaDet = subtotalDet * 0.16;
        const totalDet = subtotalDet + ivaDet;
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQuote(null)}>
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between px-8 py-6 border-b border-border">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <FileText className="h-6 w-6" style={{ color: "#2563eb" }} />
                    <h2 className="text-2xl font-bold font-mono" style={{ color: "#2563eb" }}>{selectedQuote.id}</h2>
                  </div>
                  <p className="text-lg font-bold text-foreground">{selectedQuote.client}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-md text-sm font-bold border", statusStyles[selectedQuote.status] || statusStyles["En revisión"])}>
                    {selectedQuote.status}
                  </span>
                  <button onClick={() => setSelectedQuote(null)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-2 rounded-xl p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2" style={{ color: "#2563eb" }} />
                    <p className="text-xs font-bold uppercase text-foreground mb-1">Subtotal</p>
                    <p className="text-lg font-bold" style={{ color: "#2563eb" }}>${subtotalDet.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs font-bold uppercase text-foreground mb-1">IVA 16%</p>
                    <p className="text-lg font-bold">${ivaDet.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-4 text-center">
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-xs font-bold uppercase text-foreground mb-1">Total MXN</p>
                    <p className="text-lg font-bold text-success">${totalDet.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground border-b border-border pb-2">Contacto</h3>
                    <div className="flex items-center gap-2 text-sm font-bold"><User className="h-4 w-4 shrink-0" />{selectedQuote.client}</div>
                    <div className="flex items-center gap-2 text-sm font-bold"><Phone className="h-4 w-4 shrink-0" />81 4455-6677</div>
                    <div className="flex items-center gap-2 text-sm font-bold"><Mail className="h-4 w-4 shrink-0" />contacto@{selectedQuote.client.toLowerCase().replace(/\s/g, '')}.com</div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground border-b border-border pb-2">Condiciones</h3>
                    <div className="flex items-center gap-2 text-sm font-bold"><Calendar className="h-4 w-4 shrink-0" />Emisión: {selectedQuote.date}</div>
                    <div className="flex items-center gap-2 text-sm font-bold"><CreditCard className="h-4 w-4 shrink-0" />Pago: {selectedQuote.condiciones || "30 días"}</div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground border-b border-border pb-2">Producto</h3>
                    <div className="flex items-center gap-2 text-sm font-bold"><Package className="h-4 w-4 shrink-0" />{selectedQuote.producto || "Contenedor Industrial"}</div>
                    <div className="flex items-center gap-2 text-sm font-bold"><Tag className="h-4 w-4 shrink-0" />{selectedQuote.cantidad || 100} {selectedQuote.unidad || "pza"}</div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground border-b border-border pb-2">Clasificación</h3>
                    <div className="flex items-center gap-2 text-sm font-bold"><Tag className="h-4 w-4 shrink-0" />Segmento: {selectedQuote.segment}</div>
                    <div className="flex items-center gap-2 text-sm font-bold"><User className="h-4 w-4 shrink-0" />Responsable: {selectedQuote.owner}</div>
                  </div>
                </div>

                {selectedQuote.notas && (
                  <div className="bg-surface-2 rounded-xl p-4 border border-border">
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground mb-2">Notas</p>
                    <p className="text-sm font-bold">{selectedQuote.notas}</p>
                  </div>
                )}
              </div>

              <div className="px-8 py-5 border-t border-border flex justify-end">
                <Button onClick={() => setSelectedQuote(null)} className="h-11 px-8 text-base font-bold" style={{ backgroundColor: "#2563eb", color: "white" }}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Drawer Nueva Cotización */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card shadow-2xl z-50 flex flex-col">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#2563eb" }}>Nueva Cotización</h2>
                <p className="text-sm text-foreground font-bold mt-1">Genera una cotización y guárdala en la base de datos</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <div className="rounded-full p-6 bg-success/10">
                    <CheckCircle2 className="h-16 w-16 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-success">¡Cotización guardada!</h3>
                  <p className="text-base text-foreground font-bold text-center">
                    La cotización fue registrada en la base de datos local con estatus <strong>En revisión</strong>.
                  </p>
                </div>
              ) : (
                <form id="form-cotizacion" onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" style={{ color: "#2563eb" }} />
                      <h3 className="text-lg font-bold">Datos del Cliente</h3>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Cliente / Empresa <span className="text-destructive">*</span></label>
                      <select
                      required
                      value={form.cliente}
                      onChange={(e) => set("cliente", e.target.value)}
                      className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                    >
                      <option value="">Seleccione un cliente de la agenda...</option>
                      {contactosList.map((c) => (
                        <option key={c.id} value={`${c.name} (${c.company})`}>
                          {c.name} — {c.company} ({c.type})
                        </option>
                      ))}
                    </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">Segmento</label>
                        <select
                          value={form.segmento}
                          onChange={(e) => set("segmento", e.target.value)}
                          className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                        >
                          <option>Automotriz</option>
                          <option>Agroindustrial</option>
                          <option>Retail</option>
                          <option>Exportación</option>
                          <option>Gobierno</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">Responsable <span className="text-destructive">*</span></label>
                        <select
                          required
                          value={form.responsable}
                          onChange={(e) => set("responsable", e.target.value)}
                          className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                        >
                          <option value="">Seleccionar...</option>
                          <option>A. Ramírez</option>
                          <option>C. López</option>
                          <option>M. Torres</option>
                          <option>J. Herrera</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" style={{ color: "#2563eb" }} />
                      <h3 className="text-lg font-bold">Producto / Servicio</h3>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Producto <span className="text-destructive">*</span></label>
                      <select
                        required
                        value={form.producto}
                        onChange={(e) => set("producto", e.target.value)}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                      >
                        <option value="">Seleccione un producto...</option>
                        <option>Contenedor Colapsable 45X48X34</option>
                        <option>Contenedor Industrial 60X48X50</option>
                        <option>Charola Plástica 40X48X25</option>
                        <option>Pallet Plástico 120X100</option>
                        <option>Caja de Almacenaje PP</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">Cantidad <span className="text-destructive">*</span></label>
                        <Input
                          type="number"
                          min="1"
                          required
                          placeholder="0"
                          value={form.cantidad}
                          onChange={(e) => set("cantidad", e.target.value)}
                          className="h-11 border-2 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">Unidad</label>
                        <select
                          value={form.unidad}
                          onChange={(e) => set("unidad", e.target.value)}
                          className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                        >
                          <option value="pza">pza</option>
                          <option value="kg">kg</option>
                          <option value="juego">juego</option>
                          <option value="lote">lote</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Precio unitario (MXN) <span className="text-destructive">*</span></label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={form.precioUnitario}
                        onChange={(e) => set("precioUnitario", e.target.value)}
                        className="h-11 border-2 font-semibold"
                      />
                    </div>

                    {subtotal > 0 && (
                      <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm font-semibold text-foreground">
                          <span>Subtotal</span>
                          <span>${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold text-foreground">
                          <span>IVA (16%)</span>
                          <span>${iva.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-border pt-2" style={{ color: "#2563eb" }}>
                          <span>Total</span>
                          <span className="text-xl">${totalCot.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" style={{ color: "#2563eb" }} />
                      <h3 className="text-lg font-bold">Condiciones</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">Válido hasta <span className="text-destructive">*</span></label>
                        <Input
                          type="date"
                          required
                          value={form.validez}
                          onChange={(e) => set("validez", e.target.value)}
                          className="h-11 border-2 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">Condiciones de pago</label>
                        <select
                          value={form.condiciones}
                          onChange={(e) => set("condiciones", e.target.value)}
                          className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold"
                        >
                          <option>Contado</option>
                          <option>15 días</option>
                          <option>30 días</option>
                          <option>60 días</option>
                          <option>90 días</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Notas / Especificaciones</label>
                      <textarea
                        rows={3}
                        placeholder="Detalles técnicos o garantías"
                        value={form.notas}
                        onChange={(e) => set("notas", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-md border-2 border-border bg-surface-2 text-base font-semibold resize-none"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {!submitted && (
              <div className="border-t border-border p-6 flex gap-3">
                <Button type="button" onClick={handleClose} variant="outline" className="flex-1 h-12 text-base font-bold border-2">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} form="form-cotizacion" className="flex-1 h-12 text-base font-bold" style={{ backgroundColor: "#2563eb", color: "white" }}>
                  <FileText className="h-5 w-5 mr-2" />
                  {loading ? "Generando..." : "Generar Cotización"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}