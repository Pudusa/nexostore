# Guía de Arquitectura y Patrones para Agente de IA

**Asunto**: Desarrollo de Plataforma de E-commerce

## 1.0 Stack Tecnológico Obligatorio

| Categoría | Tecnología | Regla |
| :--- | :--- | :--- |
| **Lenguaje** | TypeScript | `strict: true` debe estar habilitado en `tsconfig.json`. |
| **Framework Frontend** | Next.js | Utilizar exclusivamente el **App Router**. |
| **Librería de UI** | React | - |
| **Componentes de UI** | Shadcn/ui & Radix UI | Construir sobre primitivas de Radix; usar CLI de Shadcn/ui. |
| **Formularios** | React Hook Form & Zod | Esquema Zod como única fuente de verdad para validación. |
| **Estilos** | Tailwind CSS | Tokens centralizados; prohibido usar valores arbitrarios. |
| **Framework Backend** | NestJS | Requerido para la capa de servidor. |
| **Base de Datos** | PostgreSQL | Requerida para la persistencia de datos. |
| **ORM** | Prisma | **Obligatorio** para toda interacción con la base de datos. |

---

## 2.0 Contexto del Proyecto

| Archivo | Propósito |
| :--- | :--- |
| `context/structure.md` | Contiene la estructura de carpetas y archivos del proyecto. |
| `context/tasks.md` | Contiene la lista de tareas pendientes, en progreso y completadas. |

---

## 3.0 Flujo de Trabajo y Entorno

| Acción | Regla |
| :--- | :--- |
| **Inicio de Tarea** | Antes de comenzar cualquier tarea, se **DEBE** crear una nueva rama Git desde la rama principal. |
| **Finalización de Tarea** | Al confirmar que una tarea ha finalizado, se **DEBE** eliminar de la lista en `tasks.md`. |
| **Entrega de Tarea** | Se **DEBE** solicitar confirmación para subir (`push`) la rama correspondiente al repositorio remoto. |

---

## 4.0 Arquitectura de Backend (NestJS)

### 4.1 Principios Fundamentales

| Principio | Requisito |
| :--- | :--- |
| **Arquitectura Modular** | Estructurar la aplicación en módulos autocontenidos por dominio de negocio (ej. `ProductsModule`). |
| **Separación de Conceptos** | Uso estricto de `Controller`, `Service` (`@Injectable`), y `Repository`. |
| **Inyección de Dependencias** | **PROHIBIDO** instanciar clases de servicio manualmente. Usar el contenedor de DI de NestJS. |

### 4.2 Interacción con la Base de Datos (PostgreSQL con Prisma)

| Patrón | Requisito |
| :--- | :--- |
| **ORM Obligatorio** | Usar **Prisma** para todas las operaciones de base de datos para prevenir inyección SQL. |
| **Patrón de Repositorio** | Abstraer el acceso a datos con repositorios. Crear un `GenericRepository` para CRUD y repositorios específicos (ej. `ProductRepository`) para lógica de dominio. |
| **Modelado de Datos** | Usar esquema relacional estricto con integridad referencial (claves foráneas). |

---

## 5.0 Arquitectura de Frontend (Next.js)

### 4.3 Estructura de Proyecto Backend

| Directorio / Archivo | Propósito |
| :--- | :--- |
| `dist/` | Directorio de salida para el código compilado de JavaScript. |
| `generated/` | Contiene los tipos de Prisma generados automáticamente. |
| `node_modules/` | Contiene todas las dependencias del proyecto backend. |
| `prisma/` | Contiene el esquema de la base de datos, las migraciones y el script de seeding. |
| `  └─ dev.db` | Base de datos de desarrollo de SQLite. |
| `  └─ schema.prisma` | Define los modelos de la base de datos y las relaciones. |
| `  └─ seed.ts` | Script para poblar la base de datos con datos iniciales. |
| `  └─ migrations/` | Contiene los archivos de migración de la base de datos. |
| `src/` | Directorio raíz del código fuente de la aplicación NestJS. |
| `  └─ auth/` | Módulo para la autenticación de usuarios (JWT, guards, strategies). |
| `  └─ prisma/` | Módulo para la integración con Prisma. |
| `  └─ products/` | Módulo para la lógica de negocio de los productos (CRUD). |
| `  └─ supabase/` | Módulo para la integración con Supabase. |
| `  └─ upload/` | Módulo para la subida de archivos. |
| `  └─ users/` | Módulo para la lógica de negocio de los usuarios. |
| `  └─ app.controller.ts` | Controlador principal de la aplicación. |
| `  └─ app.module.ts` | Módulo raíz de la aplicación NestJS. |
| `  └─ app.service.ts` | Servicio principal de la aplicación. |
| `  └─ main.ts` | Punto de entrada de la aplicación NestJS. |
| `  └─ prisma.service.ts` | Servicio para la conexión con Prisma. |
| `nest-cli.json` | Archivo de configuración para el CLI de NestJS. |
| `tsconfig.json` | Archivo de configuración de TypeScript para el backend. |

