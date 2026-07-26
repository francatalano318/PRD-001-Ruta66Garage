import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { SesionProvider, useSesion } from './auth/SesionContext';
import { LoginForm } from './components/LoginForm';
import { CrearOrdenForm } from './components/CrearOrdenForm';
import { ListadoOrdenes } from './components/ListadoOrdenes';
import { OrdenDetallePagina } from './components/OrdenDetallePagina';

function Contenido() {
  const { token, cerrarSesion } = useSesion();

  // RF-02: sin sesión, no se muestra ninguna funcionalidad protegida.
  if (!token) {
    return <LoginForm />;
  }

  return (
    <div>
      <nav>
        <Link to="/ordenes">Listado</Link>
        <Link to="/ordenes/nueva">Nueva orden</Link>
        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </nav>

      <Routes>
        <Route path="/ordenes" element={<ListadoOrdenes />} />
        <Route path="/ordenes/nueva" element={<CrearOrdenForm />} />
        <Route path="/ordenes/:id" element={<OrdenDetallePagina />} />
        <Route path="*" element={<Navigate to="/ordenes" replace />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <SesionProvider>
      <BrowserRouter>
        <Contenido />
      </BrowserRouter>
    </SesionProvider>
  );
}
