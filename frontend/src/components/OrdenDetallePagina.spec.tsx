import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrdenDetallePagina } from './OrdenDetallePagina';
import { SesionProvider } from '../auth/SesionContext';
import { Orden } from '../api/ordenes';

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

function renderPagina(id = 'abc-123') {
  return render(
    <SesionProvider>
      <MemoryRouter initialEntries={[`/ordenes/${id}`]}>
        <Routes>
          <Route path="/ordenes/:id" element={<OrdenDetallePagina />} />
        </Routes>
      </MemoryRouter>
    </SesionProvider>,
  );
}

describe('OrdenDetallePagina', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('muestra el detalle completo de la orden (RF-16 / AC-16)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ORDEN,
    });

    renderPagina();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('AA123BB')).toBeInTheDocument();
    expect(screen.getByText('Ruido al frenar en curvas cerradas')).toBeInTheDocument();
    expect(screen.getByText('Abierta')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/ordenes/abc-123',
      expect.anything(),
    );
  });

  it('no muestra el mensaje de "creada correctamente" (distinto del resultado de creación)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ORDEN,
    });

    renderPagina();

    await screen.findByText('Juan Pérez');
    expect(screen.queryByText(/creada correctamente/)).not.toBeInTheDocument();
  });

  it('muestra un aviso cuando la orden no existe (404)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'No existe' }),
    });

    renderPagina('no-existe');

    expect(await screen.findByText('La orden solicitada no existe.')).toBeInTheDocument();
  });
});
