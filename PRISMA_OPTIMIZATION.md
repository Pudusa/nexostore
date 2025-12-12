# Optimización de Consultas Prisma - NextStore

## Estrategia de Join y Prevención de Problemas N+1

### Configuración de Prisma

El proyecto utiliza Prisma 5.22.0 con la estrategia de relación optimizada:

```prisma
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  relationMode = "foreignKeys"  // Usa JOINs en lugar de consultas separadas
}
```

### Estrategias de Optimización Implementadas

#### 1. Uso de `select` en lugar de `include`
En lugar de usar `include` que puede traer datos innecesarios, se utiliza `select` para especificar exactamente qué campos se necesitan:

**Ejemplo antes (potencial problema N+1):**
```typescript
// Este enfoque puede causar N+1 queries
const products = await prisma.product.findMany();
const productsWithManagers = [];
for (const product of products) {
  const manager = await prisma.user.findUnique({ where: { id: product.managerId } });
  productsWithManagers.push({ ...product, manager });
}
```

**Ejemplo después (optimizado):**
```typescript
// Una sola consulta con JOIN
const products = await this.prisma.product.findMany({
  select: {
    id: true,
    name: true,
    description: true,
    price: true,
    averageRating: true,
    ratingCount: true,
    coverImage: true,
    isOutOfStock: true,
    createdAt: true,
    updatedAt: true,
    managerId: true,
    manager: {
      select: {
        id: true,
        name: true,
        phone: true,
      },
    },
    images: {
      select: {
        id: true,
        url: true,
        isCover: true,
      },
      take: 10, // Limitar número de imágenes
    }
  },
  take: limit,
  skip: offset,
  orderBy: { createdAt: 'desc' },
});
```

#### 2. Consultas con Transacciones
Las operaciones complejas se agrupan en transacciones para mayor eficiencia:

```typescript
const [products, totalItems] = await this.prisma.$transaction([
  this.prisma.product.findMany({
    // consulta principal
  }),
  this.prisma.product.count({
    // conteo
  }),
]);
```

#### 3. Paginación Optimizada
Las consultas implementan paginación para evitar traer todos los registros de una vez:

```typescript
const paginationResult = {
  data: products,
  totalItems,
  currentPage,
  totalPages,
  limit,
  offset,
};
```

### Servicios Optimizados

#### ProductsService
- **findAll()**: Consulta eficiente con relaciones pre-cargadas usando select
- **findOne()**: Recupera un producto con su manager e imágenes en una sola consulta
- **create()**: Uso eficiente de transacciones para crear producto e imágenes

#### UsersService
- **findAll()**: Consulta de usuarios con solo campos necesarios
- **remove()**: Usa include selectivamente solo cuando es necesario para la lógica de negocio

#### RatingsService
- **getRatingsWithUsers()**: Trae valoraciones con datos del usuario en una sola consulta
- **upsertRating()**: Transacción eficiente que actualiza tanto la valoración como las métricas del producto

### Beneficios de la Optimización

1. **Rendimiento Mejorado**: Reducción significativa en el número de consultas a la base de datos
2. **Tiempo de Respuesta**: Consultas más rápidas gracias a JOINs en el nivel de base de datos
3. **Uso de Memoria**: Menor consumo de memoria al traer solo los campos necesarios
4. **Escalabilidad**: El sistema puede manejar mayor cantidad de datos sin degradación de rendimiento

### Patrones de Consulta Recomendados

- Usar `select` con campos específicos en lugar de `include` para datos anidados
- Limitar el número de registros relacionados con `take`
- Usar transacciones para operaciones múltiples
- Implementar paginación para listados grandes
- Evitar consultas adicionales dentro de bucles