# Project Structure

This document outlines the directory structure for the NexoStore project.

## Root

```
/
├── .env.local
├── .gitignore
├── .modified
├── apphosting.yaml
├── babel.config.js
├── components.json
├── GEMINI.md
├── jest.config.js
├── jest.setup.js
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── backend/
├── context/
├── docs/
├── src/
└── test/
```

## Backend (`/backend`)

The backend is a NestJS application responsible for API endpoints and business logic.

```
backend/
├── .env
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
├── prisma/
│   ├── dev.db
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20251028134918_init/
│       ├── 20251029134345_updated_product_images/
│       ├── 20251103154718_make_phone_mandatory/
│       └── 20251103162919_add_phone_country/
├── public/
│   └── uploads/
│       └── ... (archivos de imagen)
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── prisma.service.ts
│   ├── auth/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── local-auth.guard.ts
│   │   ├── local.strategy.ts
│   │   ├── roles.decorator.ts
│   │   └── roles.guard.ts
│   ├── products/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   └── products.service.ts
│   ├── supabase/
│   ├── upload/
│   └── users/
│       ├── dto/
│       ├── entities/
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
└── test/
    ├── app.controller.spec.ts
    ├── app.e2e-spec.ts
    ├── auth.e2e-spec.ts
    ├── products.service.spec.ts
    └── users.service.spec.ts
```

## Frontend (`/src`)

The frontend is a Next.js application using the App Router.

```
src/
├── ai/
│   ├── dev.ts
│   └── genkit.ts
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── actions/
│   │   └── product-actions.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── edit/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── users/
│   │       └── page.tsx
│   └── products/
│       └── [id]/
│           └── page.tsx
├── components/
│   ├── logo.tsx
│   ├── product-card.tsx
│   ├── product-contact.tsx
│   ├── user-nav.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/
│   │   ├── edit-product-form.tsx
│   │   ├── new-product-form.tsx
│   │   ├── product-actions.tsx
│   │   └── user-actions.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── main-nav.tsx
│   │   └── mobile-nav.tsx
│   └── ui/
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── phone-input.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       └── tooltip.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── lib/
    ├── api.ts
    ├── auth.ts
    ├── data.ts
    ├── placeholder-images.json
    ├── placeholder-images.ts
    ├── schemas.ts
    ├── types.ts
    └── utils.ts
```

## Testing (`/test`)

Contains all automated tests for the project.

```
test/
├── backend/
│   ├── app.controller.spec.ts
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── products.service.spec.ts
│   └── users.service.spec.ts
├── e2e/
│   ├── auth.e2e.spec.ts
│   ├── global-setup.ts
│   └── product-creation.e2e.spec.ts
└── frontend/
    ├── login-form.spec.tsx
    ├── new-product-form.spec.tsx
    ├── product-card.spec.tsx
    └── utils.spec.ts
```