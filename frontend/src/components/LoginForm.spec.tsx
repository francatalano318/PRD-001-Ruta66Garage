import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { SesionContext } from '../auth/SesionContext';

function renderConMock(iniciarSesion = jest.fn()) {
  render(
    <SesionContext.Provider value={{ token: null, iniciarSesion, cerrarSesion: jest.fn() }}>
      <LoginForm />
    </SesionContext.Provider>,
  );
  return { iniciarSesion };
}

describe('LoginForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('inicia sesión con credenciales válidas (RF-01 / AC-01)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'un-token-valido' }),
    });

    const { iniciarSesion } = renderConMock();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@ruta66garage.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Ruta66Garage#2026');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(iniciarSesion).toHaveBeenCalledWith('un-token-valido'));
  });

  it('muestra un error con credenciales inválidas y no inicia sesión', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const { iniciarSesion } = renderConMock();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@ruta66garage.com');
    await user.type(screen.getByLabelText('Contraseña'), 'mal');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText('Email o contraseña incorrectos.')).toBeInTheDocument();
    expect(iniciarSesion).not.toHaveBeenCalled();
  });
});
