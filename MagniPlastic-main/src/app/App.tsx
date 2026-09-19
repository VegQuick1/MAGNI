import { RouterProvider } from "react-router";
import { RoleProvider } from "@/context/RoleContext";
import { AuthProvider } from "@/context/AuthContext";
import { router } from "./routes";
import { useEffect } from 'react';

export default function App() {
  
  // Este useEffect revisa el tema guardado al abrir la aplicación
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
    </AuthProvider>
  );
}