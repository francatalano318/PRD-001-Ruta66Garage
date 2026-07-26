import { IsString } from 'class-validator';

// RF-19: campo único que se pisa en cada edición.
export class ActualizarObservacionesDto {
  @IsString()
  observaciones: string;
}
