import { createContext, useEffect, useMemo, useState } from "react";
import {
  createPedido as createPedidoRequest,
  getPedidoById,
  getPedidos,
  updatePedido as updatePedidoRequest,
  updatePedidoEstado,
} from "../services/pedidosService";

export const PedidosContext = createContext(null);

const initialLoading = {
  pedidos: false,
  pedidoDetail: false,
  createPedido: false,
  editPedido: false,
  updatePedido: false,
};

const initialErrors = {
  pedidos: null,
  pedidoDetail: null,
  createPedido: null,
  editPedido: null,
  updatePedido: null,
};

export function PedidosProvider({ children }) {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialErrors);

  async function fetchPedidos() {
    setLoading((prev) => ({ ...prev, pedidos: true }));
    setError((prev) => ({ ...prev, pedidos: null }));

    try {
      const data = await getPedidos();
      setPedidos(data);
      return data;
    } catch (fetchError) {
      setError((prev) => ({
        ...prev,
        pedidos: fetchError.message || "No se pudieron cargar los pedidos.",
      }));
      throw fetchError;
    } finally {
      setLoading((prev) => ({ ...prev, pedidos: false }));
    }
  }

  async function fetchPedidoById(id) {
    setLoading((prev) => ({ ...prev, pedidoDetail: true }));
    setError((prev) => ({ ...prev, pedidoDetail: null }));
    setSelectedPedido(null);

    try {
      const data = await getPedidoById(id);
      setSelectedPedido(data);
      return data;
    } catch (fetchError) {
      setError((prev) => ({
        ...prev,
        pedidoDetail: fetchError.message || "No se pudo cargar el detalle del pedido.",
      }));
      throw fetchError;
    } finally {
      setLoading((prev) => ({ ...prev, pedidoDetail: false }));
    }
  }

  async function createPedido(payload) {
    setLoading((prev) => ({ ...prev, createPedido: true }));
    setError((prev) => ({ ...prev, createPedido: null }));

    try {
      const created = await createPedidoRequest(payload);
      await fetchPedidos();
      return created;
    } catch (createError) {
      const message = createError.message || "No se pudo crear el pedido.";
      setError((prev) => ({ ...prev, createPedido: message }));
      throw new Error(message);
    } finally {
      setLoading((prev) => ({ ...prev, createPedido: false }));
    }
  }

  async function editPedido(id, payload) {
    setLoading((prev) => ({ ...prev, editPedido: true }));
    setError((prev) => ({ ...prev, editPedido: null }));

    try {
      const updated = await updatePedidoRequest(id, payload);
      await fetchPedidos();

      if (selectedPedido?.id === Number(id)) {
        setSelectedPedido(updated);
      }

      return updated;
    } catch (updateError) {
      const message = updateError.message || "No se pudo editar el pedido.";
      setError((prev) => ({ ...prev, editPedido: message }));
      throw new Error(message);
    } finally {
      setLoading((prev) => ({ ...prev, editPedido: false }));
    }
  }

  async function changePedidoEstado(id, estado) {
    setLoading((prev) => ({ ...prev, updatePedido: true }));
    setError((prev) => ({ ...prev, updatePedido: null }));

    try {
      await updatePedidoEstado(id, estado);
      await fetchPedidos();

      if (selectedPedido?.id === Number(id)) {
        await fetchPedidoById(id);
      }
    } catch (updateError) {
      const message = updateError.message || "No se pudo actualizar el pedido.";
      setError((prev) => ({ ...prev, updatePedido: message }));
      throw new Error(message);
    } finally {
      setLoading((prev) => ({ ...prev, updatePedido: false }));
    }
  }

  useEffect(() => {
    fetchPedidos().catch(() => null);
  }, []);

  const value = useMemo(
    () => ({
      pedidos,
      selectedPedido,
      loading,
      error,
      fetchPedidos,
      fetchPedidoById,
      createPedido,
      editPedido,
      updatePedidoEstado: changePedidoEstado,
    }),
    [pedidos, selectedPedido, loading, error]
  );

  return <PedidosContext.Provider value={value}>{children}</PedidosContext.Provider>;
}
