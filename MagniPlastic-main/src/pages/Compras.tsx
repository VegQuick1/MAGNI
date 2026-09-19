import { useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Plus, Truck, Package, Calendar, X, ShoppingCart, Building2, ClipboardList, Phone, Mail, MapPin, DollarSign, Tag, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCompras, crearOrdenCompraApi, fetchContactos } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface OrdenCompra {
  id: string;
  supplier: string;
  material: string;
  qty: number;
  unit: string;
  amount: number;
  eta: string;
  status: string;
}

interface ProveedorContacto {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  type: string;
}

const statusStyles: Record<string, string> = {
  "En tránsito": "bg-info/15 text-info border-info/30",
  "Confirmada": "bg-success/15 text-success border-success/30",
  "Pendiente": "bg-warning/15 text-warning border-warning/30",
};

interface NuevaOrdenForm {
  proveedor: string;
  material: string;
  cantidad: string;
  unidad: string;
  precioUnitario: string;
  fechaEntrega: string;
  prioridad: string;
  notas: string;
}

const EMPTY: NuevaOrdenForm = {
  proveedor: "",
  material: "",
  cantidad: "",
  unidad: "kg",
  precioUnitario: "",
  fechaEntrega: "",
  prioridad: "Normal",
  notas: "",
};

export default function Compras() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<NuevaOrdenForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  
  // Datos reales desde la BD
  const [purchases, setPurchases] = useState<OrdenCompra[]>([]);
  const [proveedoresReales, setProveedoresReales] = ProveedorContactoState(); // Se ajusta con useState abajo
  const [selectedPurchase, setSelectedPurchase] = useState<OrdenCompra | null>(null);

  // Estados correctos de React
  const [proveedoresList, setProveedoresList] = useState<ProveedorContacto[]>([]);

  const loadData = async () => {
    try {
      const dataCompras = await fetchCompras();
      if (dataCompras) setPurchases(dataCompras);

      const dataContactos = await fetchContactos();
      if (dataContactos) {
        // Filtramos únicamente los que sean de tipo proveedor para la lista desplegable
        const soloProveedores = dataContactos.filter((c: ProveedorContacto) => c.type.toLowerCase() === 'proveedor');
        setProveedoresList(soloProveedores);
      }
    } catch (err) {
      console.error("Error al cargar datos reales de compras:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const set = (field: keyof NuevaOrdenForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalEstimado =
    form.cantidad && form.precioUnitario
      ? parseFloat(form.cantidad) * parseFloat(form.precioUnitario)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await crearOrdenCompraApi({
        proveedor: form.proveedor,
        material: form.material,
        cantidad: parseFloat(form.cantidad),
        unidad: form.unidad,
        precio_unitario: parseFloat(form.precioUnitario),
        total_estimado: totalEstimado,
        fecha_entrega: form.fechaEntrega,
        prioridad: form.prioridad,
        notas: form.notas,
      });

      toast({ title: "Orden creada", description: "La orden de compra se registró en MySQL exitosamente." });
      setDrawerOpen(false);
      setForm(EMPTY);
      loadData(); // Recarga la lista real de inmediato
    } catch (error) {
      console.error("Error al crear orden:", error);
      toast({ title: "Error", description: "No se pudo registrar la orden en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setForm(EMPTY);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Compras"
        description="Órdenes activas, seguimiento de entregas y gestión de proveedores sincronizadas con base de datos."
        actions={
          <Button
            onClick={() => setDrawerOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold"
          >
            <Plus className="h-4 w-4" /> Nueva orden
          </Button>
        }
      />

      {/* Listado de Compras reales */}
      <div className="grid gap-3">
        {purchases.length === 0 ? (
          <Card className="p-8 text-center bg-card border-border">
            <p className="text-muted-foreground font-medium">No hay órdenes de compra registradas en la base de datos.</p>
          </Card>
        ) : (
          purchases.map((p) => (
            <Card key={p.id} onClick={() => setSelectedPurchase(p)} className="bg-card border-border p-4 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent" />
                    <span className="font-mono text-sm text-foreground font-bold">{p.id}</span>
                  </div>
                  <p className="font-semibold mt-1 text-base text-foreground">{p.material}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                    <Truck className="h-4 w-4 inline mr-1" />
                    {p.supplier}
                  </p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Cantidad</p>
                  <p className="font-mono font-bold text-base text-foreground">{p.qty.toLocaleString()} {p.unit}</p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Monto</p>
                  <p className="font-mono font-bold text-base text-foreground">${p.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">ETA</p>
                  <p className="font-mono text-base flex items-center gap-1 font-semibold text-foreground">
                    <Calendar className="h-4 w-4" />
                    {p.eta}
                  </p>
                </div>
                <div className="col-span-6 md:col-span-1 md:text-right">
                  <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border", statusStyles[p.status] || "bg-secondary text-foreground")}>
                    {p.status || "Pendiente"}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal detalle de orden de compra */}
      {selectedPurchase && (() => {
        const subtotalDet = selectedPurchase.amount || 0;
        const iva = subtotalDet * 0.16;
        const totalConIva = subtotalDet + iva;
        
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPurchase(null)}>
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="flex items-start justify-between px-8 py-6 border-b border-border">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold font-mono text-primary">{selectedPurchase.id}</h2>
                  </div>
                  <p className="text-lg font-bold text-foreground">{selectedPurchase.supplier}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-md text-sm font-bold border", statusStyles[selectedPurchase.status] || "bg-secondary text-foreground")}>
                    {selectedPurchase.status}
                  </span>
                  <button onClick={() => setSelectedPurchase(null)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                    <X className="h-6 w-6 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-2 rounded-xl p-4 text-center border border-border">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Subtotal</p>
                    <p className="text-lg font-bold text-primary">${subtotalDet.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-4 text-center border border-border">
                    <Package className="h-6 w-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">IVA 16%</p>
                    <p className="text-lg font-bold text-foreground">${iva.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-4 text-center border border-border">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total MXN</p>
                    <p className="text-lg font-bold text-success">${totalConIva.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground border-b border-border pb-2">Información</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Building2 className="h-4 w-4 shrink-0" />Proveedor registrado en BD</div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground border-b border-border pb-2">Logística</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Calendar className="h-4 w-4 shrink-0" />ETA: {selectedPurchase.eta}</div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground border-b border-border pb-2">Material</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Package className="h-4 w-4 shrink-0" />{selectedPurchase.material}</div>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Tag className="h-4 w-4 shrink-0" />
                      Cantidad: {selectedPurchase.qty.toLocaleString()} {selectedPurchase.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-border flex justify-end">
                <Button onClick={() => setSelectedPurchase(null)} className="h-11 px-8 text-base font-bold bg-primary text-primary-foreground">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Drawer Nueva Orden */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card shadow-2xl z-50 flex flex-col border-l border-border">
            
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary">Nueva Orden de Compra</h2>
                <p className="text-sm text-muted-foreground font-bold mt-1">Sincronizado directo a MySQL</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="h-6 w-6 text-foreground" />
              </button>
            </div>

            {/* Body Form */}
            <div className="flex-1 overflow-y-auto">
              <form id="form-compra" onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Proveedor (Cargado desde la BD / Contactos) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Proveedor</h3>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-1.5 block text-foreground">Proveedor <span className="text-destructive">*</span></label>
                    <select
                      required
                      value={form.proveedor}
                      onChange={(e) => set("proveedor", e.target.value)}
                      className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold text-foreground"
                    >
                      <option value="">Seleccione un proveedor de la BD...</option>
                      {proveedoresList.length === 0 ? (
                        <option disabled>No hay proveedores registrados en contactos</option>
                      ) : (
                        proveedoresList.map((prov) => (
                          <option key={prov.id} value={prov.name}>
                            {prov.name} — ({prov.company})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Material */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Material</h3>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-1.5 block text-foreground">Material / Producto <span className="text-destructive">*</span></label>
                    <Input
                      required
                      placeholder="Ej. Polipropileno virgen"
                      value={form.material}
                      onChange={(e) => set("material", e.target.value)}
                      className="h-11 border-2 font-semibold bg-surface-2 text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block text-foreground">Cantidad <span className="text-destructive">*</span></label>
                      <Input
                        type="number"
                        min="1"
                        required
                        placeholder="0"
                        value={form.cantidad}
                        onChange={(e) => set("cantidad", e.target.value)}
                        className="h-11 border-2 font-semibold bg-surface-2 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block text-foreground">Unidad</label>
                      <select
                        value={form.unidad}
                        onChange={(e) => set("unidad", e.target.value)}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold text-foreground"
                      >
                        <option value="kg">kg</option>
                        <option value="ton">ton</option>
                        <option value="lt">lt</option>
                        <option value="pza">pza</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-1.5 block text-foreground">Precio unitario (MXN) <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={form.precioUnitario}
                      onChange={(e) => set("precioUnitario", e.target.value)}
                      className="h-11 border-2 font-semibold bg-surface-2 text-foreground"
                    />
                  </div>

                  {/* Total calculado */}
                  <div className="bg-surface-2 border border-border rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total estimado</span>
                    <span className="text-2xl font-bold text-primary">
                      {totalEstimado > 0 ? `$${totalEstimado.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN` : "—"}
                    </span>
                  </div>
                </div>

                {/* Logística */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Logística</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block text-foreground">Fecha de entrega (ETA) <span className="text-destructive">*</span></label>
                      <Input
                        type="date"
                        required
                        value={form.fechaEntrega}
                        onChange={(e) => set("fechaEntrega", e.target.value)}
                        className="h-11 border-2 font-semibold bg-surface-2 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block text-foreground">Prioridad</label>
                      <select
                        value={form.prioridad}
                        onChange={(e) => set("prioridad", e.target.value)}
                        className="w-full h-11 px-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold text-foreground"
                      >
                        <option value="Baja">Baja</option>
                        <option value="Normal">Normal</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-1.5 block text-foreground">Notas adicionales</label>
                    <textarea
                      rows={3}
                      placeholder="Instrucciones especiales..."
                      value={form.notas}
                      onChange={(e) => set("notas", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border-2 border-border bg-surface-2 text-base font-semibold resize-none text-foreground"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 flex gap-3 bg-card">
              <Button type="button" onClick={handleClose} variant="outline" className="flex-1 h-12 text-base font-bold border-2">
                Cancelar
              </Button>
              <Button type="submit" form="form-compra" disabled={loading} className="flex-1 h-12 text-base font-bold bg-primary text-primary-foreground">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {loading ? "Guardando..." : "Crear Orden"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Función auxiliar para inicializar el estado del selector de proveedores
function ProveedorContactoState() {
  return useState<ProveedorContacto[]>([]);
}