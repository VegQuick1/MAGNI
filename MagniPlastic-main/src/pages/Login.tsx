import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoMagni from "@/imports/LOGO_MAGNIPLASTIC.png";
import { loginApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi({ email, password });
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", data.nombre || "Usuario");

      toast({ title: "Bienvenido", description: `Sesión iniciada como ${data.role}.` });
      navigate("/");
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      setError(err.message || "Credenciales incorrectas o error de conexión con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logo de fondo translúcido */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <img
          src={logoMagni}
          alt=""
          aria-hidden
          className="w-[70vmin] max-w-2xl opacity-[0.04] object-contain"
        />
      </div>

      {/* Tarjeta de login */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <ImageWithFallback
            src={logoMagni}
            alt="MAGNI PLASTIC S.A. DE C.V."
            className="h-20 w-auto"
          />
        </div>

        <h2 className="text-center text-xl font-bold text-foreground mb-6">
          Ingresa a tu cuenta
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md text-sm font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold block" style={{ color: "#3b4a9a" }}>
              Correo electrónico
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@magniplastic.com"
              className="h-11 bg-surface-2 border-2 border-border text-base font-semibold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold block" style={{ color: "#3b4a9a" }}>
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-surface-2 border-2 border-border text-base font-semibold"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base font-bold mt-2"
            style={{ backgroundColor: "#3b4a9a", color: "white" }}
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-foreground hover:text-foreground transition-colors font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-foreground font-bold mb-2 text-center">Cuentas de prueba en BD</p>
            <div className="space-y-1 text-xs text-foreground font-bold">
              <p>👤 gerencia@magniplastic.com / gerencia123</p>
              <p>🔧 operador@magniplastic.com / operador123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}