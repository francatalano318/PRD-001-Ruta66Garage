import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { SesionProvider } from './auth/SesionContext';

export function renderConSesion(ui: ReactElement) {
  return render(<SesionProvider>{ui}</SesionProvider>);
}
