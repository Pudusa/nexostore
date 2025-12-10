# Plan de Optimización de Rendimiento

## Tarea 1: Cambiar estrategia de cacheo para evitar 'force-dynamic'

**Prioridad:** Alta

**Objetivo:** Eliminar `dynamic = 'force-dynamic'` de la página de inicio y usar una estrategia de caché adecuada para mejorar el rendimiento de carga.

### Backend (NestJS & Prisma)
- Implementar respuesta con cabeceras de caché adecuadas para la API de productos
- Considerar usar Next.js Incremental Static Regeneration (ISR) en lugar de `force-dynamic`

### Frontend (Next.js)
- Actualizar la página principal para usar `export const revalidate = 3600` (por ejemplo, para regenerar cada hora)
- O implementar estrategia de caching con `fetch` API para datos de productos

---

## Tarea 2: Optimizar consultas de base de datos

**Prioridad:** Alta

**Objetivo:** Añadir índices adecuados al esquema de base de datos y optimizar las consultas de Prisma para mejorar la velocidad de obtención de datos.

### Backend (NestJS & Prisma)
- Añadir índices adecuados al esquema de Prisma para campos `isOutOfStock` y `managerId`
- Optimizar la consulta de Prisma en `products.service.ts` seleccionando solo campos necesarios
- Implementar carga selectiva de relaciones para evitar el problema N+1

---

## Tarea 3: Mejorar rendimiento del frontend

**Prioridad:** Media

**Objetivo:** Implementar carga diferida de imágenes y paginación para mejorar la experiencia de usuario.

### Frontend (Next.js & React)
- Añadir carga diferida (lazy loading) a las imágenes en las tarjetas de productos
- Implementar paginación con desplazamiento infinito
- Optimizar la cantidad inicial de productos mostrados

---

## Tarea 4: Revisar rendimiento de API externas

**Prioridad:** Media

**Objetivo:** Mejorar la resiliencia y rendimiento de las llamadas API externas.

### Backend & Frontend
- Añadir manejo de tiempo de espera a las llamadas API
- Considerar cachear respuestas de API en memoria por breves periodos
- Optimizar el tamaño de las respuestas de API enviando solo campos necesarios

---

## Tarea 5: Optimizar carga de datos

**Prioridad:** Baja

**Objetivo:** Reducir la sobrecarga de carga inicial de datos.

### Frontend (Next.js)
- Añadir paginación para limitar el número de productos obtenidos inicialmente
- Implementar una interfaz de carga de esqueleto mientras se cargan los datos