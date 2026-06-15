import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import FloatingActionButton from "../components/FloatingActionButton";
import ModalForm from "../components/ModalForm";
import StatCard from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";
import { formatDate, formatMonthLabel, getCurrentMonth } from "../lib/formatters";

const statusOptions = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_progreso", label: "En progreso" },
  { value: "cumplido", label: "Cumplido" },
];

const statusColors = {
  pendiente: "brand.2",
  en_progreso: "brand.4",
  cumplido: "brand.7",
};

const statusChartColors = {
  pendiente: "#dce8ec",
  en_progreso: "#afc5ce",
  cumplido: "#6f8f9b",
};

const initialForm = {
  mes: getCurrentMonth(),
  titulo: "",
  descripcion: "",
  estado: "pendiente",
  deadline: "",
};

export default function ObjetivosPage() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { objetivos, loading, errors, createObjetivo, changeObjetivoEstado } = useDashboard();
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const monthOptions = useMemo(() => {
    const values = Array.from(new Set([getCurrentMonth(), ...objetivos.map((item) => item.mes)]));
    return values
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a))
      .map((month) => ({ value: month, label: formatMonthLabel(month) }));
  }, [objetivos]);

  const objetivosDelMes = useMemo(
    () => objetivos.filter((objetivo) => objetivo.mes === selectedMonth),
    [objetivos, selectedMonth]
  );

  const stats = useMemo(() => {
    const total = objetivosDelMes.length;
    const cumplidos = objetivosDelMes.filter((item) => item.estado === "cumplido").length;
    const pendientes = objetivosDelMes.filter((item) => item.estado === "pendiente").length;
    const enProgreso = objetivosDelMes.filter((item) => item.estado === "en_progreso").length;
    const porcentaje = total ? Math.round((cumplidos / total) * 100) : 0;

    return { total, cumplidos, pendientes, enProgreso, porcentaje };
  }, [objetivosDelMes]);

  const progressData = useMemo(() => {
    const grouped = objetivos.reduce((acc, objetivo) => {
      if (!acc[objetivo.mes]) {
        acc[objetivo.mes] = { mes: objetivo.mes, cumplidos: 0, total: 0 };
      }

      acc[objetivo.mes].total += 1;
      if (objetivo.estado === "cumplido") {
        acc[objetivo.mes].cumplidos += 1;
      }

      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map((item) => ({
        name: formatMonthLabel(item.mes),
        Cumplidos: item.cumplidos,
        Total: item.total,
      }));
  }, [objetivos]);

  const statusData = useMemo(
    () => [
      { name: "Pendientes", value: stats.pendientes, color: statusChartColors.pendiente },
      { name: "En progreso", value: stats.enProgreso, color: statusChartColors.en_progreso },
      { name: "Cumplidos", value: stats.cumplidos, color: statusChartColors.cumplido },
    ].filter((item) => item.value > 0),
    [stats]
  );

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value || "" }));
  }

  function resetForm() {
    setForm(initialForm);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.mes) {
      setFormError("El mes es obligatorio.");
      return;
    }

    if (!form.titulo.trim()) {
      setFormError("El título del objetivo es obligatorio.");
      return;
    }

    if (!form.estado) {
      setFormError("El estado es obligatorio.");
      return;
    }

    try {
      await createObjetivo(form);
      setSelectedMonth(form.mes);
      resetForm();
      setOpened(false);
    } catch (error) {
      setFormError(error.message);
    }
  }

  const columns = [
    { key: "mes", label: "Mes" },
    { key: "titulo", label: "Objetivo" },
    { key: "descripcion", label: "Descripcion" },
    { key: "estado", label: "Estado" },
    { key: "deadline", label: "Deadline" },
  ];

  return (
    <Stack gap="lg" className="fab-safe-area">
      <Group justify="space-between" align="flex-end" gap="md">
        <div>
          <Title order={2}>Objetivos mensuales</Title>
          <Text c="dimmed">
            Visualizá foco, avance y cumplimiento con métricas que se recalculan automáticamente.
          </Text>
        </div>
        <Select
          label="Mes analizado"
          data={monthOptions}
          value={selectedMonth}
          onChange={(value) => setSelectedMonth(value || getCurrentMonth())}
          w={{ base: "100%", sm: 240 }}
        />
      </Group>

      {errors.objetivos ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {errors.objetivos}
        </Alert>
      ) : null}

      {errors.updateObjetivo ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {errors.updateObjetivo}
        </Alert>
      ) : null}

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Total del mes"
            value={stats.total}
            subtitle={formatMonthLabel(selectedMonth)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard title="Cumplidos" value={stats.cumplidos} subtitle="Objetivos cerrados" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="En progreso"
            value={stats.enProgreso}
            subtitle="Metas activas"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Cumplimiento"
            value={`${stats.porcentaje}%`}
            subtitle="Porcentaje mensual"
            progress={stats.porcentaje}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <ChartCard
            title="Progreso mensual"
            subtitle="Comparación entre objetivos totales y cumplidos por mes."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce8ec" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="Total" fill="#dce8ec" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Cumplidos" fill="#6f8f9b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <ChartCard
            title="Estado actual"
            subtitle={`Distribución de ${formatMonthLabel(selectedMonth)}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 52 : 70}
                  outerRadius={isMobile ? 82 : 102}
                  paddingAngle={4}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid.Col>
      </Grid>

      <DataTable
        columns={columns}
        rows={objetivosDelMes}
        loading={loading.objetivos}
        emptyMessage="Todavía no hay objetivos cargados para este mes."
        renderRow={(objetivo) => (
          <Table.Tr key={objetivo.id}>
            <Table.Td>{formatMonthLabel(objetivo.mes)}</Table.Td>
            <Table.Td>{objetivo.titulo}</Table.Td>
            <Table.Td>{objetivo.descripcion}</Table.Td>
            <Table.Td>
              <Select
                data={statusOptions}
                value={objetivo.estado}
                onChange={async (value) => {
                  if (!value) {
                    return;
                  }

                  try {
                    await changeObjetivoEstado(objetivo.id, value);
                  } catch {}
                }}
                allowDeselect={false}
                size="xs"
                disabled={loading.updateObjetivo}
                styles={{
                  input: {
                    borderColor: "#dce8ec",
                  },
                }}
              />
              <Badge color={statusColors[objetivo.estado]} variant="light" mt={8}>
                {statusOptions.find((item) => item.value === objetivo.estado)?.label || objetivo.estado}
              </Badge>
            </Table.Td>
            <Table.Td>{formatDate(objetivo.deadline)}</Table.Td>
          </Table.Tr>
        )}
      />

      <ModalForm
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title="Nuevo objetivo mensual"
        onSubmit={handleSubmit}
        submitLabel="Guardar objetivo"
        loading={loading.createObjetivo}
        size={isMobile ? "100%" : "md"}
      >
        <Stack gap="md">
          {formError ? (
            <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
              {formError}
            </Alert>
          ) : null}
          <TextInput
            label="Mes"
            type="month"
            name="mes"
            value={form.mes}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            required
          />
          <TextInput
            label="Titulo del objetivo"
            name="titulo"
            value={form.titulo}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="Ej. Mejorar conversion de consultas"
            required
          />
          <Textarea
            label="Descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            minRows={4}
          />
          <Select
            label="Estado inicial"
            data={statusOptions}
            value={form.estado}
            onChange={(value) => {
              handleSelectChange("estado", value);
              setFormError("");
            }}
            allowDeselect={false}
            required
          />
          <TextInput
            label="Deadline"
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
          />
        </Stack>
      </ModalForm>

      <FloatingActionButton
        label="+ Cargar objetivo mensual"
        onClick={() => setOpened(true)}
      />
    </Stack>
  );
}
