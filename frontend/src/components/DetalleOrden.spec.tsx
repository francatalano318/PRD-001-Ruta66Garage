import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetalleOrden } from './DetalleOrden';
import { Orden } from '../api/ordenes';
import { renderConSesion } from '../test-utils';
import { SesionContext } from '../auth/SesionContext';

const ORDEN_BASE: Orden = {
  id: 'abc-123',
  cliente: 'Juan Pérez',
  patente: 'AA123BB',
  descripcion: 'Ruido al frenar en curvas cerradas',
  categoria: 'Frenos',
  prioridad: 'Alta',
  estado: 'Abierta',
  categoriaAsignadaPorIa: true,
  prioridadAsignadaPorIa: true,
  observaciones: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  estadoActualizadoEn: '2026-01-01T00:00:00.000Z',
};

describe('DetalleOrden', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('muestra el indicador de categoría asignada por IA (RF-10 / AC-10)', () => {
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={jest.fn()} />);
    expect(screen.getByText('Categoría asignada por IA')).toBeInTheDocument();
  });

  it('muestra el indicador de prioridad asignada por IA (RF-11 / AC-11)', () => {
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={jest.fn()} />);
    expect(screen.getByText('Prioridad asignada por IA')).toBeInTheDocument();
  });

  it('no muestra ningún indicador de IA cuando la orden fue clasificada a mano', () => {
    renderConSesion(
      <DetalleOrden
        orden={{ ...ORDEN_BASE, categoriaAsignadaPorIa: false, prioridadAsignadaPorIa: false }}
        onOrdenActualizada={jest.fn()}
      />,
    );
    expect(screen.queryByText('Categoría asignada por IA')).not.toBeInTheDocument();
    expect(screen.queryByText('Prioridad asignada por IA')).not.toBeInTheDocument();
  });

  it('permite modificar la categoría asignada automáticamente (RF-08 / AC-08)', async () => {
    const ordenActualizada: Orden = {
      ...ORDEN_BASE,
      categoria: 'Electricidad',
      categoriaAsignadaPorIa: false,
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ordenActualizada,
    });

    const onOrdenActualizada = jest.fn();
    const user = userEvent.setup();
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={onOrdenActualizada} />);

    await user.selectOptions(screen.getByLabelText('Categoría'), 'Electricidad');
    await user.click(screen.getByRole('button', { name: 'Guardar categoría' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/ordenes/abc-123/categoria',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ categoria: 'Electricidad' }),
      }),
    );
    expect(onOrdenActualizada).toHaveBeenCalledWith(ordenActualizada);
  });

  it('permite modificar la prioridad asignada automáticamente (RF-09 / AC-09)', async () => {
    const ordenActualizada: Orden = {
      ...ORDEN_BASE,
      prioridad: 'Baja',
      prioridadAsignadaPorIa: false,
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ordenActualizada,
    });

    const onOrdenActualizada = jest.fn();
    const user = userEvent.setup();
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={onOrdenActualizada} />);

    await user.selectOptions(screen.getByLabelText('Prioridad'), 'Baja');
    await user.click(screen.getByRole('button', { name: 'Guardar prioridad' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/ordenes/abc-123/prioridad',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ prioridad: 'Baja' }),
      }),
    );
    expect(onOrdenActualizada).toHaveBeenCalledWith(ordenActualizada);
  });

  it('muestra un error si falla el guardado de la categoría', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={jest.fn()} />);

    await user.selectOptions(screen.getByLabelText('Categoría'), 'Motor');
    await user.click(screen.getByRole('button', { name: 'Guardar categoría' }));

    expect(
      await screen.findByText('No se pudo completar la operación. Intentá de nuevo en unos segundos.'),
    ).toBeInTheDocument();
  });

  it('cierra la sesión cuando el backend responde 401 al guardar', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const cerrarSesion = jest.fn();
    const user = userEvent.setup();
    render(
      <SesionContext.Provider
        value={{ token: 'token-vencido', iniciarSesion: jest.fn(), cerrarSesion }}
      >
        <DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={jest.fn()} />
      </SesionContext.Provider>,
    );

    await user.selectOptions(screen.getByLabelText('Categoría'), 'Motor');
    await user.click(screen.getByRole('button', { name: 'Guardar categoría' }));

    await waitFor(() => expect(cerrarSesion).toHaveBeenCalledTimes(1));
  });

  it('permite cambiar el estado de la orden (RF-17 / AC-17)', async () => {
    const ordenActualizada: Orden = {
      ...ORDEN_BASE,
      estado: 'En diagnóstico',
      estadoActualizadoEn: '2026-01-02T00:00:00.000Z',
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ordenActualizada,
    });

    const onOrdenActualizada = jest.fn();
    const user = userEvent.setup();
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={onOrdenActualizada} />);

    await user.selectOptions(screen.getByLabelText('Estado'), 'En diagnóstico');
    await user.click(screen.getByRole('button', { name: 'Guardar estado' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/ordenes/abc-123/estado',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ estado: 'En diagnóstico' }),
      }),
    );
    expect(onOrdenActualizada).toHaveBeenCalledWith(ordenActualizada);
  });

  it('permite agregar observaciones a la orden (RF-19 / AC-19)', async () => {
    const ordenActualizada: Orden = {
      ...ORDEN_BASE,
      observaciones: 'El cliente confirma disponibilidad para retirar el vehículo.',
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ordenActualizada,
    });

    const onOrdenActualizada = jest.fn();
    const user = userEvent.setup();
    renderConSesion(<DetalleOrden orden={ORDEN_BASE} onOrdenActualizada={onOrdenActualizada} />);

    await user.type(
      screen.getByLabelText('Observaciones'),
      'El cliente confirma disponibilidad para retirar el vehículo.',
    );
    await user.click(screen.getByRole('button', { name: 'Guardar observaciones' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/ordenes/abc-123/observaciones',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          observaciones: 'El cliente confirma disponibilidad para retirar el vehículo.',
        }),
      }),
    );
    expect(onOrdenActualizada).toHaveBeenCalledWith(ordenActualizada);
  });

  it('pisa la observación anterior con la nueva al editar', () => {
    renderConSesion(
      <DetalleOrden
        orden={{ ...ORDEN_BASE, observaciones: 'Observación previa' }}
        onOrdenActualizada={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Observaciones')).toHaveValue('Observación previa');
  });
});
