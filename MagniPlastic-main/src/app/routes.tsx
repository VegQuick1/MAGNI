import { createBrowserRouter, Navigate } from "react-router";
import Root from "./Root";
import Dashboard from "@/pages/Dashboard";
import Inventario from "@/pages/Inventario";
import Produccion from "@/pages/Produccion";
import Bitacoras from "@/pages/Bitacoras";
import Ventas from "@/pages/Ventas";
import VentasEmbarques from "@/pages/VentasEmbarques";
import Cotizaciones from "@/pages/Cotizaciones";
import Compras from "@/pages/Compras";
import Solicitudes from "@/pages/Solicitudes";
import Asistencia from "@/pages/Asistencia";
import TareasOperador from "@/pages/TareasOperador";
import Configuracion from "@/pages/Configuracion";
import Contactos from "@/pages/Contactos";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";

// Componente protector de rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Protege rutas exclusivas de gerencia — redirige al operador a su pantalla de inicio
function GerenciaRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== "gerencia") return <Navigate to="/asistencia" replace />;
  return <>{children}</>;
}

// Índice inteligente: gerencia → Dashboard, operador → Asistencia
function SmartIndex() {
  const userRole = localStorage.getItem("userRole");
  if (userRole === "gerencia") return <Dashboard />;
  return <Navigate to="/asistencia" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/configuracion",
    element: (
      <ProtectedRoute>
        <Configuracion />
      </ProtectedRoute>
    ),
  },
  {
    path: "/contactos",
    element: (
      <GerenciaRoute>
        <Contactos />
      </GerenciaRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Root />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SmartIndex /> },
      { path: "asistencia", Component: Asistencia },
      { path: "tareas", Component: TareasOperador },
      {
        path: "inventario",
        element: <GerenciaRoute><Inventario /></GerenciaRoute>,
      },
      {
        path: "produccion",
        element: <GerenciaRoute><Produccion /></GerenciaRoute>,
      },
      {
        path: "bitacoras",
        element: <GerenciaRoute><Bitacoras /></GerenciaRoute>,
      },
      {
        path: "ventas",
        element: <GerenciaRoute><Ventas /></GerenciaRoute>,
      },
      {
        path: "ventas-embarques",
        element: <GerenciaRoute><VentasEmbarques /></GerenciaRoute>,
      },
      {
        path: "cotizaciones",
        element: <GerenciaRoute><Cotizaciones /></GerenciaRoute>,
      },
      {
        path: "compras",
        element: <GerenciaRoute><Compras /></GerenciaRoute>,
      },
      { path: "solicitudes", Component: Solicitudes },
    ],
  },
]);
