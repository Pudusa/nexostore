# Plan de Tareas: Refactorización de Autenticación y API

## Fase 1: Preparación y Desmantelamiento

- [x] **Crear Rama Git:** Crear y cambiarse a la rama `refactor/auth-rebuild`.
- [x] **Analizar Lógica de Imágenes:** Investigar y documentar el flujo actual de subida de imágenes.
- [x] **Desconectar Backend:** Comentar temporalmente los `Guards` y la lógica de autenticación en los controladores de NestJS.
- [x] **Desconectar Frontend:** Comentar temporalmente las llamadas a Server Actions y la lógica de `api.ts` para evitar errores durante la refactorización.

## Fase 2: Reconstrucción del Backend (NestJS)

- [x] **Configurar Super Admin:** Añadir la variable de entorno `SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_MODE_ENABLED`. Integrar la lógica de Feature Flag en `RolesGuard`.
- [x] **Actualizar Esquema de BD:** Añadir `enum Role` y el campo `role` al modelo `User` en `schema.prisma`.
- [x] **Ejecutar Migración:** Crear y aplicar la nueva migración de la base de datos.
- [x] **Reimplementar Autenticación:**
    - [x] Actualizar `AuthService` para que el JWT incluya el `role`.
    - [x] Ajustar `JwtStrategy` para extraer el `role` del payload.
- [x] **Implementar Autorización (Guards):**
    - [x] Crear un `RolesGuard` que verifique los roles permitidos.
    - [x] **Integrar Lógica de Super Admin en `RolesGuard`:** El guard debe permitir el acceso si el email del usuario coincide con `SUPER_ADMIN_EMAIL`.
- [x] **Actualizar Lógica de Negocio (Servicios):**
    - [x] **`ProductsService`:** Modificar `update` y `remove` para que el Super Admin pueda saltarse la verificación de propiedad.
    - [x] **`UsersService`:** Implementar `updateRole` y `remove` (con borrado en cascada de productos), permitiendo al `ADMIN` y al `Super Admin` ejecutar estas acciones. También se implementó la funcionalidad de búsqueda y filtrado de usuarios, y se ocultó al Super Admin de la lista de usuarios.
- [x] **Asegurar Endpoints (Controladores):** Aplicar `JwtAuthGuard` y `RolesGuard` a las rutas correspondientes.

## Fase 3: Reconstrucción del Frontend (Next.js)

- [x] **Configurar Entorno:** Asegurar que las variables de entorno (`.env.local`, Vercel) estén alineadas para las URLs de la API y el `SUPER_ADMIN_EMAIL`.
- [x] **Reconstruir Capa de API:** Actualizar `lib/api.ts` y las Server Actions para que se comuniquen con los nuevos endpoints y envíen el token JWT.
- [x] **Reimplementar Flujo de Autenticación:**
    - [x] Actualizar formularios de `login` y `register`.
    - [x] Asegurar que el login guarde el token en una cookie `httpOnly`.
    
- [x] **Implementar UI Condicional:**
    - [x] Adaptar los componentes para mostrar/ocultar elementos (botones, enlaces) basándose en el rol del usuario y si es el Super Admin. Se implementaron las funcionalidades de búsqueda, filtrado, eliminación y cambio de rol de usuarios en el frontend.

## Sugerencias y Mejoras Futuras

- [ ] **Implementar un Sistema de Feature Flags:** Añadir un sistema (por ejemplo, usando variables de entorno) para activar o desactivar funcionalidades que están en desarrollo, permitiendo probar cambios en un entorno controlado sin afectar a todos los usuarios.
