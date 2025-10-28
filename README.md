# NexoStore - Catálogo de Productos Centralizado

NexoStore es una aplicación web full-stack diseñada para funcionar como un catálogo de productos centralizado. Permite a los "Managers" (gestores de ventas) publicar y administrar sus productos, que se muestran en un catálogo público.

La aplicación está construida con un stack moderno de TypeScript, siguiendo las mejores prácticas de desarrollo tanto en el frontend como en el backend.

---

## Stack Tecnológico

- **Frontend**:
  - **Framework**: [Next.js](https://nextjs.org/) (con App Router)
  - **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
  - **UI**: [React](https://reactjs.org/)
  - **Componentes**: [Shadcn/ui](https://ui.shadcn.com/) sobre [Radix UI](https://www.radix-ui.com/)
  - **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
  - **Formularios**: [React Hook Form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validación.

- **Backend**:
  - **Framework**: [NestJS](https://nestjs.com/)
  - **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
  - **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (utilizando SQLite para desarrollo local)
  - **ORM**: [Prisma](https://www.prisma.io/)

---

## Estructura del Proyecto

El proyecto está organizado en dos partes principales:

- **`/` (Raíz)**: Contiene el proyecto de Next.js que corresponde al frontend.
  - `src/app`: Rutas y páginas de la aplicación.
  - `src/components`: Componentes de React reutilizables.
  - `src/lib`: Lógica de cliente, schemas de validación y utilidades.
- **`/backend`**: Contiene el proyecto de NestJS que actúa como la API del servidor.
  - `src/auth`: Módulo de autenticación.
  - `src/users`: Módulo para la gestión de usuarios.
  - `src/products`: Módulo para la gestión de productos.
  - `prisma`: Contiene el schema de la base de datos y las migraciones.

---

## Cómo Empezar

### Requisitos

- Node.js (v18 o superior)
- npm

### Pasos

1.  **Instalar dependencias del Frontend**:
    ```bash
    npm install
    ```

2.  **Instalar dependencias del Backend**:
    ```bash
    cd backend
    npm install
    ```

3.  **Configurar la Base de Datos (Backend)**:
    - Renombra el archivo `.env.example` a `.env` si es necesario.
    - Ejecuta las migraciones de Prisma para crear la base de datos:
    ```bash
    npx prisma migrate dev
    ```

4.  **Iniciar los servidores**:
    - En una terminal, inicia el servidor de frontend:
    ```bash
    npm run dev
    ```
    - En otra terminal, inicia el servidor de backend:
    ```bash
    cd backend
    npm run start:dev
    ```

La aplicación estará disponible en `http://localhost:3000`.