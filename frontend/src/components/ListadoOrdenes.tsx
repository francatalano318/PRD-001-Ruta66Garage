import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorDeSesion, listarOrdenes, ListadoOrdenes as ListadoOrdenesRespuesta } from '../api/ordenes';
import { CATEGORIAS_ORDEN, ESTADOS_ORDEN, PRIORIDADES_ORDEN } from '../dominio';
import { useSesion } from '../auth/SesionContext';

// RF-12 a RF-15, RNF-05, RNF-08.
export function ListadoOrdenes() {
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [pagina, setPagina] = useState(1);
  const [listado, setListado] = useState<ListadoOrdenesRespuesta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cerrarSesion } = useSesion();

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    listarOrdenes({ pagina, estado, categoria, prioridad })
      .then((resultado) => {
        if (!cancelado) setListado(resultado);
      })
      .catch((e) => {
        if (cancelado) return;
        if (e instanceof ErrorDeSesion) {
          cerrarSesion();
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
  }, [pagina, estado, categoria, prioridad, cerrarSesion]);

  // Cambiar un filtro vuelve siempre a la primera página.
  function conFiltro(setter: (valor: string) => void) {
    return (valor: string) => {
      setter(valor);
      setPagina(1);
    };
  }

  return (
    <div>
      <h1>Órdenes de trabajo</h1>

      <div>
        <label htmlFor="filtro-estado">Estado</label>
        <select
          id="filtro-estado"
          value={estado}
          onChange={(evento) => conFiltro(setEstado)(evento.target.value)}
        >
          <option value="">Todos</option>
          {ESTADOS_ORDEN.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>

        <label htmlFor="filtro-categoria">Categoría</label>
        <select
          id="filtro-categoria"
          value={categoria}
          onChange={(evento) => conFiltro(setCategoria)(evento.target.value)}
        >
          <option value="">Todas</option>
          {CATEGORIAS_ORDEN.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>

        <label htmlFor="filtro-prioridad">Prioridad</label>
        <select
          id="filtro-prioridad"
          value={prioridad}
          onChange={(evento) => conFiltro(setPrioridad)(evento.target.value)}
        >
          <option value="">Todas</option>
          {PRIORIDADES_ORDEN.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </div>

      {error && <p role="alert">{error}</p>}
      {cargando && <p>Cargando...</p>}

      {listado && (
        <>
          {listado.ordenes.length === 0 ? (
            <p>No hay órdenes que coincidan con los filtros seleccionados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Patente</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listado.ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.cliente}</td>
                    <td>{orden.patente}</td>
                    <td>{orden.categoria}</td>
                    <td>{orden.prioridad}</td>
                    <td>{orden.estado}</td>
                    <td>
                      <Link to={`/ordenes/${orden.id}`}>Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div>
            <button
              type="button"
              onClick={() => setPagina((p) => p - 1)}
              disabled={listado.pagina <= 1}
            >
              Anterior
            </button>
            <span>
              Página {listado.pagina} de {listado.totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => setPagina((p) => p + 1)}
              disabled={listado.pagina >= listado.totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
