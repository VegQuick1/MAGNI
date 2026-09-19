import { Fragment, useState, useEffect } from "react";
import { NavLink } from "react-router";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  Users,
  Settings,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoMagni from "@/imports/LOGO_MAGNIPLASTIC.png";
import { fetchContactos, crearContactoApi, eliminarContactoApi, actualizarContactoApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  amount: number;
  date: string;
  status: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  type: "cliente" | "proveedor";
  invoices?: Invoice[];
}

export default function Contactos() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"clientes" | "proveedores">("clientes");
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulario nuevo contacto
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formType, setFormType] = useState<"cliente" | "proveedor">("cliente");

  // Estado para editar contacto
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const userRole = localStorage.getItem("userRole") || "operador";

  const loadContacts = async () => {
    try {
      const data = await fetchContactos();
      if (data && data.length > 0) {
        setContacts(data);
      }
    } catch (err) {
      console.log("Error al cargar contactos de la BD", err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSaveContact = async () => {
    if (!formName || !formCompany || !formEmail) {
      toast({ title: "Faltan datos", description: "Nombre, empresa y email son obligatorios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await crearContactoApi({
        nombre: formName,
        empresa: formCompany,
        telefono: formPhone,
        email: formEmail,
        tipo: formType,
      });

      await loadContacts();
      toast({ title: "Contacto guardado", description: "El registro se guardó en la base de datos con éxito." });
      setIsAddingContact(false);
      setFormName("");
      setFormCompany("");
      setFormPhone("");
      setFormEmail("");
    } catch (error) {
      console.error("Error al guardar contacto:", error);
      toast({ title: "Error", description: "No se pudo registrar el contacto.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de eliminar este contacto?")) return;
    try {
      await eliminarContactoApi(id);
      
      // Actualizamos el estado local de inmediato para que desaparezca de la tabla sin recargar
      setContacts((prevContacts) => prevContacts.filter((c) => c.id !== id));
      setExpandedContact(null);

      toast({ title: "Eliminado", description: "El contacto fue borrado con éxito." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el contacto.", variant: "destructive" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    try {
      await actualizarContactoApi(editingContact.id, {
        nombre: editingContact.name,
        empresa: editingContact.company,
        telefono: editingContact.phone,
        email: editingContact.email,
        tipo: editingContact.type,
      });
      toast({ title: "Actualizado", description: "Los cambios se guardaron correctamente." });
      setEditingContact(null);
      loadContacts();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
    }
  };

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Turno Matutino";
    if (hour >= 14 && hour < 22) return "Turno Vespertino";
    return "Turno Nocturno";
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "clientes" ? contact.type === "cliente" : contact.type === "proveedor";
    return matchesSearch && matchesTab;
  });

  const toggleContactDetails = (contactId: string) => {
    setExpandedContact(expandedContact === contactId ? null : contactId);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-24 bg-surface-2 flex flex-col items-center py-6 gap-6">
        <div className="mb-4">
          <ImageWithFallback
            src={logoMagni}
            alt="MAGNI PLASTIC"
            className="h-12 w-auto"
          />
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          <NavLink to="/" className="p-3 hover:bg-card rounded-lg transition-colors" title="Dashboard">
            <LayoutDashboard className="h-6 w-6 text-foreground" />
          </NavLink>
          <NavLink to="/inventario" className="p-3 hover:bg-card rounded-lg transition-colors" title="Inventario">
            <Package className="h-6 w-6 text-foreground" />
          </NavLink>
          <NavLink to="/compras" className="p-3 hover:bg-card rounded-lg transition-colors" title="Compras">
            <ShoppingCart className="h-6 w-6 text-foreground" />
          </NavLink>
          <NavLink to="/bitacoras" className="p-3 hover:bg-card rounded-lg transition-colors" title="Bitácoras">
            <ClipboardList className="h-6 w-6 text-foreground" />
          </NavLink>
          <NavLink to="/ventas" className="p-3 hover:bg-card rounded-lg transition-colors" title="Ventas">
            <TrendingUp className="h-6 w-6 text-foreground" />
          </NavLink>
        </nav>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <NavLink to="/contactos" className="p-3 bg-accent rounded-lg transition-colors" title="Contactos">
            <Users className="h-6 w-6 text-accent-foreground" />
          </NavLink>
          <NavLink to="/configuracion" className="p-3 hover:bg-card rounded-lg transition-colors" title="Configuración">
            <Settings className="h-6 w-6 text-foreground" />
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-24 flex-1">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar contactos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-2 border-border h-12 text-base"
                />
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-foreground font-bold">Turno Actual</p>
                  <p className="text-lg font-bold">{getCurrentShift()}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-bold">Perfil de Usuario</p>
                  <p className="text-lg font-bold capitalize">{userRole === "gerencia" ? "Gerente" : "Operador"}</p>
                </div>
                <button className="relative p-2 hover:bg-surface-2 rounded-lg transition-colors">
                  <Bell className="h-6 w-6 text-foreground" />
                  <span className="absolute top-1 right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold" style={{ color: "#3b4a9a" }}>
              Administración de Contactos
            </h1>
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-6 py-6 text-base">
                  <Plus className="h-5 w-5 mr-2" />
                  NUEVO CONTACTO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Agregar Nuevo Contacto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-bold mb-2 block">Nombre</label>
                      <Input
                        placeholder="Nombre completo"
                        className="h-12"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Empresa</label>
                      <Input
                        placeholder="Nombre de la empresa"
                        className="h-12"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Teléfono</label>
                      <Input
                        placeholder="555-555-5555"
                        className="h-12"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Email</label>
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="h-12"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-base font-bold mb-2 block">Tipo</label>
                      <select
                        className="w-full h-12 px-3 rounded-md border border-border bg-surface-2"
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as "cliente" | "proveedor")}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="proveedor">Proveedor</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setIsAddingContact(false)} variant="outline" className="flex-1 h-12">
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveContact} disabled={loading} className="flex-1 h-12 bg-accent">
                      {loading ? "Guardando..." : "Guardar Contacto"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("clientes")}
              className={cn(
                "px-6 py-3 text-base font-bold rounded-lg transition-colors",
                activeTab === "clientes" ? "bg-accent text-accent-foreground" : "bg-surface-2 text-foreground hover:bg-card"
              )}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab("proveedores")}
              className={cn(
                "px-6 py-3 text-base font-bold rounded-lg transition-colors",
                activeTab === "proveedores" ? "bg-accent text-accent-foreground" : "bg-surface-2 text-foreground hover:bg-card"
              )}
            >
              Proveedores
            </button>
          </div>

          {/* Table */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Nombre</th>
                    <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Empresa</th>
                    <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Teléfono</th>
                    <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Email</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContacts.map((contact) => (
                    <Fragment key={contact.id}>
                      <tr
                        onClick={() => toggleContactDetails(contact.id)}
                        className="hover:bg-surface-2 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-base font-bold">{contact.name}</td>
                        <td className="px-6 py-4 text-base text-foreground">{contact.company}</td>
                        <td className="px-6 py-4 text-base text-foreground">{contact.phone}</td>
                        <td className="px-6 py-4 text-base text-foreground">{contact.email}</td>
                        <td className="px-6 py-4">
                          {expandedContact === contact.id ? (
                            <ChevronUp className="h-5 w-5 text-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-foreground" />
                          )}
                        </td>
                      </tr>
                      {expandedContact === contact.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-surface-2">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold">
                                  {activeTab === "clientes" ? "Facturas del Cliente" : "Órdenes de Compra"}
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 font-bold border-primary text-primary hover:bg-primary/10"
                                    onClick={() => setEditingContact(contact)}
                                  >
                                    <Edit className="h-4 w-4" /> Editar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1 font-bold"
                                    onClick={(e) => handleDelete(contact.id, e)}
                                  >
                                    <Trash2 className="h-4 w-4" /> Eliminar
                                  </Button>
                                </div>
                              </div>

                              {contact.invoices && contact.invoices.length > 0 ? (
                                <div className="space-y-2">
                                  {contact.invoices.map((invoice) => (
                                    <div
                                      key={invoice.id}
                                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                                    >
                                      <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold">{invoice.id}</span>
                                        <span className="text-foreground">{invoice.date}</span>
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            invoice.status === "Pagada" || invoice.status === "Confirmada"
                                              ? "bg-success/10 text-success border-success"
                                              : "bg-warning/10 text-warning border-warning"
                                          )}
                                        >
                                          {invoice.status}
                                        </Badge>
                                      </div>
                                      <span className="text-lg font-bold">
                                        ${invoice.amount.toLocaleString("es-MX")} MXN
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-foreground">
                                  No hay {activeTab === "clientes" ? "facturas" : "órdenes de compra"} registradas
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Edición de Contacto */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg border border-border space-y-4">
            <h3 className="text-xl font-bold text-primary">Editar Contacto</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-bold block mb-1">Nombre</label>
                <Input 
                  value={editingContact.name} 
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Empresa</label>
                <Input 
                  value={editingContact.company} 
                  onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Teléfono</label>
                <Input 
                  value={editingContact.phone} 
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Correo Electrónico</label>
                <Input 
                  type="email" 
                  value={editingContact.email} 
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })} 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingContact(null)}>Cancelar</Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-bold">Guardar Cambios</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}