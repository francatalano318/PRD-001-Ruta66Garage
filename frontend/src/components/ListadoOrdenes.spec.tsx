import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ListadoOrdenes } from './ListadoOrdenes';
import { SesionProvider } from '../auth/SesionContext';
import { Orden } from '../api/ordenes';

function renderListado() {
  return render(
    <SesionProvider>
      <MemoryRouter>
        <ListadoOrdenes />
      </MemoryRouter>
    </SesionProvider>,
  );
}

const ORDEN: Orden = {
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

function mockListado(respuesta: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => respuesta,
  });
}

describe('ListadoOrdenes', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('muestra las órdenes de la primera página (RF-12)', async () => {
    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    renderListado();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ordenes?pagina=1'),
      expect.anything(),
    );
  });

  it('vuelve a pedir el listado al filtrar por estado (RF-13 / AC-13)', async () => {
    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    const user = userEvent.setup();
    renderListado();
    await screen.findByText('Juan Pérez');

    mockListado({ ordenes: [], total: 0, pagina: 1, totalPaginas: 1 });
    await user.selectOptions(screen.getByLabelText('Estado'), 'Reparando');

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('estado=Reparando'),
        expect.anything(),
      ),
    );
  });

  it('vuelve a pedir el listado al filtrar por categoría (RF-14 / AC-14)', async () => {
    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    const user = userEvent.setup();
    renderListado();
    await screen.findByText('Juan Pérez');

    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Frenos');

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('categoria=Frenos'),
        expect.anything(),
      ),
    );
  });

  it('vuelve a pedir el listado al filtrar por prioridad (RF-15 / AC-15)', async () => {
    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    const user = userEvent.setup();
    renderListado();
    await screen.findByText('Juan Pérez');

    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    await user.selectOptions(screen.getByLabelText('Prioridad'), 'Alta');

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('prioridad=Alta'),
        expect.anything(),
      ),
    );
  });

  it('pide la página siguiente al hacer clic en "Siguiente"', async () => {
    mockListado({ ordenes: [ORDEN], total: 21, pagina: 1, totalPaginas: 2 });
    const user = userEvent.setup();
    renderListado();
    await screen.findByText('Juan Pérez');

    mockListado({ ordenes: [], total: 21, pagina: 2, totalPaginas: 2 });
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('pagina=2'),
        expect.anything(),
      ),
    );
  });

  it('deshabilita "Anterior" en la primera página y "Siguiente" en la última', async () => {
    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    renderListado();
    await screen.findByText('Juan Pérez');

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('muestra un mensaje cuando no hay órdenes que coincidan con los filtros', async () => {
    mockListado({ ordenes: [], total: 0, pagina: 1, totalPaginas: 1 });
    renderListado();

    expect(
      await screen.findByText('No hay órdenes que coincidan con los filtros seleccionados.'),
    ).toBeInTheDocument();
  });

  it('incluye un enlace al detalle de cada orden', async () => {
    mockListado({ ordenes: [ORDEN], total: 1, pagina: 1, totalPaginas: 1 });
    renderListado();

    const enlace = await screen.findByRole('link', { name: 'Ver detalle' });
    expect(enlace).toHaveAttribute('href', '/ordenes/abc-123');
  });
});
