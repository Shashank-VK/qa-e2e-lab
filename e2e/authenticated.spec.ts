import path from 'node:path';
import { test, expect } from '@playwright/test';

test.use({ storageState: path.join(process.cwd(), '.auth', 'user.json') });

test('opens an authenticated dashboard with Playwright storage state', async ({ page }) => {
  await page.goto('/app.html');
  await expect(page.getByTestId('app-page')).toBeVisible();
  await expect(page.getByTestId('login-page')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Todo dashboard' })).toBeVisible();
});
