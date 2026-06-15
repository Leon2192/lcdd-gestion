import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardProvider } from "./context/DashboardContext";
import { PedidosProvider } from "./context/PedidosContext";
import AppLayout from "./layouts/AppLayout";
import ConsultasPage from "./pages/ConsultasPage";
import LoginPage from "./pages/LoginPage";
import PedidoDetailPage from "./pages/PedidoDetailPage";
import PedidosPage from "./pages/PedidosPage";
import ObjetivosPage from "./pages/ObjetivosPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardProvider>
              <PedidosProvider>
                <AppLayout />
              </PedidosProvider>
            </DashboardProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/consultas" replace />} />
        <Route path="/consultas" element={<ConsultasPage />} />
        <Route path="/objetivos" element={<ObjetivosPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/pedidos/:id" element={<PedidoDetailPage />} />
      </Route>
    </Routes>
  );
}
