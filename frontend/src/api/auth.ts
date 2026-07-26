import { API_URL } from './config';

export class ErrorDeCredenciales extends Error {}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 401) {
    throw new ErrorDeCredenciales('Email o contraseña incorrectos.');
  }

  if (!response.ok) {
    throw new Error('No se pudo iniciar sesión. Intentá de nuevo en unos segundos.');
  }

  const cuerpo = await response.json();
  return cuerpo.accessToken as string;
}
