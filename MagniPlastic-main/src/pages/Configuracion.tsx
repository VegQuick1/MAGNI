import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import {
  Search,
  Type,
  Globe,
  Moon,
  LogOut,
  Bell,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoMagni from "@/imports/LOGO_MAGNIPLASTIC.png";
import { fetchConfiguracion, guardarConfiguracionApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function Configuracion() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // 1. Iniciar leyendo el localStorage para evitar parpadeos
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  const [fontType, setFontType] = useState("Roboto");
  const [language, setLanguage] = useState("Español (MX)");
  const [loading, setLoading] = useState(false);
  const userRole = localStorage.getItem("userRole") || "operador";

  // 2. Efecto para aplicar la clase dark al HTML cada vez que cambie el estado
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 3. Cargar configuración guardada al iniciar desde MySQL
  useEffect(() => {
    fetchConfiguracion("EMP-001")
      .then((data) => {
        if (data) {
          setFontType(data.tipo_letra || "Roboto");
          setLanguage(data.idioma || "Español (MX)");
          // Si la BD dice algo distinto al localStorage, lo actualiza
          setDarkMode(Boolean(data.modo_oscuro));
        }
      })
      .catch((err) => console.log("Usando configuración local por defecto", err));
  }, []);

  const handleSaveConfig = async (newDarkMode: boolean, newFont: string, newLang: string) => {
    setLoading(true);
    try {
      await guardarConfiguracionApi({
        usuario_id: "EMP-001",
        tipo_letra: newFont,
        idioma: newLang,
        modo_oscuro: newDarkMode,
      });
      toast({ title: "Configuración guardada", description: "Tus preferencias se han sincronizado con la base de datos." });
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({ title: "Error", description: "No se pudo guardar la configuración en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated); // Esto dispara el useEffect que cambia el DOM y el localStorage
    handleSaveConfig(updated, fontType, language); // Esto lo guarda en MySQL
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Turno Matutino";
    if (hour >= 14 && hour < 22) return "Turno Vespertino";
    return "Turno Nocturno";
  };

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-24 bg-surface-2 flex flex-col items-center py-6 gap-6 border-r border-border">
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
          <NavLink to="/contactos" className="p-3 hover:bg-card rounded-lg transition-colors" title="Contactos">
            <Users className="h-6 w-6 text-foreground" />
          </NavLink>
          <NavLink to="/configuracion" className="p-3 bg-accent rounded-lg transition-colors" title="Configuración">
            <Settings className="h-6 w-6 text-accent-foreground" />
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-24 flex-1">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar en configuración..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-2 border-border h-12 text-base"
                />
              </div>

              {/* Current Shift and Profile */}
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
          <h1 className="text-4xl font-bold mb-8" style={{ color: "#3b4a9a" }}>
            Configuración General
          </h1>

          <div className="space-y-6 max-w-4xl">
            {/* Font Type */}
            <Card className="p-6 bg-card border-border transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Type className="h-6 w-6" style={{ color: "#3b4a9a" }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">Tipo de Letra</h3>
                    <p className="text-base text-muted-foreground">
                      Personaliza la tipografía de la interfaz
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{fontType}</p>
                  <p className="text-sm text-muted-foreground">(Predeterminado)</p>
                </div>
              </div>
            </Card>

            {/* Language */}
            <Card className="p-6 bg-card border-border transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Globe className="h-6 w-6" style={{ color: "#3b4a9a" }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">Idioma</h3>
                    <p className="text-base text-muted-foreground">
                      Selecciona tu idioma preferido
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{language}</p>
                </div>
              </div>
            </Card>

            {/* Theme Toggle */}
            <Card className="p-6 bg-card border-border transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Moon className="h-6 w-6" style={{ color: "#3b4a9a" }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">Tema de Interfaz</h3>
                    <p className="text-base text-muted-foreground">
                      Alternar entre modo claro y oscuro
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  disabled={loading}
                  className={cn(
                    "relative inline-flex h-10 w-20 items-center rounded-full transition-colors",
                    darkMode ? "bg-accent" : "bg-border"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform",
                      darkMode ? "translate-x-11" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6 bg-card border-border transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <LogOut className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-destructive">Cerrar Sesión</h3>
                    <p className="text-base text-muted-foreground">
                      Salir de tu cuenta de forma segura
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-destructive hover:bg-destructive/90 text-white font-bold px-8 py-6 text-base transition-colors"
                >
                  SALIR AHORA
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}