---

## 5.0 Arquitectura de Frontend (Next.js)

### 5.1 Estructura de Proyecto

| Directorio / Archivo | Propósito |
| :--- | :--- |
| `src/` | Raíz para todo el código fuente de la aplicación. |
| `  └─ app/` | Estructura de rutas principal siguiendo el App Router de Next.js. |
| `  │  └─ (auth)/` | Grupo de rutas para autenticación (`login`, `register`). |
| `  │  └─ dashboard/` | Rutas protegidas para el panel de administración. |
| `  │  └─ products/` | Rutas públicas para visualizar productos. |
| `  │  └─ actions/` | Server Actions para mutaciones de datos. |
| `  │  └─ layout.tsx` | Layout principal de la aplicación. |
| `  │  └─ page.tsx` | Página de inicio de la aplicación. |
| `  └─ components/` | Componentes de React reutilizables. |
| `  │  └─ auth/` | Componentes específicos para la autenticación. |
| `  │  └─ dashboard/` | Componentes para el panel de administración. |
| `  │  └─ layout/` | Componentes estructurales (Header, Nav, etc.). |
| `  │  └─ ui/` | Componentes de UI de bajo nivel (shadcn/ui). |
| `  └─ hooks/` | Hooks de React personalizados. |
| `  └─ lib/` | Lógica y utilidades compartidas. |
| `  │  └─ api.ts` | Funciones para interactuar con el backend. |
| `  │  └─ auth.ts` | Lógica de autenticación del lado del cliente. |
| `  │  └─ schemas.ts` | Esquemas de validación con Zod. |
| `  │  └─ types.ts` | Definiciones de tipos de TypeScript. |
| `  │  └─ utils.ts` | Funciones de utilidad generales. |
| `public/` | Archivos estáticos servidos públicamente. |
| `next.config.mjs` | Archivo de configuración de Next.js. |
| `tailwind.config.ts` | Archivo de configuración de Tailwind CSS. |
| `tsconfig.json` | Archivo de configuración de TypeScript para el frontend. |

### 5.2 Patrones del App Router

| Característica | Regla de Implementación |
| :--- | :--- |
| **Gestión de Estado (Servidor)** | **PROHIBIDO** definir almacenes de estado globales (Redux, Zustand) para evitar fugas de datos entre usuarios. |
| **Componentes (Distinción)** | **React Server Components (RSC)** para obtener y mostrar datos. **Client Components (`"use client"`)** para estado mutable e interactividad. |
| **Mutaciones de Datos (CUD)** | Implementar **OBLIGATORIAMENTE** con **Server Actions**. |
| **Middleware** | Usar `middleware.ts` para lógica transversal como la protección de rutas autenticadas. |

### 5.3 Patrones de TypeScript

| Característica | Regla de Implementación |
| :--- | :--- |
| **Modo Estricto** | `strict: true` es **OBLIGATORIO** en `tsconfig.json`. |
| **Tipado Explícito** | **PROHIBIDO** el uso de `any`. Usar `unknown` para manejo seguro de tipos inciertos. |
| **Interfaces vs. Tipos** | `interface` para la forma de objetos y extensibilidad. `type` para uniones, primitivas y tipos de utilidad. |

---

## 6.0 UI y Formularios

| Área | Requisito |
| :--- | :--- |
| **Sistema de Componentes** | Usar primitivas de **Radix UI** para accesibilidad. Añadir componentes al proyecto con la **CLI de Shadcn/ui**. |
| **Estilos (Tailwind CSS)** | Definir todos los tokens en `tailwind.config.js`. **PROHIBIDO** usar valores arbitrarios. Usar `@apply` para clases reutilizables. Configurar `prettier-plugin-tailwindcss`. |
| **Gestión de Formularios** | **Fuente de Verdad Única**: Un único esquema **Zod** por formulario. **Validación Dual**: Usar `React Hook Form` (cliente) y el mismo esquema Zod en el backend (servidor) para cada mutación. **Tipado Seguro**: Inferir tipos de datos del formulario con `z.infer<typeof schema>`. |

---

## 7.0 Requisitos de Seguridad (OWASP Top 10)

