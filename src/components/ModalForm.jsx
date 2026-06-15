import { Button, Drawer, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export default function ModalForm({
  opened,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Guardar",
  loading = false,
  size = "md",
}) {
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      position={isMobile ? "bottom" : "right"}
      size={isMobile ? "100%" : size}
      overlayProps={{ blur: 2 }}
      padding={isMobile ? "md" : "xl"}
      styles={{
        content: {
          height: isMobile ? "100dvh" : "100vh",
          maxHeight: "100dvh",
        },
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          paddingBottom: 0,
        },
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingBottom: 24,
            paddingRight: isMobile ? 0 : 4,
          }}
        >
          {children}
        </div>
        <Group
          justify="flex-end"
          mt="md"
          grow={isMobile}
          style={{
            flexShrink: 0,
            paddingTop: 12,
            paddingBottom: isMobile ? 24 : 0,
            background: "rgba(249, 252, 252, 0.98)",
            borderTop: "1px solid rgba(111, 143, 155, 0.16)",
          }}
        >
          <Button type="button" variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} h={44}>
            {submitLabel}
          </Button>
        </Group>
      </form>
    </Drawer>
  );
}
