import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const authFile = path.join(process.cwd(), '.auth', 'user.json');

setup('save authenticated browser state', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAsSeededUser();
  await expect(page.getByTestId('app-page')).toBeVisible();
  await page.context().storageState({ path: authFile });
});
