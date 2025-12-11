# Implementación de Cacheo con Redis para NextStore

## Descripción General

Implementamos un sistema de cacheo con Redis para mejorar el rendimiento de lectura en la aplicación NextStore, especialmente para operaciones frecuentes como el listado de productos y resumen de valoraciones. Además, implementamos estrategias de invalidación por eventos para mantener la coherencia de datos.

## Componentes Implementados

### 1. Configuración de Redis Cache (`src/cache/cache.module.ts`)
- **Configuración flexible**: Soporta tanto Redis local como Upstash Redis
- **Variables de entorno**: 
  - `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` para usar Upstash Redis
- **TTL por defecto**: 10 minutos (600 segundos)

### 2. ProductsService (`src/products/products.service.ts`)
- **Cacheo de listas**: El método `findAll` implementa cacheo con claves basadas en parámetros de paginación
- **Cacheo individual**: El método `findOne` implementa cacheo de productos individuales
- **Invalidación por eventos**: Operaciones de escritura invalidan claves de caché relevantes

### 3. RatingsService (`src/ratings/ratings.service.ts`)
- **Cacheo de resúmenes**: El método `getRatingsSummary` implementa cacheo de estadísticas de valoraciones
- **Invalidación**: El método `upsertRating` invalida las claves de caché afectadas

## Estrategia de Invalidación

### Patrones de Claves
- Listas de productos: `products_list_{limit}_{offset}_{includeOutOfStock}`
- Producto individual: `product_{id}`
- Resumen de valoraciones: `ratings_summary_{productId}`

### Reglas de Invalidación

#### Productos
- `create`: Borra todas las claves de tipo `products_list_*`
- `update`: Borra `products_list_*` y `product_{id}`
- `delete`: Borra `products_list_*` y `product_{id}`
- `updateStockStatus`: Borra `products_list_*` y `product_{id}`

#### Valoraciones
- `upsertRating`: Borra `ratings_summary_{productId}`

## Beneficios

1. **Rendimiento**: Reducción significativa del tiempo de respuesta para operaciones de lectura frecuentes
2. **Menor carga en DB**: Reducción de consultas a la base de datos
3. **Experiencia de usuario**: Páginas de inicio y catálogos se cargan más rápidamente
4. **Escalabilidad**: Reduce la carga sobre la base de datos permitiendo mayor escalabilidad
5. **Coherencia de datos**: Invalidación por eventos garantiza que los cambios se reflejen rápidamente

## Consideraciones Técnicas

- **TTL razonable**: 10 minutos para listas de productos, 5 minutos para valoraciones
- **Tipado seguro**: Se definen correctamente los tipos para evitar errores de compilación
- **Manejo de errores**: Implementación robusta con manejo de casos donde el producto no existe en caché ni en DB
- **Patrón de diseño**: Implementación siguiendo las mejores prácticas de NestJS

## Variables de Entorno

Para usar Upstash Redis:
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Integración con la Aplicación

1. El módulo de cacheo se registra globalmente en `app.module.ts`
2. Todos los servicios que utilizan cacheo inyectan `CACHE_MANAGER`
3. Las claves de cacheo siguen un patrón predecible para facilitar la invalidación

## Próximos Pasos

1. **Monitoreo de caché**: Implementar métricas para monitorear hit rates
2. **Políticas de cacheo avanzadas**: Considerar diferentes TTLs según la popularidad de productos
3. **Cacheo de otras entidades**: Extender cacheo a usuarios, categorías, etc.
4. **Cacheo en frontend**: Considerar cacheo HTTP con etags para recursos estáticos

## Solución al Problema Original

Esta implementación resuelve el problema de tener que consultar a Supabase en cada solicitud de la "Home Page", al almacenar en caché los datos de productos y valoraciones frecuentemente accedidos. Además, la estrategia de invalidación por eventos asegura que los cambios se reflejen rápidamente sin tener que esperar a que expire el TTL.