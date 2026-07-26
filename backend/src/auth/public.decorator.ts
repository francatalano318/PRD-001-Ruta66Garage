import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marca un endpoint como accesible sin autenticación (ej: POST /auth/login),
// para no tener que acordarse de excluirlo a mano del guard global (RF-02).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
