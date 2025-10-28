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

### 5.1 Estructura de Proyecto

| Directorio | Propósito |
| :--- | :--- |
| `src/` | Raíz para todo el código fuente de la aplicación. |
| `src/app/` | Exclusivamente para la estructura de rutas del App Router. |
| `src/modules/` | Organizar por características de negocio (ej. `product-catalog`), no por tipo de archivo. |
| `src/core/` o `src/lib/` | Para lógica, utilidades y tipos verdaderamente globales (cliente API, contextos, etc.). |

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
