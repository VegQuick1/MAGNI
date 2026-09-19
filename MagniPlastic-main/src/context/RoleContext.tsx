import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "gerencia" | "operador";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isGerencia: boolean;
  isOperador: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    // Obtener el rol guardado del login
    const savedRole = localStorage.getItem("userRole") as Role;
    return savedRole || "operador";
  });

  // Sincronizar cuando cambie el rol en localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as Role;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isGerencia: role === "gerencia",
        isOperador: role === "operador",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
