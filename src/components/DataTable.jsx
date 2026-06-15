import {
  Center,
  Loader,
  Paper,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";

export default function DataTable({
  columns,
  rows,
  renderRow,
  loading,
  tableMinWidth = 720,
  emptyMessage = "No hay datos cargados todavía.",
}) {
  return (
    <Paper p={{ base: "sm", md: "md" }}>
      <ScrollArea>
        <Table
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="md"
          miw={tableMinWidth}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key}>
                  <Text fw={700} c="dimmed" tt="uppercase" fz={12}>
                    {column.label}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl">
                    <Loader color="brand" />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length ? (
              rows.map(renderRow)
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text c="dimmed" py="lg" ta="center">
                    {emptyMessage}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
