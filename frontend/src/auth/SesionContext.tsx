import { createContext, ReactNode, useContext, useState } from 'react';
import { borrarToken, guardarToken, obtenerToken } from './session';

interface SesionContextValor {
  token: string | null;
  iniciarSesion: (token: string) => void;
  cerrarSesion: () => void;
}

// Exportado (no solo el hook) para poder inyectar un valor de prueba en
// los tests de componentes que necesitan un cerrarSesion() espiable.
export const SesionContext = createContext<SesionContextValor | undefined>(undefined);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => obtenerToken());

  function iniciarSesion(nuevoToken: string) {
    guardarToken(nuevoToken);
    setToken(nuevoToken);
  }

  function cerrarSesion() {
    borrarToken();
    setToken(null);
  }

  return (
    <SesionContext.Provider value={{ token, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion(): SesionContextValor {
  const contexto = useContext(SesionContext);
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de un SesionProvider');
  }
  return contexto;
}
