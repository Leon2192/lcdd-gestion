import { Center, Loader, Stack, Text } from "@mantine/core";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Center mih="100vh">
        <Stack align="center" gap="sm">
          <Loader color="brand" />
          <Text c="dimmed">Verificando sesión...</Text>
        </Stack>
      </Center>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
