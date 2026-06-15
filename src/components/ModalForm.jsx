import { Button, Drawer, Group, ScrollArea } from "@mantine/core";
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
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{
        content: {
          maxHeight: isMobile ? "100dvh" : undefined,
        },
        body: {
          overflowY: "auto",
          paddingBottom: isMobile ? 24 : undefined,
        },
      }}
    >
      <form onSubmit={onSubmit}>
        {children}
        <Group justify="flex-end" mt="xl" grow={isMobile}>
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
