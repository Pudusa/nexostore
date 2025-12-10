# AGENTS.md

## Commands
- **Frontend**: `npm run dev`, `npm run build`, `npm run lint`
- **Backend**: `cd backend && npm run start:dev`, `npm run build`, `npm run lint`
- **Tests**: 
  - Frontend: `npm test -- --testPathPattern=filename`
  - Backend: `npm test -- backend --testPathPattern=filename`
  - E2E: `npx playwright test`
- **Format**: `cd backend && npm run format`

## Code Style
- **Imports**: Use absolute imports with `@/` prefix for frontend, module aliases for backend
- **Formatting**: Prettier with single quotes, trailing commas
- **Types**: Strict TypeScript enabled, avoid `any` (allowed in backend)
- **Naming**: camelCase for variables, PascalCase for components/classes
- **Error Handling**: Use try/catch, proper HTTP status codes
- **Frontend**: Next.js 14, Tailwind CSS, Radix UI components
- **Backend**: NestJS with Prisma ORM, JWT auth, DTOs for validation