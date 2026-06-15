import { useContext } from "react";
import { PedidosContext } from "../context/PedidosContext";

export function usePedidos() {
  const context = useContext(PedidosContext);

  if (!context) {
    throw new Error("usePedidos debe usarse dentro de PedidosProvider.");
  }

  return context;
}
