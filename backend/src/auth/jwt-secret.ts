// Compartido entre AuthModule (firma) y JwtStrategy (verificación) para
// evitar que un default distinto en cada lado rompa la validación del token.
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-cambiar-en-produccion';
