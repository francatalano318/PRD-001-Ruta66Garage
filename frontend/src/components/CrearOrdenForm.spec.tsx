import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrearOrdenForm } from './CrearOrdenForm';
import { renderConSesion } from '../test-utils';
import { SesionContext } from '../auth/SesionContext';

async function completarFormulario(
  user: ReturnType<typeof userEvent.setup>,
  datos: { cliente?: string; patente?: string; descripcion?: string },
) {
  if (datos.cliente !== undefined) {
    await user.type(screen.getByLabelText('Cliente'), datos.cliente);
  }
  if (datos.patente !== undefined) {
    await user.type(screen.getByLabelText('Patente'), datos.patente);
  }
  if (datos.descripcion !== undefined) {
    await user.type(
      screen.getByLabelText('Descripción de la incidencia'),
      datos.descripcion,
    );
  }
}

describe('CrearOrdenForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('muestra error de validación cuando la patente está vacía, sin llamar al backend (RF-20)', async () => {
    const user = userEvent.setup();
    renderConSesion(<CrearOrdenForm />);

    await completarFormulario(user, {
      cliente: 'Juan Pérez',
      descripcion: 'Ruido al frenar en curvas cerradas',
    });
    await user.click(screen.getByRole('button', { name: /crear orden/i }));

    expect(await screen.findByText('La patente es obligatoria.')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('muestra error de validación cuando la descripción tiene menos de 10 caracteres (RF-21)', async () => {
    const user = userEvent.setup();
    renderConSesion(<CrearOrdenForm />);

    await completarFormulario(user, {
      cliente: 'Juan Pérez',
      patente: 'AA123BB',
      descripcion: 'Corta',
    });
    await user.click(screen.getByRole('button', { name: /crear orden/i }));

    expect(await screen.findByText(/La descripción es inválida/)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('crea la orden y muestra la confirmación cuando los datos son válidos (AC-03)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'abc-123',
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
        categoria: 'Frenos',
        prioridad: 'Alta',
        estado: 'Abierta',
        categoriaAsignadaPorIa: true,
        prioridadAsignadaPorIa: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });

    const user = userEvent.setup();
    renderConSesion(<CrearOrdenForm />);

    await completarFormulario(user, {
      cliente: 'Juan Pérez',
      patente: 'AA123BB',
      descripcion: 'Ruido al frenar en curvas cerradas',
    });
    await user.click(screen.getByRole('button', { name: /crear orden/i }));

    expect(
      await screen.findByText('Orden abc-123 creada correctamente.'),
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el aviso de RF-22 cuando la clasificación automática no pudo completarse', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'def-456',
        cliente: 'Juan Pérez',
        patente: 'AA123BB',
        descripcion: 'Ruido al frenar en curvas cerradas',
        categoria: 'Sin clasificar',
        prioridad: 'Sin asignar',
        estado: 'Abierta',
        categoriaAsignadaPorIa: false,
        prioridadAsignadaPorIa: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        clasificacionAutomatica: {
          completada: false,
          mensaje: 'La clasificación automática no pudo completarse.',
        },
      }),
    });

    const user = userEvent.setup();
    renderConSesion(<CrearOrdenForm />);

    await completarFormulario(user, {
      cliente: 'Juan Pérez',
      patente: 'AA123BB',
      descripcion: 'Ruido al frenar en curvas cerradas',
    });
    await user.click(screen.getByRole('button', { name: /crear orden/i }));

    expect(
      await screen.findByText('La clasificación automática no pudo completarse.'),
    ).toBeInTheDocument();
  });

  it('muestra el mensaje de error general cuando el backend responde con un fallo no controlado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    renderConSesion(<CrearOrdenForm />);

    await completarFormulario(user, {
      cliente: 'Juan Pérez',
      patente: 'AA123BB',
      descripcion: 'Ruido al frenar en curvas cerradas',
    });
    await user.click(screen.getByRole('button', { name: /crear orden/i }));

    expect(
      await screen.findByText('No se pudo completar la operación. Intentá de nuevo en unos segundos.'),
    ).toBeInTheDocument();
  });

  it('cierra la sesión cuando el backend responde 401 (token inválido o expirado)', async () => {
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
        <CrearOrdenForm />
      </SesionContext.Provider>,
    );

    await completarFormulario(user, {
      cliente: 'Juan Pérez',
      patente: 'AA123BB',
      descripcion: 'Ruido al frenar en curvas cerradas',
    });
    await user.click(screen.getByRole('button', { name: /crear orden/i }));

    await waitFor(() => expect(cerrarSesion).toHaveBeenCalledTimes(1));
  });
});
