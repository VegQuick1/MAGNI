import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import logoMagni from "@/imports/LOGO_MAGNIPLASTIC.png";
import { recuperarPasswordApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    try {
      await recuperarPasswordApi(email);
      setSent(true);
      toast({ title: "Correo enviado", description: "Instrucciones enviadas a la base de datos." });
    } catch (err) {
      console.error("Error en recuperación:", err);
      setError("No se pudo conectar con el servidor para la recuperación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y marca */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-8">
            <ImageWithFallback
              src={logoMagni}
              alt="MAGNI PLASTIC S.A. DE C.V."
              className="w-64 h-auto"
            />
          </div>

          {!sent ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <ShieldCheck className="h-16 w-16" style={{ color: "#3b4a9a" }} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Recupera tu contraseña
              </h3>
              <p className="text-base text-foreground max-w-sm mx-auto">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <ShieldCheck className="h-10 w-10 text-success" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                ¡Correo enviado!
              </h3>
              <p className="text-base text-foreground max-w-sm mx-auto">
                Hemos enviado las instrucciones de recuperación a <strong>{email}</strong>.
                Por favor revisa tu bandeja de entrada.
              </p>
            </>
          )}
        </div>

        {/* Formulario */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/50 text-destructive p-4 rounded-md text-base font-bold">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xl font-bold" style={{ color: "#3b4a9a" }}>
                Correo electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@magniplastic.com"
                className="h-16 bg-surface-2 border-2 border-border text-xl font-bold"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 text-xl font-bold"
              style={{ backgroundColor: "#3b4a9a", color: "white" }}
            >
              {loading ? "Procesando..." : "Enviar enlace de recuperación"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-lg text-foreground hover:text-foreground transition-colors font-bold flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-16 text-xl font-bold"
              style={{ backgroundColor: "#3b4a9a", color: "white" }}
            >
              Ir al inicio de sesión
            </Button>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full text-lg text-foreground hover:text-foreground transition-colors font-bold"
            >
              ¿No recibiste el correo? Reenviar
            </button>
          </div>
        )}

        {/* Nota de seguridad */}
        <div className="mt-8 p-4 bg-surface-2 border border-border rounded-lg">
          <p className="text-sm text-foreground text-center">
            <strong>Nota de seguridad:</strong> El enlace de recuperación expirará en 24 horas por seguridad.
          </p>
        </div>
      </div>
    </div>
  );
}