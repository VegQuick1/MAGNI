import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  Truck,
  Package,
  Calendar,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Weight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchVentas, crearEmbarqueApi, crearVentaApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  folio: string;
  cliente: string;
  estatusFactura: "emitida" | "pendiente" | "cancelada";
  archivoFactura: string;
  estatusEmbarque: "pendiente" | "en_transito" | "entregado" | "cancelado";
  fechaSalida: string;
  destino: string;
  contacto: string;
  telefono: string;
  email: string;
  condicionesPago: string;
  monto: number;
  productos: { partNumber: string; descripcion: string; cantidad: number; peso: number }[];
  chofer: string;
  transportista: string;
  placas: string;
  notas: string;
}

const estatusFacturaConfig = {
  emitida: { label: "Emitida", color: "bg-success/10 text-success border-success" },
  pendiente: { label: "Pendiente", color: "bg-warning/10 text-warning border-warning" },
  cancelada: { label: "Cancelada", color: "bg-destructive/10 text-destructive border-destructive" },
};

const estatusEmbarqueConfig: Record<string, { label: string; color: string; icon: any }> = {
  pendiente: { label: "Pendiente", color: "bg-secondary text-foreground border-border", icon: Clock },
  en_transito: { label: "En Tránsito", color: "bg-info/10 text-info border-info", icon: Truck },
  entregado: { label: "Entregado", color: "bg-success/10 text-success border-success", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive", icon: XCircle },
};

export default function Ventas() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para Embarque
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState("");
  const [selectedChofer, setSelectedChofer] = useState("");
  const [selectedTransportista, setSelectedTransportista] = useState("");
  const [fechaSalidaInput, setFechaSalidaInput] = useState("");
  const [observacionesInput, setObservacionesInput] = useState("");

  // Estados para Nueva Venta
  const [ventaDrawerOpen, setVentaDrawerOpen] = useState(false);
  const [vCliente, setVCliente] = useState("");
  const [vDestino, setVDestino] = useState("");
  const [vContacto, setVContacto] = useState("");
  const [vTelefono, setVTelefono] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vCondiciones, setVCondiciones] = useState("Contado");
  const [vMonto, setVMonto] = useState("");
  const [vNotas, setVNotas] = useState("");

  const loadVentas = async () => {
    try {
      const data = await fetchVentas();
      if (data && data.length > 0) {
        setSales(data);
      }
    } catch (err) {
      console.log("Error al cargar ventas de la BD", err);
    }
  };

  useEffect(() => {
    loadVentas();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.destino.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDownloadPDF = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({ title: "Descargando archivo", description: `Obteniendo documento: ${filename}` });
  };

  const handleCreateEmbarque = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearEmbarqueApi({
        factura: selectedFactura,
        chofer: selectedChofer,
        transportista: selectedTransportista,
        fechaSalida: fechaSalidaInput,
        observaciones: observacionesInput,
      });

      await loadVentas();
      toast({ title: "Embarque creado", description: "Se actualizó el estatus de transporte en la base de datos." });
      setDrawerOpen(false);
      setSelectedFactura("");
      setSelectedChofer("");
      setSelectedTransportista("");
      setFechaSalidaInput("");
      setObservacionesInput("");
    } catch (error) {
      console.error("Error al registrar embarque:", error);
      toast({ title: "Error", description: "No se pudo registrar el embarque en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearVentaApi({
        cliente: vCliente,
        destino: vDestino,
        contacto: vContacto,
        telefono: vTelefono,
        email: vEmail,
        condiciones_pago: vCondiciones,
        monto: parseFloat(vMonto) || 0,
        notas: vNotas
      });

      await loadVentas();
      toast({ title: "Venta registrada", description: "Se ha generado un nuevo folio en la base de datos." });
      setVentaDrawerOpen(false);
      setVCliente(""); setVDestino(""); setVContacto(""); setVTelefono("");
      setVEmail(""); setVCondiciones("Contado"); setVMonto(""); setVNotas("");
    } catch (error) {
      console.error("Error al registrar venta:", error);
      toast({ title: "Error", description: "No se pudo registrar la venta en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pesoTotal = (sale: Sale) =>
    (sale.productos || []).reduce((s, p) => s + p.peso, 0).toLocaleString();

  const piezasTotal = (sale: Sale) =>
    (sale.productos || []).reduce((s, p) => s + p.cantidad, 0).toLocaleString();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#2563eb" }}>
              Ventas y Embarques
            </h1>
            <p className="text-base text-foreground font-bold mt-1">
              Haz clic en un registro para ver el detalle completo sincronizado
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setVentaDrawerOpen(true)}
              className="h-12 px-6 text-base font-bold bg-success text-success-foreground hover:bg-success/90"
            >
              <Plus className="h-5 w-5 mr-2" />
              Registrar Venta
            </Button>
            <Button
              onClick={() => setDrawerOpen(true)}
              className="h-12 px-6 text-base font-bold"
              style={{ backgroundColor: "#2563eb", color: "white" }}
            >
              <Truck className="h-5 w-5 mr-2" />
              Nuevo Embarque
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
            <Input
              type="text"
              placeholder="Buscar por folio, cliente o destino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-2"
            />
          </div>
          <div className="flex items-center gap-2 border-2 border-border rounded-md px-3 bg-surface-2">
            <Calendar className="h-5 w-5 text-foreground" />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-0 bg-transparent h-11 w-40" />
            <span className="text-foreground">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-0 bg-transparent h-11 w-40" />
          </div>
          <Button variant="outline" className="h-11 border-2">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-background p-6">
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-2 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Folio de Venta</th>
                  <th className="text-left px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Cliente</th>
                  <th className="text-center px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Estatus Factura</th>
                  <th className="text-center px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Archivo Factura</th>
                  <th className="text-center px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Estatus Embarque</th>
                  <th className="text-center px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Fecha de Salida</th>
                  <th className="text-left px-4 py-4 text-sm font-bold uppercase tracking-wide border-b-2 border-border">Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-base">{sale.folio}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-base">{sale.cliente}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("font-bold text-sm", estatusFacturaConfig[sale.estatusFactura]?.color || "")}>
                        {estatusFacturaConfig[sale.estatusFactura]?.label || sale.estatusFactura}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sale.archivoFactura ? (
                        <button
                          onClick={(e) => handleDownloadPDF(sale.archivoFactura, e)}
                          className="inline-flex items-center gap-2 text-info hover:text-info/80 transition-colors"
                        >
                          <FileText className="h-5 w-5" />
                          <Download className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("font-bold text-sm", estatusEmbarqueConfig[sale.estatusEmbarque]?.color || "")}>
                        {estatusEmbarqueConfig[sale.estatusEmbarque]?.label || sale.estatusEmbarque}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-base">{sale.fechaSalida}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-base">{sale.destino}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 border-t border-border bg-surface-2">
            <p className="text-sm text-foreground font-bold">
              Total de registros: {filteredSales.length} de {sales.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Modal detalle de venta (se mantiene intacto) */}
      {selectedSale && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-8 py-6 border-b border-border">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <FileText className="h-6 w-6" style={{ color: "#2563eb" }} />
                  <h2 className="text-2xl font-bold font-mono" style={{ color: "#2563eb" }}>
                    {selectedSale.folio}
                  </h2>
                </div>
                <p className="text-lg font-bold text-foreground">{selectedSale.cliente}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn("font-bold text-sm px-3 py-1", estatusEmbarqueConfig[selectedSale.estatusEmbarque]?.color)}>
                  {(() => { 
                    const Icon = estatusEmbarqueConfig[selectedSale.estatusEmbarque]?.icon || Clock; 
                    return <Icon className="h-4 w-4 mr-1 inline" />; 
                  })()}
                  {estatusEmbarqueConfig[selectedSale.estatusEmbarque]?.label || selectedSale.estatusEmbarque}
                </Badge>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-2 rounded-xl p-4 text-center">
                  <CreditCard className="h-6 w-6 mx-auto mb-2" style={{ color: "#2563eb" }} />
                  <p className="text-xs font-bold uppercase text-foreground mb-1">Monto Total</p>
                  <p className="text-xl font-bold" style={{ color: "#2563eb" }}>
                    {selectedSale.monto > 0 ? `$${selectedSale.monto.toLocaleString("es-MX")}` : "—"}
                  </p>
                  <p className="text-xs text-foreground font-bold">MXN</p>
                </div>
                <div className="bg-surface-2 rounded-xl p-4 text-center">
                  <Package className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-xs font-bold uppercase text-foreground mb-1">Total Piezas</p>
                  <p className="text-xl font-bold">{(selectedSale.productos || []).length > 0 ? piezasTotal(selectedSale) : "—"}</p>
                  <p className="text-xs text-foreground font-bold">unidades</p>
                </div>
                <div className="bg-surface-2 rounded-xl p-4 text-center">
                  <Weight className="h-6 w-6 mx-auto mb-2 text-warning" />
                  <p className="text-xs font-bold uppercase text-foreground mb-1">Peso Total</p>
                  <p className="text-xl font-bold">{(selectedSale.productos || []).length > 0 ? pesoTotal(selectedSale) : "—"}</p>
                  <p className="text-xs text-foreground font-bold">kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-base uppercase tracking-wide text-foreground border-b border-border pb-2">Contacto</h3>
                  <div className="flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4 shrink-0" />{selectedSale.contacto || "—"}</div>
                  <div className="flex items-center gap-2 text-sm font-semibold"><Phone className="h-4 w-4 shrink-0" />{selectedSale.telefono || "—"}</div>
                  <div className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 shrink-0" />{selectedSale.email || "—"}</div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-base uppercase tracking-wide text-foreground border-b border-border pb-2">Embarque</h3>
                  <div className="flex items-center gap-2 text-sm font-semibold"><Calendar className="h-4 w-4 shrink-0" />Salida: {selectedSale.fechaSalida || "—"}</div>
                  <div className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 shrink-0" />{selectedSale.destino || "—"}</div>
                  <div className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 shrink-0" />{selectedSale.condicionesPago || "—"}</div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-border flex justify-end">
              <Button onClick={() => setSelectedSale(null)} className="h-11 px-8" style={{ backgroundColor: "#2563eb", color: "white" }}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer - Nueva Venta (Nuevo formulario) */}
      {ventaDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setVentaDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-success">Registrar Nueva Venta</h2>
                <p className="text-base text-foreground font-bold mt-1">Generar folio de venta sin orden de cotización</p>
              </div>
              <button onClick={() => setVentaDrawerOpen(false)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateVenta} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-6 w-6 text-success" />
                  <h3 className="text-xl font-bold">Datos del Cliente</h3>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Nombre del Cliente / Empresa <span className="text-destructive">*</span></label>
                  <Input required value={vCliente} onChange={(e) => setVCliente(e.target.value)} placeholder="Ej. AutoParts S.A. de C.V." className="h-12 border-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-base font-bold mb-2 block">Contacto</label>
                    <Input value={vContacto} onChange={(e) => setVContacto(e.target.value)} placeholder="Nombre del encargado" className="h-12 border-2" />
                  </div>
                  <div>
                    <label className="text-base font-bold mb-2 block">Teléfono</label>
                    <Input value={vTelefono} onChange={(e) => setVTelefono(e.target.value)} placeholder="(81) 0000-0000" className="h-12 border-2" />
                  </div>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Correo Electrónico</label>
                  <Input type="email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} placeholder="correo@empresa.com" className="h-12 border-2" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-6 w-6 text-success" />
                  <h3 className="text-xl font-bold">Condiciones de la Venta</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-base font-bold mb-2 block">Monto Total Estimado (MXN)</label>
                    <Input type="number" step="0.01" value={vMonto} onChange={(e) => setVMonto(e.target.value)} placeholder="0.00" className="h-12 border-2 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-base font-bold mb-2 block">Condiciones de Pago</label>
                    <select value={vCondiciones} onChange={(e) => setVCondiciones(e.target.value)} className="w-full h-12 px-4 rounded-md border-2 border-border bg-surface-2 text-base font-semibold">
                      <option value="Contado">Contado</option>
                      <option value="Crédito 15 días">Crédito 15 días</option>
                      <option value="Crédito 30 días">Crédito 30 días</option>
                      <option value="Anticipo 50%">Anticipo 50%</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Destino Final <span className="text-destructive">*</span></label>
                  <Input required value={vDestino} onChange={(e) => setVDestino(e.target.value)} placeholder="Ciudad, Estado o Dirección Corta" className="h-12 border-2" />
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Notas Internas</label>
                  <textarea rows={3} value={vNotas} onChange={(e) => setVNotas(e.target.value)} placeholder="Acuerdos adicionales, tipo de material..." className="w-full px-4 py-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border">
                <Button type="button" onClick={() => setVentaDrawerOpen(false)} variant="outline" className="flex-1 h-12 text-base font-bold border-2">Cancelar</Button>
                <Button type="submit" disabled={loading} className="flex-1 h-12 text-base font-bold bg-success text-success-foreground hover:bg-success/90">
                  <FileText className="h-5 w-5 mr-2" />
                  {loading ? "Guardando..." : "Registrar Venta"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Drawer - Nuevo Embarque */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#2563eb" }}>Nuevo Embarque (MySQL)</h2>
                <p className="text-base text-foreground font-bold mt-1">Vincular factura y asignar transporte en la base de datos</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEmbarque} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-6 w-6" style={{ color: "#2563eb" }} />
                  <h3 className="text-xl font-bold">Información de Factura</h3>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Seleccionar Venta / Factura <span className="text-destructive">*</span></label>
                  <select required value={selectedFactura} onChange={(e) => setSelectedFactura(e.target.value)} className="w-full h-12 px-4 rounded-md border-2 border-border bg-surface-2 text-base font-semibold">
                    <option value="">Seleccione una venta...</option>
                    {sales.map(s => (
                      <option key={s.id} value={s.folio}>
                        {s.folio} - {s.cliente} (${s.monto.toLocaleString("es-MX")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-6 w-6" style={{ color: "#2563eb" }} />
                  <h3 className="text-xl font-bold">Información de Transporte</h3>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Chofer Asignado <span className="text-destructive">*</span></label>
                  <select required value={selectedChofer} onChange={(e) => setSelectedChofer(e.target.value)} className="w-full h-12 px-4 rounded-md border-2 border-border bg-surface-2 text-base font-semibold">
                    <option value="">Seleccione un chofer...</option>
                    <option value="Roberto García">Roberto García - Licencia A</option>
                    <option value="Luis Martínez">Luis Martínez - Licencia B</option>
                    <option value="Carlos Hernández">Carlos Hernández - Licencia A</option>
                    <option value="Miguel Sánchez">Miguel Sánchez - Licencia B</option>
                  </select>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Transportista <span className="text-destructive">*</span></label>
                  <select required value={selectedTransportista} onChange={(e) => setSelectedTransportista(e.target.value)} className="w-full h-12 px-4 rounded-md border-2 border-border bg-surface-2 text-base font-semibold">
                    <option value="">Seleccione un transportista...</option>
                    <option value="Transportes Rápidos del Norte">Transportes Rápidos del Norte</option>
                    <option value="Logística y Distribución SA">Logística y Distribución SA</option>
                    <option value="Carga Express del Bajío">Carga Express del Bajío</option>
                    <option value="Fletes Industriales MX">Fletes Industriales MX</option>
                  </select>
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Fecha de Salida <span className="text-destructive">*</span></label>
                  <Input type="date" required value={fechaSalidaInput} onChange={(e) => setFechaSalidaInput(e.target.value)} className="h-12 text-base font-semibold border-2" />
                </div>
                <div>
                  <label className="text-base font-bold mb-2 block">Observaciones</label>
                  <textarea rows={4} value={observacionesInput} onChange={(e) => setObservacionesInput(e.target.value)} placeholder="Instrucciones especiales, condiciones de entrega, etc." className="w-full px-4 py-3 rounded-md border-2 border-border bg-surface-2 text-base font-semibold resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border">
                <Button type="button" onClick={() => setDrawerOpen(false)} variant="outline" className="flex-1 h-12 text-base font-bold border-2">Cancelar</Button>
                <Button type="submit" disabled={loading} className="flex-1 h-12 text-base font-bold" style={{ backgroundColor: "#2563eb", color: "white" }}>
                  <Package className="h-5 w-5 mr-2" />
                  {loading ? "Creando..." : "Crear Embarque"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}