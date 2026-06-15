import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
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
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { IconBrandWhatsapp, IconInfoCircle, IconPencil } from "@tabler/icons-react";
import DataTable from "../components/DataTable";
import FloatingActionButton from "../components/FloatingActionButton";
import ModalForm from "../components/ModalForm";
import StatCard from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";
import { formatDate, normalizePhone } from "../lib/formatters";
import { productOptions } from "../lib/productOptions";

const initialForm = {
  fecha: "",
  nombre: "",
  articulo: "",
  telefono: "",
  observaciones: "",
};

export default function ConsultasPage() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { consultas, loading, errors, createConsulta, updateConsulta } = useDashboard();
  const [opened, setOpened] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    articulo: "",
  });

  const columns = [
    { key: "fecha", label: "Fecha" },
    { key: "nombre", label: "Nombre" },
    { key: "articulo", label: "Articulo" },
    { key: "telefono", label: "Telefono / WhatsApp" },
    { key: "acciones", label: "Acciones" },
  ];

  const filteredConsultas = useMemo(() => {
    return consultas.filter((consulta) => {
      const [fromDate, toDate] = filters.dateRange;
      const consultaDate = new Date(`${consulta.fecha}T00:00:00`);

      if (fromDate && consultaDate < fromDate) {
        return false;
      }

      if (toDate && consultaDate > toDate) {
        return false;
      }

      if (filters.articulo && consulta.articulo !== filters.articulo) {
        return false;
      }

      return true;
    });
  }, [consultas, filters]);

  const consultasHoy = filteredConsultas.filter((consulta) => {
    const today = new Date().toISOString().slice(0, 10);
    return consulta.fecha === today;
  }).length;

  const articulosUnicos = new Set(filteredConsultas.map((consulta) => consulta.articulo)).size;

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingConsulta(null);
    setFormError("");
  }

  function resetFilters() {
    setFilters({
      dateRange: [null, null],
      articulo: "",
    });
  }

  function handleEditConsulta(consulta) {
    setEditingConsulta(consulta);
    setForm({
      fecha: consulta.fecha || "",
      nombre: consulta.nombre || "",
      articulo: consulta.articulo || "",
      telefono: consulta.telefono || "",
      observaciones: consulta.observaciones || "",
    });
    setFormError("");
    setOpened(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fecha) {
      setFormError("La fecha es obligatoria.");
      return;
    }

    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    if (!form.articulo.trim()) {
      setFormError("El artículo es obligatorio.");
      return;
    }

    if (!form.telefono.trim()) {
      setFormError("El teléfono es obligatorio.");
      return;
    }

    try {
      if (editingConsulta) {
        await updateConsulta(editingConsulta.id, form);
      } else {
        await createConsulta(form);
      }
      resetForm();
      setOpened(false);
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <Stack gap="lg" className="fab-safe-area">
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Consultas totales"
            value={filteredConsultas.length}
            subtitle="Resultados según filtros activos."
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Consultas de hoy"
            value={consultasHoy}
            subtitle="Seguimiento inmediato para el equipo comercial."
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Articulos consultados"
            value={articulosUnicos}
            subtitle="Variedad de productos con interés activo."
          />
        </Grid.Col>
      </Grid>

      <Stack gap="xs">
        <Title order={2}>Registro de consultas</Title>
        <Text c="dimmed">
          Cada ingreso queda centralizado con acceso rápido a WhatsApp para responder sin salir del flujo.
        </Text>
      </Stack>

      <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={700}>Filtros</Text>
              <Text c="dimmed" fz="sm">
                Podés combinar rango de fechas y producto.
              </Text>
            </div>
            <Button type="button" variant="default" onClick={resetFilters} fullWidth={isMobile}>
              Limpiar filtros
            </Button>
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <DatePickerInput
                type="range"
                label="Rango de fechas"
                placeholder="Seleccioná un período"
                value={filters.dateRange}
                onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                valueFormat="DD/MM/YYYY"
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Select
                label="Producto"
                data={productOptions}
                value={filters.articulo}
                onChange={(value) => setFilters((prev) => ({ ...prev, articulo: value || "" }))}
                placeholder="Todos los productos"
                searchable
                clearable
                nothingFoundMessage="No hay coincidencias"
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {errors.consultas ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {errors.consultas}
        </Alert>
      ) : null}

      {isMobile ? (
        <Stack className="mobile-list">
          {loading.consultas ? (
            <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
              <Text c="dimmed" ta="center">
                Cargando consultas...
              </Text>
            </Card>
          ) : filteredConsultas.length ? (
            filteredConsultas.map((consulta) => {
              const phone = normalizePhone(consulta.telefono);

              return (
                <Card key={consulta.id} p="md" bg="rgba(250, 252, 252, 0.96)">
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="wrap">
                      <div>
                        <Text fw={700}>{consulta.nombre}</Text>
                        <Text c="dimmed" fz="sm">
                          {consulta.articulo}
                        </Text>
                      </div>
                      <Text c="dimmed" fz="sm">
                        {formatDate(consulta.fecha)}
                      </Text>
                    </Group>
                    <Text fz="sm">{consulta.telefono}</Text>
                    {phone ? (
                      <Stack gap="xs">
                        <Button
                          component="a"
                          href={`https://wa.me/${phone}`}
                          target="_blank"
                          rel="noreferrer"
                          variant="light"
                          color="green"
                          fullWidth
                          leftSection={<IconBrandWhatsapp size={16} />}
                        >
                          Abrir WhatsApp
                        </Button>
                        <Button
                          variant="default"
                          fullWidth
                          leftSection={<IconPencil size={16} />}
                          onClick={() => handleEditConsulta(consulta)}
                        >
                          Editar consulta
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="default"
                        fullWidth
                        leftSection={<IconPencil size={16} />}
                        onClick={() => handleEditConsulta(consulta)}
                      >
                        Editar consulta
                      </Button>
                    )}
                  </Stack>
                </Card>
              );
            })
          ) : (
            <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
              <Text c="dimmed" ta="center">
                No hay consultas para los filtros seleccionados.
              </Text>
            </Card>
          )}
        </Stack>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredConsultas}
          loading={loading.consultas}
          emptyMessage="No hay consultas para los filtros seleccionados."
          renderRow={(consulta) => {
            const phone = normalizePhone(consulta.telefono);

            return (
              <Table.Tr key={consulta.id}>
                <Table.Td>{formatDate(consulta.fecha)}</Table.Td>
                <Table.Td>{consulta.nombre}</Table.Td>
                <Table.Td>{consulta.articulo}</Table.Td>
                <Table.Td>{consulta.telefono}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {phone ? (
                      <Button
                        component="a"
                        href={`https://wa.me/${phone}`}
                        target="_blank"
                        rel="noreferrer"
                        variant="light"
                        color="green"
                        size="xs"
                        leftSection={<IconBrandWhatsapp size={16} />}
                      >
                        Abrir WhatsApp
                      </Button>
                    ) : null}
                    <Button
                      variant="default"
                      size="xs"
                      leftSection={<IconPencil size={16} />}
                      onClick={() => handleEditConsulta(consulta)}
                    >
                      Editar
                    </Button>
                    {!phone ? (
                      <Text c="dimmed" fz="sm">
                        Sin numero valido
                      </Text>
                    ) : null}
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          }}
        />
      )}

      <ModalForm
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title={editingConsulta ? `Editar consulta #${editingConsulta.id}` : "Nueva consulta"}
        onSubmit={handleSubmit}
        submitLabel={editingConsulta ? "Guardar cambios" : "Guardar consulta"}
        loading={editingConsulta ? loading.updateConsulta : loading.createConsulta}
      >
        <Stack gap="md">
          {formError ? (
            <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
              {formError}
            </Alert>
          ) : null}
          <TextInput
            label="Fecha"
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            required
          />
          <TextInput
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="Nombre del cliente"
            required
          />
          <Select
            label="Articulo consultado"
            data={productOptions}
            value={form.articulo}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, articulo: value || "" }));
              setFormError("");
            }}
            placeholder="Seleccioná un articulo"
            searchable
            nothingFoundMessage="No hay coincidencias"
            required
          />
          <TextInput
            label="Telefono / WhatsApp"
            name="telefono"
            value={form.telefono}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="54911..."
            required
          />
          <Textarea
            label="Observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="Notas de contexto opcionales"
            minRows={4}
          />
        </Stack>
      </ModalForm>

      {!opened ? (
        <FloatingActionButton
          label="Cargar consulta"
          onClick={() => {
            resetForm();
            setOpened(true);
          }}
        />
      ) : null}
    </Stack>
  );
}
