import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  LayoutDashboard,
  Factory,
  Package,
  TrendingUp,
  Truck,
  Users,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  Download,
  Send,
  MapPin,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
  Package2,
  CreditCard,
  FileCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoMagni from "@/imports/LOGO_MAGNIPLASTIC.png";
import { fetchDetalleEmbarque } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Product {
  partNumber: string;
  description: string;
  quantity: number;
  weight: number;
  volume: number;
  observations: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pendiente: { label: "Pendiente", color: "bg-warning/10 text-warning border-warning", icon: Clock },
  en_proceso: { label: "En Proceso", color: "bg-info/10 text-info border-info", icon: Timer },
  en_transito: { label: "En Tránsito", color: "bg-accent/10 text-accent border-accent", icon: Truck },
  entregado: { label: "Entregado", color: "bg-success/10 text-success border-success", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baja: { label: "Baja", color: "bg-secondary text-foreground border-border" },
  media: { label: "Media", color: "bg-info/10 text-info border-info" },
  alta: { label: "Alta", color: "bg-warning/10 text-warning border-warning" },
  urgente: { label: "Urgente", color: "bg-destructive/10 text-destructive border-destructive" },
};

export default function VentasEmbarques() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem("userRole") || "operador";

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDetalleEmbarque("VEN-2026-0342");
        if (result) setData(result);
      } catch (err) {
        console.log("Error al cargar detalle de embarque de la BD", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Turno Matutino";
    if (hour >= 14 && hour < 22) return "Turno Vespertino";
    return "Turno Nocturno";
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
    const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  };

  const { date, time } = getCurrentDateTime();

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-xl font-bold text-foreground">Cargando datos desde MySQL...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-2 border-r border-border flex flex-col py-6">
        <div className="px-6 mb-8">
          <ImageWithFallback src={logoMagni} alt="MAGNI PLASTIC" className="h-14 w-auto mb-4" />
          <div className="border-l-4 border-accent pl-3">
            <h2 className="font-display font-bold text-xl text-foreground">PlastiControl ERP</h2>
            <p className="text-sm text-foreground font-bold uppercase tracking-wide">Sistema de Gestión</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavLink to="/" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </NavLink>
          <NavLink to="/produccion" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <Factory className="h-5 w-5" /> Producción
          </NavLink>
          <NavLink to="/inventario" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <Package className="h-5 w-5" /> Inventario
          </NavLink>
          <NavLink to="/ventas" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <TrendingUp className="h-5 w-5" /> Ventas
          </NavLink>
          {userRole === "gerencia" && (
            <NavLink to="/ventas-embarques" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
              <Truck className="h-5 w-5" /> Embarques
            </NavLink>
          )}
          <NavLink to="/contactos" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <Users className="h-5 w-5" /> Clientes
          </NavLink>
          <NavLink to="/cotizaciones" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <FileText className="h-5 w-5" /> Facturación
          </NavLink>
          <NavLink to="/bitacoras" className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-bold", isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-card")}>
            <BarChart3 className="h-5 w-5" /> Reportes
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-72 flex-1">
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#3b4a9a" }}>Ventas y Embarques (MySQL)</h1>
                <p className="text-base text-foreground font-bold mt-1">Gestión completa sincronizada con base de datos</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-foreground font-bold">Fecha y Hora</p>
                  <p className="text-base font-bold">{date}</p>
                  <p className="text-lg font-bold" style={{ color: "#3b4a9a" }}>{time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground font-bold">Usuario</p>
                  <p className="text-base font-bold capitalize">{userRole === "gerencia" ? "Gerente" : "Operador"}</p>
                  <p className="text-sm text-foreground font-bold">{getCurrentShift()}</p>
                </div>
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
              <Input
                type="text"
                placeholder="Buscar por número de orden, cliente o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-2 border-border h-12 text-base font-bold"
              />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Información General */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "#3b4a9a" }}>Información General</h2>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => toast({ title: "Descargando PDF", description: "Generando documento..." })} className="font-bold">
                  <Download className="h-4 w-4 mr-2" /> Descargar PDF
                </Button>
                <Button onClick={() => toast({ title: "Enviado", description: "Información enviada al cliente con éxito." })} className="font-bold" style={{ backgroundColor: "#3b4a9a", color: "white" }}>
                  <Send className="h-4 w-4 mr-2" /> Enviar al Cliente
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Número de Orden</p>
                <p className="text-lg font-mono font-bold">{data.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Número de Embarque</p>
                <p className="text-lg font-mono font-bold">{data.shipmentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Estado del Envío</p>
                <Badge variant="outline" className={cn("font-bold text-base", statusConfig[data.status]?.color)}>
                  {statusConfig[data.status]?.label || data.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Prioridad</p>
                <Badge variant="outline" className={cn("font-bold text-base", priorityConfig[data.priority]?.color)}>
                  {priorityConfig[data.priority]?.label || data.priority}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Método de Envío</p>
                <p className="text-base font-bold">{data.shippingMethod}</p>
              </div>
              <div>
                <p className="text-sm text-foreground font-bold mb-2">Vendedor Asignado</p>
                <p className="text-base font-bold">{data.salesperson}</p>
              </div>
            </div>
          </Card>

          {/* Cliente y Timeline */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6" style={{ color: "#3b4a9a" }} />
                <h2 className="text-2xl font-bold" style={{ color: "#3b4a9a" }}>QUIÉN - Cliente</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-foreground mt-1" />
                  <div><p className="text-sm text-foreground font-bold">Nombre</p><p className="text-lg font-bold">{data.customer.fullName}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-foreground mt-1" />
                  <div><p className="text-sm text-foreground font-bold">Empresa</p><p className="text-lg font-bold">{data.customer.company}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-foreground mt-1" />
                  <div><p className="text-sm text-foreground font-bold">Teléfono</p><p className="text-base font-bold">{data.customer.phone}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-foreground mt-1" />
                  <div><p className="text-sm text-foreground font-bold">Correo</p><p className="text-base font-bold">{data.customer.email}</p></div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6" style={{ color: "#3b4a9a" }} />
                <h2 className="text-2xl font-bold" style={{ color: "#3b4a9a" }}>CUÁNDO - Fechas</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-base font-bold">Fecha de Venta</p>
                  <p className="text-lg font-bold" style={{ color: "#3b4a9a" }}>{data.invoice.date}</p>
                </div>
                <div>
                  <p className="text-base font-bold">Método de Pago</p>
                  <p className="text-lg font-bold" style={{ color: "#3b4a9a" }}>{data.transport.paymentMethod}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Productos */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package2 className="h-6 w-6" style={{ color: "#3b4a9a" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#3b4a9a" }}>QUÉ - Productos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="text-left px-4 py-3 text-base font-bold" style={{ color: "#3b4a9a" }}>Número de Parte</th>
                    <th className="text-left px-4 py-3 text-base font-bold" style={{ color: "#3b4a9a" }}>Descripción</th>
                    <th className="text-center px-4 py-3 text-base font-bold" style={{ color: "#3b4a9a" }}>Cantidad</th>
                    <th className="text-center px-4 py-3 text-base font-bold" style={{ color: "#3b4a9a" }}>Peso (kg)</th>
                    <th className="text-center px-4 py-3 text-base font-bold" style={{ color: "#3b4a9a" }}>Volumen (m³)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.products.map((product: Product, index: number) => (
                    <tr key={index} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-4 text-base font-mono font-bold">{product.partNumber}</td>
                      <td className="px-4 py-4 text-base font-bold">{product.description}</td>
                      <td className="px-4 py-4 text-center text-base font-bold">{product.quantity}</td>
                      <td className="px-4 py-4 text-center text-base font-bold">{product.weight}</td>
                      <td className="px-4 py-4 text-center text-base font-bold">{product.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Facturación */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileCheck className="h-6 w-6" style={{ color: "#3b4a9a" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#3b4a9a" }}>Facturación</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-sm text-foreground font-bold mb-1">Número de Factura</p><p className="text-lg font-mono font-bold">{data.invoice.number}</p></div>
                  <div><p className="text-sm text-foreground font-bold mb-1">RFC</p><p className="text-base font-bold">{data.invoice.rfc}</p></div>
                </div>
                <div><p className="text-sm text-foreground font-bold mb-1">Estado de Pago</p>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning font-bold text-base">{data.invoice.status}</Badge>
                </div>
              </div>
              <div className="bg-surface-2 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-base font-bold">Subtotal:</span><span className="text-lg font-bold">${data.invoice.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between items-center"><span className="text-base font-bold">IVA (16%):</span><span className="text-lg font-bold">${data.invoice.tax.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between items-center"><span className="text-xl font-bold">TOTAL:</span><span className="text-2xl font-bold" style={{ color: "#3b4a9a" }}>${data.invoice.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
                  <div className="text-center text-sm text-foreground font-bold">MXN (Pesos Mexicanos)</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}