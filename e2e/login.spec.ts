import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('login flows', () => {
  test('logs in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsSeededUser();
    await expect(page.getByRole('heading', { name: 'Todo dashboard' })).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('qa@example.com', 'wrong-password');
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/$/);
  });

  test('validates required login fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toHaveText('Email and password are required');
  });
});
