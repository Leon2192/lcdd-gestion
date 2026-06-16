import { createContext, useCallback, useMemo, useState } from "react";
import { Box, CloseButton, Group, Paper, Portal, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

export const ToastContext = createContext(null);

const TOAST_DURATION = 3200;

function getToastColor(type) {
  if (type === "success") {
    return "green";
  }

  if (type === "error") {
    return "red";
  }

  return "brand";
}

function getToastIcon(type) {
  if (type === "success") {
    return <IconCircleCheck size={16} />;
  }

  if (type === "error") {
    return <IconAlertCircle size={16} />;
  }

  return <IconInfoCircle size={16} />;
}

function getToastStyles(type) {
  if (type === "success") {
    return {
      background: "#eefbf1",
      border: "1px solid rgba(34, 197, 94, 0.18)",
      iconBackground: "#dcfce7",
      iconColor: "#15803d",
    };
  }

  if (type === "error") {
    return {
      background: "#fff1f2",
      border: "1px solid rgba(239, 68, 68, 0.16)",
      iconBackground: "#ffe4e6",
      iconColor: "#b91c1c",
    };
  }

  return {
    background: "#eef5f7",
    border: "1px solid rgba(111, 143, 155, 0.18)",
    iconBackground: "#dce8ec",
    iconColor: "#24343a",
  };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "info", duration = TOAST_DURATION }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast = { id, title, message, type };

      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (title, message) => showToast({ title, message, type: "success" }),
      error: (title, message) => showToast({ title, message, type: "error" }),
      info: (title, message) => showToast({ title, message, type: "info" }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <Stack
          gap="sm"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 500,
            width: "min(360px, calc(100vw - 32px))",
          }}
        >
          {toasts.map((toast) => (
            <Paper
              key={toast.id}
              radius="lg"
              p="md"
              style={{
                background: getToastStyles(toast.type).background,
                border: getToastStyles(toast.type).border,
                boxShadow: "0 18px 40px rgba(36, 52, 58, 0.14)",
              }}
            >
              <Group align="flex-start" gap="sm" wrap="nowrap">
                <ThemeIcon
                  size={34}
                  radius="xl"
                  variant="light"
                  color={getToastColor(toast.type)}
                  style={{
                    background: getToastStyles(toast.type).iconBackground,
                    color: getToastStyles(toast.type).iconColor,
                    flexShrink: 0,
                  }}
                >
                  {getToastIcon(toast.type)}
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={700} size="sm" c="#24343a">
                    {toast.title}
                  </Text>
                  {toast.message ? (
                    <Text size="sm" c="#4d6771" mt={4} style={{ lineHeight: 1.45 }}>
                      {toast.message}
                    </Text>
                  ) : null}
                </Box>
                <CloseButton
                  aria-label="Cerrar notificación"
                  onClick={() => removeToast(toast.id)}
                  mt={-2}
                  style={{ flexShrink: 0 }}
                />
              </Group>
            </Paper>
          ))}
        </Stack>
      </Portal>
    </ToastContext.Provider>
  );
}
