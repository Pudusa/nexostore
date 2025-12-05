# Plan de Tareas del Proyecto

## Tarea 1: Sistema de Valoraciones y Comentarios (Estilo Play Store) - EN PROGRESO

**Prioridad:** Alta

**Objetivo:** Crear un sistema donde los usuarios puedan calificar productos con estrellas (de 1 a 5) y opcionalmente dejar un comentario. La vista principal mostrará un resumen de cuántas personas han votado por cada estrella, y cada comentario mostrará qué usuario lo hizo y su calificación.

### Backend (NestJS & Prisma)
- **Base de Datos:** Verificar que el modelo `Rating` en `schema.prisma` sea correcto. (Ya completado)
- **Servicio (`ratings.service.ts`):** Implementar la lógica para obtener un resumen de valoraciones (conteo por estrella) y la lista de comentarios paginados, incluyendo la información del usuario (`name`, `avatarUrl`). (Ya completado)
- **Controlador (`ratings.controller.ts`):** Exponer los endpoints `GET /products/:id/ratings-summary` y `GET /products/:id/ratings`. También, asegurar que el endpoint `POST` para crear/actualizar valoraciones acepte comentarios. (Ya completado)

### Frontend (Next.js & React)
- **Componentes de UI:**
    - `RatingSummary.tsx`: Para mostrar el promedio de estrellas y las barras de progreso.
    - `CommentList.tsx`: Para listar los comentarios, mostrando el avatar, nombre del usuario y su calificación.
    - `RatingForm.tsx`: Formulario para enviar calificación y comentario.
- **Lógica de Datos:** Usar **Server Actions** para comunicar el formulario con el backend.

---

## Tarea 2: Optimización de Imágenes

**Prioridad:** Media

**Objetivo:** Reducir el peso de las imágenes subidas para mejorar la velocidad de carga, sin pérdida de calidad perceptible.

### Estrategia (Procesamiento en Backend)
- **Librería:** Utilizar `sharp`.
- **Flujo:**
    1. Interceptar la subida de la imagen en el backend.
    2. Redimensionar a un tamaño máximo (ej. 1200x1200px).
    3. Convertir la imagen al formato **WebP**.
    4. Guardar la imagen optimizada en Supabase Storage.

---

## Tarea 3: Editor de Imágenes de Perfil (Estilo WhatsApp)

**Prioridad:** Baja

**Objetivo:** Permitir a los usuarios recortar su foto de perfil con una máscara circular antes de guardarla.

### Estrategia (Implementación en Frontend)
- **Librería:** Utilizar `cropper.js` o una similar.
- **Flujo:**
    1. El usuario selecciona una imagen.
    2. Se muestra la imagen en un modal con la interfaz de `cropper.js`.
    3. Se configura la herramienta para tener un área de recorte **circular**. El usuario podrá mover y escalar la imagen de fondo.
    4. Al guardar, solo la imagen recortada se envía al backend.