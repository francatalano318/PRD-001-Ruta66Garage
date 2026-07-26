import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorDeSesion, ErrorNoEncontrado, obtenerOrden, Orden } from '../api/ordenes';
import { useSesion } from '../auth/SesionContext';
import { DetalleOrden } from './DetalleOrden';

// RF-16: detalle completo de una orden existente (accedida desde el listado).
export function OrdenDetallePagina() {
  const { id } = useParams<{ id: string }>();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const { cerrarSesion } = useSesion();

  useEffect(() => {
    if (!id) return;

    let cancelado = false;
    setCargando(true);
    setError(null);
    setNoEncontrada(false);

    obtenerOrden(id)
      .then((resultado) => {
        if (!cancelado) setOrden(resultado);
      })
      .catch((e) => {
        if (cancelado) return;
        if (e instanceof ErrorDeSesion) {
          cerrarSesion();
        } else if (e instanceof ErrorNoEncontrado) {
          setNoEncontrada(true);
        } else {
          setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, cerrarSesion]);

  return (
    <div>
      <Link to="/ordenes">Volver al listado</Link>

      {cargando && <p>Cargando...</p>}
      {error && <p role="alert">{error}</p>}
      {noEncontrada && <p role="alert">La orden solicitada no existe.</p>}

      {orden && <DetalleOrden orden={orden} onOrdenActualizada={setOrden} mostrarMensajeCreacion={false} />}
    </div>
  );
}
