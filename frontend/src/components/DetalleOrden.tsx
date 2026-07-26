import { useEffect, useState } from 'react';
import {
  actualizarCategoria,
  actualizarEstado,
  actualizarObservaciones,
  actualizarPrioridad,
  ErrorDeSesion,
  Orden,
} from '../api/ordenes';
import { CATEGORIAS_ORDEN, ESTADOS_ORDEN, PRIORIDADES_ORDEN } from '../dominio';
import { useSesion } from '../auth/SesionContext';

interface Props {
  orden: Orden;
  onOrdenActualizada: (orden: Orden) => void;
  // Solo el flujo de alta (CrearOrdenForm) confirma la creación; el detalle
  // de una orden ya existente (RF-16) no debe mostrar ese mensaje.
  mostrarMensajeCreacion?: boolean;
}

export function DetalleOrden({ orden, onOrdenActualizada, mostrarMensajeCreacion = true }: Props) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(orden.categoria);
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState(orden.prioridad);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(orden.estado);
  const [observacionesEditadas, setObservacionesEditadas] = useState(orden.observaciones ?? '');
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [guardandoPrioridad, setGuardandoPrioridad] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [guardandoObservaciones, setGuardandoObservaciones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cerrarSesion } = useSesion();

  // Si el padre muestra una orden distinta (ej: se creó una nueva), los
  // selects tienen que reflejar sus valores, no quedarse con los previos.
  useEffect(() => {
    setCategoriaSeleccionada(orden.categoria);
    setPrioridadSeleccionada(orden.prioridad);
    setEstadoSeleccionado(orden.estado);
    setObservacionesEditadas(orden.observaciones ?? '');
  }, [orden.id, orden.categoria, orden.prioridad, orden.estado, orden.observaciones]);

  async function guardarCategoria() {
    setError(null);
    setGuardandoCategoria(true);
    try {
      onOrdenActualizada(await actualizarCategoria(orden.id, categoriaSeleccionada));
    } catch (e) {
      if (e instanceof ErrorDeSesion) {
        cerrarSesion();
      } else {
        setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      setGuardandoCategoria(false);
    }
  }

  async function guardarPrioridad() {
    setError(null);
    setGuardandoPrioridad(true);
    try {
      onOrdenActualizada(await actualizarPrioridad(orden.id, prioridadSeleccionada));
    } catch (e) {
      if (e instanceof ErrorDeSesion) {
        cerrarSesion();
      } else {
        setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      setGuardandoPrioridad(false);
    }
  }

  // RF-17/RF-18
  async function guardarEstado() {
    setError(null);
    setGuardandoEstado(true);
    try {
      onOrdenActualizada(await actualizarEstado(orden.id, estadoSeleccionado));
    } catch (e) {
      if (e instanceof ErrorDeSesion) {
        cerrarSesion();
      } else {
        setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      setGuardandoEstado(false);
    }
  }

  // RF-19
  async function guardarObservaciones() {
    setError(null);
    setGuardandoObservaciones(true);
    try {
      onOrdenActualizada(await actualizarObservaciones(orden.id, observacionesEditadas));
    } catch (e) {
      if (e instanceof ErrorDeSesion) {
        cerrarSesion();
      } else {
        setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      setGuardandoObservaciones(false);
    }
  }

  return (
    <div role="status">
      {mostrarMensajeCreacion && <p>Orden {orden.id} creada correctamente.</p>}
      {orden.clasificacionAutomatica && <p>{orden.clasificacionAutomatica.mensaje}</p>}

      {/* RF-16: detalle completo de la orden. */}
      <dl>
        <dt>Cliente</dt>
        <dd>{orden.cliente}</dd>
        <dt>Patente</dt>
        <dd>{orden.patente}</dd>
        <dt>Descripción</dt>
        <dd>{orden.descripcion}</dd>
      </dl>

      <div>
        <label htmlFor="categoria-select">Categoría</label>
        <select
          id="categoria-select"
          value={categoriaSeleccionada}
          onChange={(evento) => setCategoriaSeleccionada(evento.target.value)}
        >
          {CATEGORIAS_ORDEN.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        {orden.categoriaAsignadaPorIa && <span>Categoría asignada por IA</span>}
        <button type="button" onClick={guardarCategoria} disabled={guardandoCategoria}>
          Guardar categoría
        </button>
      </div>

      <div>
        <label htmlFor="prioridad-select">Prioridad</label>
        <select
          id="prioridad-select"
          value={prioridadSeleccionada}
          onChange={(evento) => setPrioridadSeleccionada(evento.target.value)}
        >
          {PRIORIDADES_ORDEN.map((prioridad) => (
            <option key={prioridad} value={prioridad}>
              {prioridad}
            </option>
          ))}
        </select>
        {orden.prioridadAsignadaPorIa && <span>Prioridad asignada por IA</span>}
        <button type="button" onClick={guardarPrioridad} disabled={guardandoPrioridad}>
          Guardar prioridad
        </button>
      </div>

      <div>
        <label htmlFor="estado-select">Estado</label>
        <select
          id="estado-select"
          value={estadoSeleccionado}
          onChange={(evento) => setEstadoSeleccionado(evento.target.value)}
        >
          {ESTADOS_ORDEN.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        <button type="button" onClick={guardarEstado} disabled={guardandoEstado}>
          Guardar estado
        </button>
      </div>

      <div>
        <label htmlFor="observaciones-textarea">Observaciones</label>
        <textarea
          id="observaciones-textarea"
          value={observacionesEditadas}
          onChange={(evento) => setObservacionesEditadas(evento.target.value)}
        />
        <button
          type="button"
          onClick={guardarObservaciones}
          disabled={guardandoObservaciones}
        >
          Guardar observaciones
        </button>
      </div>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
