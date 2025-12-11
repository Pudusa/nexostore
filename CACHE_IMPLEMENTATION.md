# Implementación de Caché con Redis para NextStore

## Objetivo
Implementar un sistema de caché con Redis para optimizar el rendimiento de las operaciones de lectura en la aplicación, especialmente para operaciones frecuentes como listado de productos y resumen de valoraciones.

## Componentes Implementados

### 1. Configuración de Redis Cache
- **Archivo**: `src/cache/cache.module.ts`
- **Tecnología**: `cache-manager` con `cache-manager-redis-store`
- **TTL por defecto**: 10 minutos para la mayoría de las entradas

### 2. Integración en el Módulo Principal
- **Archivo**: `src/app.module.ts`
- **Cambio**: Inclusión de `RedisCacheModule` en los imports

## Estrategia de Caché Implementada

### A. ProductsService (`src/products/products.service.ts`)

#### Lectura (GET Operations)
- **`findAll`**: Implementa caché con claves únicas basadas en los parámetros de paginación
  - Caché clave: `products_list_{limit}_{offset}_{includeOutOfStock}`
  - TTL: 10 minutos
  - Ventaja: Evita consultas repetidas a la base de datos para la misma página de productos

- **`findOne`**: Caché individual de producto
  - Caché clave: `product_{id}`
  - TTL: 10 minutos
  - Ventaja: Respuestas instantáneas para páginas de producto individuales

#### Escritura (POST/PUT/DELETE Operations - Invalidación)
- **`create`**: Invalida el caché de listas de productos después de crear un nuevo producto
  - Invalidación: `products_list_*` (borrado de todas las claves de listado relevantes)
  - Resultado: La nueva lista estará disponible inmediatamente para futuras consultas

- **`update`**: Invalida tanto el producto individual como las listas de productos
  - Invalidación: `product_{id}` y `products_list_*`
  - Resultado: Cambios reflejados inmediatamente

- **`remove`**: Invalida tanto el producto individual como las listas de productos
  - Invalidación: `product_{id}` y `products_list_*`
  - Resultado: Eliminación reflejada inmediatamente

- **`updateStockStatus`**: Invalida tanto el producto individual como las listas de productos
  - Invalidación: `product_{id}` y `products_list_*`
  - Resultado: Cambios de stock reflejados inmediatamente

### B. RatingsService (`src/ratings/ratings.service.ts`)

#### Lectura (GET Operations)
- **`getRatingsSummary`**: Caché de resumen de valoraciones por producto
  - Caché clave: `ratings_summary_{productId}`
  - TTL: 5 minutos (menor TTL porque las valoraciones pueden cambiar frecuentemente)
  - Ventaja: Evita cálculos repetidos de promedios de valoraciones

#### Escritura (POST Operations - Invalidación)
- **`upsertRating`**: Invalida el resumen de valoraciones después de actualizar una valoración
  - Invalidación: `ratings_summary_{productId}`
  - Resultado: Promedio actualizado reflejado inmediatamente

## Claves de Caché Utilizadas

### Products
- `products_list_{limit}_{offset}_{includeOutOfStock}` - Listados de productos con diferentes parámetros
- `product_{id}` - Producto individual

### Ratings
- `ratings_summary_{productId}` - Resumen de valoraciones por producto

## Estrategia de Invalidación

La clave de esta implementación es la **invalidación por eventos** en lugar de depender únicamente del TTL:

1. **Durante operaciones de escritura**, se borran las claves de caché afectadas
2. **Durante operaciones de lectura**, se verifica el caché antes de consultar la base de datos
3. **Si no hay caché**, se consulta la base de datos y se almacena el resultado

## Beneficios

1. **Rendimiento**: Reducción significativa de consultas a la base de datos
2. **Experiencia de usuario**: Respuestas más rápidas para operaciones comunes
3. **Consistencia**: Cambios reflejados inmediatamente gracias a la invalidación por eventos
4. **Escalabilidad**: Menor carga en la base de datos para operaciones de lectura

## Consideraciones de Producción

1. **Redis en producción**: Asegurar disponibilidad alta de Redis
2. **TTL configurables**: En producción, los TTL podrían ser variables según la criticidad de los datos
3. **Monitorización**: Monitorear hit rates y tamaño de caché
4. **Borrado por patrón**: Para implementaciones más complejas, considerar el uso directo de la API de Redis para borrar claves por patrón

## Variables de Entorno

- `UPSTASH_REDIS_REST_URL`: URL de conexión a Upstash Redis
- `UPSTASH_REDIS_REST_TOKEN`: Token de autenticación de Upstash Redis

## Archivos Clave

- `src/cache/cache.module.ts` - Configuración del módulo de caché
- `src/products/products.service.ts` - Implementación principal de caché e invalidación
- `src/ratings/ratings.service.ts` - Implementación secundaria de caché e invalidación
- `src/app.module.ts` - Integración del módulo de caché
- `REDIS_BULLMQ_SETUP.md` - Documentación sobre Redis (compartida con BullMQ)