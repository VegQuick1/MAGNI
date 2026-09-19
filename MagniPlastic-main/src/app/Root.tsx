import { Outlet, NavLink, useNavigate } from "react-router";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Factory,
  ClipboardList,
  TrendingUp,
  FileText,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  FileStack,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Toaster } from "@/app/components/ui/sonner";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoMagni from "@/imports/LOGO_MAGNIPLASTIC.png";

const gerenciaNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventario", label: "Inventario", icon: Package },
  { path: "/produccion", label: "Producción", icon: Factory },
  { path: "/bitacoras", label: "Bitácoras", icon: ClipboardList },
  { path: "/ventas", label: "Ventas", icon: TrendingUp },
  { path: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { path: "/compras", label: "Compras", icon: ShoppingCart },
  { path: "/solicitudes", label: "Solicitudes", icon: FileStack },
];

const operadorNavItems = [
  { path: "/asistencia", label: "Asistencia", icon: Clock },
  { path: "/tareas", label: "Tareas", icon: ClipboardList },
  { path: "/solicitudes", label: "Solicitudes", icon: FileStack },
];

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Seleccionar items de navegación según el rol
  const userRole = localStorage.getItem("userRole") || "operador";
  const navItems = userRole === "gerencia" ? gerenciaNavItems : operadorNavItems;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-surface-2 rounded-md transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <ImageWithFallback
              src={logoMagni}
              alt="MAGNI PLASTIC"
              className="h-10 w-auto"
            />
            <div className="border-l border-border pl-3 hidden sm:block">
              <h1 className="font-display font-bold text-base md:text-lg">
                PlastiControl ERP
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Sistema de gestión operativa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline font-semibold">Rol:</span>
              <Badge
                variant="outline"
                className={cn(
                  "font-semibold",
                  userRole === "gerencia"
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-surface-2 text-foreground border-border"
                )}
              >
                {userRole === "gerencia" ? "Gerencia" : "Operador"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-card">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <aside className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64"
        )}>
          <div className="p-4 border-b border-border flex justify-center relative">
            {!sidebarCollapsed && (
              <ImageWithFallback
                src={logoMagni}
                alt="MAGNI PLASTIC"
                className="h-12 w-auto"
              />
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 transition-all z-10",
                sidebarCollapsed && "right-1/2 translate-x-1/2"
              )}
              title={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
          <nav className="flex flex-col h-[calc(100%-5rem)] p-4">
            <div className="space-y-1 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                      sidebarCollapsed && "justify-center"
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && item.label}
                </NavLink>
              ))}
            </div>

            {/* Bottom Icons */}
            <div className="space-y-1 border-t border-border pt-4">
              {userRole === "gerencia" && (
                <NavLink
                  to="/contactos"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                      sidebarCollapsed && "justify-center"
                    )
                  }
                  title={sidebarCollapsed ? "Contactos" : undefined}
                >
                  <Users className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && "Contactos"}
                </NavLink>
              )}
              <NavLink
                to="/configuracion"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                    sidebarCollapsed && "justify-center"
                  )
                }
                title={sidebarCollapsed ? "Configuración" : undefined}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && "Configuración"}
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 transition-all duration-300",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}>
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden p-4">
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}