| Amenaza (OWASP) | Mitigación / Requisito |
| :--- | :--- |
| **A01: Control de Acceso** | **DAL Exclusiva del Servidor**: Único punto de acceso a la BD. **Autorización en la DAL**: CADA función en la DAL DEBE verificar permisos del usuario. **Protección de Rutas**: Usar `Guards` en NestJS y `middleware.ts` en Next.js. **Cookies Seguras**: `HttpOnly`, `Secure`, `SameSite=Strict`. |
| **A02: Fallos Criptográficos** | **Hashing de Contraseñas**: Usar **bcrypt**. **Gestión de Secretos**: Almacenar secretos (claves API, JWT) como variables de entorno. **NUNCA** confirmarlos en git. **Transporte Seguro**: Forzar **HTTPS** y cabecera **HSTS**. |
| **A03: Inyección** | **SQLi**: **OBLIGATORIO** usar Prisma ORM. **PROHIBIDO** el uso de métodos de consulta raw inseguros (ej. `$queryRawUnsafe`). **XSS**: **PROHIBIDO** el uso de `dangerouslySetInnerHTML` sin sanitización (ej. DOMPurify). Implementar una **Política de Seguridad de Contenido (CSP)** estricta. |
| **A05: CSRF** | **Server Actions**: Confiar en la protección CSRF incorporada de Next.js. **Rutas de API personalizadas**: Deben ser protegidas manualmente contra CSRF si no usan Server Actions. |

---

## 8.0 Plan de Pruebas Automatizadas

Este documento describe la estrategia de pruebas para el proyecto NexoStore, siguiendo la metodología de la Pirámide de Pruebas.

### **Fase 1: Pruebas Unitarias**

Prueban componentes individuales en total aislamiento. Son rápidas y precisas.

#### **Backend (NestJS & Jest)**

| Archivo a Probar | Función/Método | Escenario de Prueba | Estado |
| :--- | :--- | :--- | :--- |
| `products.service.ts` | `findOne` | Debe devolver un producto si el ID existe (simulando Prisma). | `[✓]` |
| `products.service.ts` | `findOne` | Debe lanzar `NotFoundException` si el ID no existe (simulando Prisma). | `[✓]` |
| `products.service.ts` | `create` | Debe llamar a `prisma.product.create` con los datos correctos. | `[✓]` |
| `users.service.ts` | `findOne` | Debe devolver un usuario si el ID existe (simulando Prisma). | `[✓]` |
| `users.service.ts` | `findByEmail` | Debe devolver un usuario si el email existe (para la autenticación). | `[✓]` |

#### **Frontend (Next.js & Jest & React Testing Library)**

| Archivo a Probar | Componente/Función | Escenario de Prueba | Estado |
| :--- | :--- | :--- | :--- |
| `components/product-card.tsx` | `ProductCard` | Debe renderizar correctamente el nombre, precio y descripción del producto. | `[✓]` |
| `lib/utils.ts` | `cn` | Debe fusionar correctamente las clases de Tailwind. | `[✓]` |
| `lib/utils.ts` | `formatPrice` (si existe) | Debe formatear un número a una cadena de texto de moneda (ej. 100 -> "$100.00"). | `[✓]` |

### **Fase 2: Pruebas de Integración**

Prueban la interacción entre varios componentes.

#### **Backend (NestJS & Supertest)**

| Módulos a Probar | Endpoint | Escenario de Prueba | Estado |
| :--- | :--- | :--- | :--- |
| `ProductsModule` | `GET /products/:id` | Debe devolver un 200 OK y los datos del producto si existe. | `[✓]` |
| `ProductsModule` | `GET /products/:id` | Debe devolver un 404 Not Found si el producto no existe. | `[✓]` |
| `AuthModule` | `POST /auth/login` | Debe devolver un 401 Unauthorized con credenciales incorrectas. | `[✓]` |
| `AuthModule` | `POST /auth/login` | Debe devolver un token JWT (simulado) con credenciales correctas. | `[✓]` |

#### **Frontend (Next.js & React Testing Library)**

| Componente a Probar | Interacción | Escenario de Prueba | Estado |
| :--- | :--- | :--- | :--- |
| `components/auth/login-form.tsx` | Rellenar y enviar | Al enviar, debe llamar a la Server Action `login` con el email y contraseña. | `[✓]` |
| `components/dashboard/new-product-form.tsx` | Rellenar y enviar | Al enviar, debe llamar a la Server Action `createProduct` con los datos del formulario. | `[✓]` |

### **Fase 3: Pruebas de Extremo a Extremo (E2E)**

Simulan flujos de usuario completos en un navegador real. Usaremos **Playwright**.

| Flujo de Usuario | Pasos de la Prueba | Estado |
| :--- | :--- | :--- |
| **Autenticación** | 1. Navegar a `/login`. 2. Rellenar formulario con un usuario válido. 3. Enviar. 4. Verificar redirección al Dashboard (`/`). 5. Verificar que el nombre del usuario aparece en el `UserNav`. 6. Hacer logout. 7. Verificar redirección a `/login`. | `[✓]` |
| **Creación de Producto** | 1. Iniciar sesión como `manager`. 2. Navegar a `/dashboard/products`. 3. Hacer clic en "Crear Producto". 4. Rellenar el formulario del nuevo producto. 5. Enviar. 6. Verificar que el nuevo producto aparece en la tabla de productos. | `[ ] Pendiente` |