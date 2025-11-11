import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client'; // Importa el enum Role de Prisma
import { ROLES_KEY } from './roles.decorator'; // Importa la clave del decorador

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no hay roles definidos, la ruta es pública
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // El usuario autenticado por JwtStrategy

    // Lógica del Super Admin: solo si el modo Super Admin está habilitado y el email coincide
    if (process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && user && user.email === process.env.SUPER_ADMIN_EMAIL) {
      return true; // El Super Admin tiene acceso total
    }

    // Lógica de roles normal
    return user && user.role && requiredRoles.some((role) => user.role === role);
  }
}