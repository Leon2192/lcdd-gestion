import { createContext, useEffect, useMemo, useState } from "react";
import {
  getConsultas,
  createConsulta as createConsultaRequest,
} from "../services/consultasService";
import {
  getObjetivos,
  createObjetivo as createObjetivoRequest,
  updateObjetivo,
} from "../services/objetivosService";

export const DashboardContext = createContext(null);

const initialLoading = {
  consultas: false,
  objetivos: false,
  createConsulta: false,
  createObjetivo: false,
  updateObjetivo: false,
};

const initialErrors = {
  consultas: null,
  objetivos: null,
  createConsulta: null,
  createObjetivo: null,
  updateObjetivo: null,
};

export function DashboardProvider({ children }) {
  const [consultas, setConsultas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [loading, setLoading] = useState(initialLoading);
  const [errors, setErrors] = useState(initialErrors);

  async function loadConsultas() {
    setLoading((prev) => ({ ...prev, consultas: true }));
    setErrors((prev) => ({ ...prev, consultas: null }));

    try {
      const data = await getConsultas();
      setConsultas(data);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        consultas: error.message || "No se pudieron cargar las consultas.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, consultas: false }));
    }
  }

  async function loadObjetivos() {
    setLoading((prev) => ({ ...prev, objetivos: true }));
    setErrors((prev) => ({ ...prev, objetivos: null }));

    try {
      const data = await getObjetivos();
      setObjetivos(data);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        objetivos: error.message || "No se pudieron cargar los objetivos.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, objetivos: false }));
    }
  }

  async function createConsulta(payload) {
    setLoading((prev) => ({ ...prev, createConsulta: true }));
    setErrors((prev) => ({ ...prev, createConsulta: null }));

    try {
      const created = await createConsultaRequest(payload);
      await loadConsultas();
      return created;
    } catch (error) {
      const message = error.message || "No se pudo crear la consulta.";
      setErrors((prev) => ({ ...prev, createConsulta: message }));
      throw new Error(message);
    } finally {
      setLoading((prev) => ({ ...prev, createConsulta: false }));
    }
  }

  async function createObjetivo(payload) {
    setLoading((prev) => ({ ...prev, createObjetivo: true }));
    setErrors((prev) => ({ ...prev, createObjetivo: null }));

    try {
      const created = await createObjetivoRequest(payload);
      await loadObjetivos();
      return created;
    } catch (error) {
      const message = error.message || "No se pudo crear el objetivo.";
      setErrors((prev) => ({ ...prev, createObjetivo: message }));
      throw new Error(message);
    } finally {
      setLoading((prev) => ({ ...prev, createObjetivo: false }));
    }
  }

  async function changeObjetivoEstado(id, estado) {
    setLoading((prev) => ({ ...prev, updateObjetivo: true }));
    setErrors((prev) => ({ ...prev, updateObjetivo: null }));

    try {
      const objetivoActual = objetivos.find((objetivo) => objetivo.id === id);

      if (!objetivoActual) {
        throw new Error("No se encontro el objetivo a actualizar.");
      }

      const updated = await updateObjetivo(id, {
        ...objetivoActual,
        estado,
      });
      await loadObjetivos();
      return updated;
    } catch (error) {
      const message = error.message || "No se pudo actualizar el objetivo.";
      setErrors((prev) => ({ ...prev, updateObjetivo: message }));
      throw new Error(message);
    } finally {
      setLoading((prev) => ({ ...prev, updateObjetivo: false }));
    }
  }

  useEffect(() => {
    async function bootstrap() {
      await Promise.allSettled([loadConsultas(), loadObjetivos()]);
    }

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      consultas,
      objetivos,
      loading,
      errors,
      loadConsultas,
      loadObjetivos,
      createConsulta,
      createObjetivo,
      changeObjetivoEstado,
    }),
    [consultas, objetivos, loading, errors]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
