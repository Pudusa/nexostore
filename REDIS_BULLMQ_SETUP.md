# Configuración de Redis y BullMQ para NextStore

## Requisitos

Para que la implementación de colas funcione correctamente, necesitas tener una instancia de Upstash Redis configurada.

## Configuración de Redis

### Opción 1: Upstash Redis (requerido)
1. Crea una cuenta en Upstash: https://upstash.com/
2. Crea una base de datos Redis
3. Obten las credenciales (URL y token) para configurar las variables de entorno

## Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Uso del Sistema de Colas

### Cómo funciona ahora:

1. **Usuario sube imagen(s)**: El controlador recibe los archivos y responde inmediatamente con:
   ```json
   {
     "message": "Files added to processing queue successfully",
     "queuedJobs": [
       { "originalName": "imagen1.jpg", "jobId": "1" }
     ],
     "totalFiles": 1
   }
   ```

2. **Procesamiento en segundo plano**: Los workers procesan las imágenes en segundo plano:
   - Conversión a WebP con Sharp
   - Optimización de tamaño
   - Subida a Supabase

3. **Beneficios**:
   - El event loop de Node.js no se bloquea
   - Otros usuarios pueden seguir interactuando con la aplicación
   - Procesamiento en paralelo con control de concurrencia

## Monitorización de Colas

Para monitorear el estado de las colas, puedes usar Bull Board u otros paquetes de visualización para BullMQ.

## Consideraciones de Producción

1. **Redis en producción**:
   - Configura Redis con persistencia si es necesario
   - Asegúrate de tener alta disponibilidad si es crítico

2. **Workers**:
   - Puedes escalar horizontalmente los workers según la carga
   - Configura la concurrencia según los recursos disponibles

3. **Manejo de errores**:
   - Los trabajos fallidos se reintentan automáticamente (hasta 3 veces)
   - Se usa backoff exponencial para evitar sobrecarga

## API Changes

El endpoint `/upload/images` ahora responde más rápido (menos de 1 segundo) pero el procesamiento real ocurre en segundo plano. Si necesitas rastrear el estado de procesamiento, puedes:

1. Implementar un sistema de polling
2. Usar WebSockets para notificaciones en tiempo real
3. Consultar el estado de los trabajos de BullMQ directamente

## Recursos

- [Documentación de BullMQ](https://docs.bullmq.io/)
- [Documentación de ioredis](https://redis.github.io/ioredis/)
- [Guía de concurrencia en Node.js](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)