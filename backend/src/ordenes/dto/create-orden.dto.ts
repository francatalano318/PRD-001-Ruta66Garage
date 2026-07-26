import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateOrdenDto {
  @IsString()
  @IsNotEmpty({ message: 'El cliente es obligatorio.' })
  cliente: string;

  // RF-20 / AC-20
  @IsString()
  @IsNotEmpty({ message: 'La patente es obligatoria.' })
  patente: string;

  // RF-21 / AC-21
  @IsString()
  @MinLength(10, {
    message: 'La descripción es inválida: debe tener al menos 10 caracteres.',
  })
  descripcion: string;
}
