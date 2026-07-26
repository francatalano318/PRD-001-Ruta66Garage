import { FormEvent, useState } from 'react';
import { login } from '../api/auth';
import { useSesion } from '../auth/SesionContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { iniciarSesion } = useSesion();

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const token = await login(email, password);
      iniciarSesion(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>Ingresar</h1>

      <label htmlFor="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
      />

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(evento) => setPassword(evento.target.value)}
      />

      <button type="submit" disabled={enviando}>
        {enviando ? 'Ingresando...' : 'Ingresar'}
      </button>

      {error && <p role="alert">{error}</p>}
    </form>
  );
}
