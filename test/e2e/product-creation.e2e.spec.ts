import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 1. Navigate to /login
  await page.goto('/login');
  await expect(page).toHaveURL('/login');

  // 2. Fill out the form with valid credentials
  await page.locator('input[name="email"]').fill('manager@nexostore.com');
  await page.locator('input[name="password"]').fill('password123');

  // 3. Submit the form
  await page.locator('button[type="submit"]').click();

  // 4. Verify redirection to the dashboard
  await expect(page).toHaveURL('/');
});

test('should allow a manager to create a new product', async ({ page }) => {
  // 1. Navigate to /dashboard/products
  await page.goto('/dashboard/products');
  await expect(page).toHaveURL('/dashboard/products');

  // 2. Click on "Añadir Nuevo Producto"
  await page.getByRole('link', { name: /añadir nuevo producto/i }).click();

  // 3. Fill out the new product form
  await page.locator('input[name="name"]').fill('Cartera de Cuero');
  await page
    .locator('textarea[name="description"]')
    .fill('Cartera de cuero para hombre');
  await page.locator('input[name="price"]').fill('75.50');

  // 4. Submit the form
  await page.getByRole('button', { name: /publicar producto/i }).click();

  // 5. Verify redirection to the products table
  await expect(page).toHaveURL('/dashboard/products');

  // 6. Verify that a product appears in the products table
  await expect(page.getByText("Cartera de Cuero")).toBeVisible();
});
