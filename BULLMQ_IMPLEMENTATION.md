# Implementación de Colas con BullMQ para Procesamiento de Imágenes

## Problema
El procesamiento de imágenes con Sharp bloqueaba el event loop de Node.js, causando que otros usuarios tuvieran que esperar hasta que se completara el procesamiento de imágenes.

## Solución Implementada
Implementación de BullMQ para procesar imágenes de manera asíncrona en segundo plano.

## Componentes Implementados

### 1. QueueService (`src/queue/queue.service.ts`)
- Configura la cola de procesamiento de imágenes
- Proporciona métodos para añadir trabajos a la cola
- Maneja la conexión a Redis

### 2. ImageProcessingWorker (`src/queue/image-processing.worker.ts`)
- Procesa imágenes usando Sharp en segundo plano
- Convierte imágenes a WebP con optimización
- Sube imágenes procesadas a Supabase
- Maneja reintentos y límites de concurrencia

### 3. Actualización de UploadController (`src/upload/upload.controller.ts`)
- Elimina el procesamiento síncrono de imágenes
- Añade archivos a la cola en lugar de procesarlos inmediatamente
- Responde inmediatamente con confirmación de recepción

## Flujo de Trabajo

1. **Usuario sube imagen** → Controlador recibe el archivo
2. **Controlador responde inmediatamente** → "Recibido" (no bloquea el event loop)
3. **Archivo se añade a la cola** → Se crea un trabajo en la cola
4. **Worker procesa la imagen** → En segundo plano, procesa con Sharp y sube a Supabase
5. **Cliente puede hacer polling opcionalmente** → Para verificar estado de procesamiento

## Beneficios

- **No bloqueo del event loop** → Otros usuarios pueden seguir usando la aplicación durante el procesamiento
- **Mayor escalabilidad** → Capacidad para manejar múltiples upload simultáneos
- **Robustez** → Manejo de fallos con reintentos automáticos
- **Control de concurrencia** → Limitación de procesamiento simultáneo para proteger los recursos

## Configuración

- **Concurrencia**: 5 trabajos simultáneos
- **Reintentos**: 3 veces con backoff exponencial
- **Timeout**: 30 segundos por trabajo
- **Límites**: 10 trabajos por 30 segundos para control de velocidad

## Consideraciones Importantes

### API Response Changes
- Antes: `{ uploadedImages: [...] }`
- Ahora: `{ message: 'Files added to processing queue successfully', queuedJobs: [...], totalFiles: X }`

### Cliente-side
- El cliente ahora recibe confirmación inmediata
- Para rastrear el estado de procesamiento, se puede implementar polling o WebSockets

### Redis
- Requiere una instancia de Redis para funcionar (usando Upstash Redis)
- Configurado con `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` environment variables
- No se utiliza `REDIS_URL` directamente, se configura a través del cliente de Upstash

## Implementación Futura
Para un sistema completo, considerar:
- Notificaciones al cliente cuando el procesamiento esté completo (WebSocket o polling)
- Estado de trabajos para monitorear el progreso
- Limpieza de buffers temporales si es necesario

## Archivos Clave

- `src/queue/queue.service.ts` - Servicio de cola
- `src/queue/image-processing.worker.ts` - Worker de procesamiento
- `src/queue/queue.module.ts` - Módulo de cola
- `src/upload/upload.controller.ts` - Controlador actualizado
- `src/app.module.ts` - Integración con módulo principal
- `src/supabase/supabase.service.ts` - Método `uploadFileFromBuffer` añadido