import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  readonly emailInput = this.page.getByTestId('email-input');
  readonly passwordInput = this.page.getByTestId('password-input');
  readonly loginButton = this.page.getByTestId('login-button');
  readonly errorMessage = this.page.getByTestId('login-error');

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByTestId('login-page')).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsSeededUser() {
    await this.login('qa@example.com', 'Password123!');
    await expect(this.page).toHaveURL(/\/app\.html$/);
  }
}
