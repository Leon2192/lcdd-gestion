import { Card, Group, RingProgress, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export default function StatCard({
  title,
  value,
  subtitle,
  progress,
  color = "brand.4",
  compact = false,
}) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const cardPadding = compact ? { base: "sm", md: "md" } : { base: "md", md: "lg" };
  const titleSize = compact ? 11 : 12;
  const valueSize = compact ? { base: 24, md: 29 } : { base: 28, md: 34 };
  const subtitleSize = compact ? "xs" : "sm";
  const ringSize = compact ? (isMobile ? 66 : 76) : isMobile ? 74 : 88;
  const ringThickness = compact ? 9 : 10;

  return (
    <Card p={cardPadding} bg="rgba(250, 252, 252, 0.96)">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Text c="dimmed" tt="uppercase" fw={700} fz={titleSize}>
            {title}
          </Text>
          <Text fz={valueSize} fw={700} lh={1}>
            {value}
          </Text>
          {subtitle ? (
            <Text c="dimmed" fz={subtitleSize}>
              {subtitle}
            </Text>
          ) : null}
        </Stack>
        {typeof progress === "number" ? (
          <RingProgress
            size={ringSize}
            thickness={ringThickness}
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
