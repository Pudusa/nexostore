import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
  });

  test('should allow a user to log in and see the dashboard', async ({ page }) => {
    // 1. Check for the heading
    await expect(page.locator('header').getByRole('link', { name: /iniciar sesión/i })).toBeVisible();

    // 2. Fill out the form with valid credentials
    await page.locator('input[name="email"]').fill('manager@nexostore.com');
    await page.locator('input[name="password"]').fill('password123');

    // 3. Submit the form
    await page.locator('button[type="submit"]').click();

    // 4. Verify redirection to the dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /manager user/i })).toBeVisible();
  });

  test('should allow a logged-in user to log out', async ({ page }) => {
    // 5. Log in first
    await page.locator('input[name="email"]').fill('manager@nexostore.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/');

    // 6. Log out
    await page.getByRole('button', { name: /manager user/i }).click();
    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    // 7. Verify redirection to /login
    await expect(page).toHaveURL('/login');
  });
