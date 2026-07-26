import { FormEvent, useState } from 'react';
import { crearOrden, CrearOrdenDatos, ErrorDeSesion, ErrorDeValidacion, Orden } from '../api/ordenes';
import { validarDatosOrden, ErroresFormulario } from '../validacionOrden';
import { DetalleOrden } from './DetalleOrden';
import { useSesion } from '../auth/SesionContext';

const DATOS_INICIALES: CrearOrdenDatos = { cliente: '', patente: '', descripcion: '' };

export function CrearOrdenForm() {
  const [datos, setDatos] = useState<CrearOrdenDatos>(DATOS_INICIALES);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [enviando, setEnviando] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState<Orden | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const { cerrarSesion } = useSesion();

  function actualizarCampo(campo: keyof CrearOrdenDatos, valor: string) {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);
    setOrdenCreada(null);

    const erroresValidacion = validarDatosOrden(datos);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) {
      return;
    }

    setEnviando(true);
    try {
      const orden = await crearOrden(datos);
      setOrdenCreada(orden);
      setDatos(DATOS_INICIALES);
    } catch (error) {
      if (error instanceof ErrorDeValidacion) {
        setErrorGeneral(error.mensajes.join(' '));
      } else if (error instanceof ErrorDeSesion) {
        cerrarSesion();
      } else {
        setErrorGeneral(error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>Nueva orden de trabajo</h1>

      <label htmlFor="cliente">Cliente</label>
      <input
        id="cliente"
        value={datos.cliente}
        onChange={(evento) => actualizarCampo('cliente', evento.target.value)}
      />
      {errores.cliente && <p role="alert">{errores.cliente}</p>}

      <label htmlFor="patente">Patente</label>
      <input
        id="patente"
        value={datos.patente}
        onChange={(evento) => actualizarCampo('patente', evento.target.value)}
      />
      {errores.patente && <p role="alert">{errores.patente}</p>}

      <label htmlFor="descripcion">Descripción de la incidencia</label>
      <textarea
        id="descripcion"
        value={datos.descripcion}
        onChange={(evento) => actualizarCampo('descripcion', evento.target.value)}
      />
      {errores.descripcion && <p role="alert">{errores.descripcion}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Creando...' : 'Crear Orden'}
      </button>

      {errorGeneral && <p role="alert">{errorGeneral}</p>}

      {ordenCreada && (
        <DetalleOrden orden={ordenCreada} onOrdenActualizada={setOrdenCreada} />
      )}
    </form>
  );
}
