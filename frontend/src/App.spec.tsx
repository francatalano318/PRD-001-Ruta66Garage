import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn() as unknown as typeof fetch;
    // BrowserRouter usa la URL real de jsdom, que persiste entre tests.
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sin sesión, no muestra ninguna funcionalidad protegida (RF-02)', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.queryByText('Nueva orden de trabajo')).not.toBeInTheDocument();
  });

  it('tras un login exitoso, muestra la funcionalidad protegida y oculta el login', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ accessToken: 'un-token-valido' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ordenes: [], total: 0, pagina: 1, totalPaginas: 1 }),
      });

    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@ruta66garage.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Ruta66Garage#2026');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByRole('heading', { name: 'Órdenes de trabajo' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ingresar' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Nueva orden' }));
    expect(await screen.findByText('Nueva orden de trabajo')).toBeInTheDocument();
  });

  it('cerrar sesión vuelve a mostrar el login y oculta la funcionalidad protegida', async () => {
    localStorage.setItem('ruta66garage.token', 'un-token-ya-guardado');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ordenes: [], total: 0, pagina: 1, totalPaginas: 1 }),
    });

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Órdenes de trabajo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('heading', { name: 'Órdenes de trabajo' })).not.toBeInTheDocument();
  });
});
