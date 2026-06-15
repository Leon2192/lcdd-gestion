import { Card, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export default function ChartCard({ title, subtitle, children }) {
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Card p={{ base: "md", md: "lg" }} h="100%" bg="rgba(250, 252, 252, 0.96)">
      <Stack gap="md" h="100%">
        <div>
          <Text fw={700} fz={isMobile ? "md" : "lg"}>
            {title}
          </Text>
          {subtitle ? (
            <Text c="dimmed" fz="sm" mt={4}>
              {subtitle}
            </Text>
          ) : null}
        </div>
        <div style={{ flex: 1, minHeight: isMobile ? 220 : 260 }}>{children}</div>
      </Stack>
    </Card>
  );
}
