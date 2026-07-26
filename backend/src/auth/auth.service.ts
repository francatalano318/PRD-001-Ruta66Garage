import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  // RF-01/AC-01. Mensaje genérico en ambos casos de fallo (email
  // inexistente o contraseña incorrecta) para no revelar qué emails existen.
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const usuario = await this.usuariosRepository.findOneBy({ email });
    if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = { sub: usuario.id, email: usuario.email };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
