import { Card, Group, RingProgress, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export default function StatCard({ title, value, subtitle, progress, color = "brand.4" }) {
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Card p={{ base: "md", md: "lg" }} bg="rgba(250, 252, 252, 0.96)">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Text c="dimmed" tt="uppercase" fw={700} fz={12}>
            {title}
          </Text>
          <Text fz={{ base: 28, md: 34 }} fw={700} lh={1}>
            {value}
          </Text>
          {subtitle ? (
            <Text c="dimmed" fz="sm">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
        {typeof progress === "number" ? (
          <RingProgress
            size={isMobile ? 74 : 88}
            thickness={10}
            roundCaps
            sections={[{ value: progress, color }]}
            label={
              <Text ta="center" fw={700} fz="sm">
                {progress}%
              </Text>
            }
          />
        ) : null}
      </Group>
    </Card>
  );
}
