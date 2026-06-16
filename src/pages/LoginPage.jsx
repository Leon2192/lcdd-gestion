import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Center,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconLogin2 } from "@tabler/icons-react";
import { Navigate, useNavigate } from "react-router-dom";
import logoLcdd from "../assets/logo-lcdd.png";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function LoginPage() {
  const { session, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/consultas" replace />;
  }

  if (loading) {
    return (
      <Center mih="100vh">
        <Stack align="center" gap="sm">
          <Loader color="brand" />
          <Text c="dimmed">Cargando acceso...</Text>
        </Stack>
      </Center>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Completá email y contraseña para ingresar.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      toast.success("Sesión iniciada", "Bienvenido al dashboard de LCDD.");
      navigate("/consultas", { replace: true });
    } catch (loginError) {
      toast.error("No se pudo iniciar sesión", loginError.message || "Revisá tus credenciales.");
      setError(loginError.message || "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      mih="100dvh"
      px={{ base: "sm", sm: "lg" }}
      py={{ base: "md", sm: "xl" }}
      style={{
        background:
          "radial-gradient(circle at top left, rgba(175, 197, 206, 0.18), transparent 28%), linear-gradient(180deg, #fbfcfd 0%, #f1f6f7 100%)",
      }}
    >
      <Center mih="calc(100dvh - 32px)">
        <Paper
          w="100%"
          maw={440}
          p={{ base: "lg", sm: 36 }}
          radius="28px"
          bg="rgba(252, 253, 253, 0.94)"
          style={{
            border: "1px solid rgba(111, 143, 155, 0.16)",
            boxShadow: "0 24px 60px rgba(111, 143, 155, 0.12)",
          }}
        >
          <Stack gap="lg">
            <Stack align="center" gap="sm">
              <img
                src={logoLcdd}
                alt="La Casa del Detalle"
                className="brand-logo"
              />
              <Stack gap={4} align="center">
                <Text tt="uppercase" fw={700} fz={12} c="dimmed">
                  LCDD Dashboard
                </Text>
                <Title order={1} ta="center">
                  Iniciar sesión
                </Title>
                <Text c="dimmed" ta="center" fz={{ base: "sm", sm: "md" }}>
                  Accedé al panel interno con tu usuario creado en Supabase.
                </Text>
              </Stack>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {error ? (
                  <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    {error}
                  </Alert>
                ) : null}
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="tuemail@empresa.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.currentTarget.value);
                    setError("");
                  }}
                  required
                />
                <PasswordInput
                  label="Contraseña"
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.currentTarget.value);
                    setError("");
                  }}
                  required
                />
                <Button
                  type="submit"
                  size="md"
                  h={46}
                  fullWidth
                  loading={submitting}
                  leftSection={<IconLogin2 size={18} />}
                  styles={{
                    root: {
                      background: "#afc5ce",
                      color: "#24343a",
                    },
                  }}
                >
                  Ingresar
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}
