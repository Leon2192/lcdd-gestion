import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard debe usarse dentro de DashboardProvider.");
  }

  return context;
}
