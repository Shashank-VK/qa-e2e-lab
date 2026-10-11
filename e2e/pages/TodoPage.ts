import { expect, type Page } from '@playwright/test';

export class TodoPage {
  constructor(private readonly page: Page) {}

  readonly pageRoot = this.page.getByTestId('app-page');
  readonly todoInput = this.page.getByTestId('todo-input');
  readonly addButton = this.page.getByTestId('add-todo-button');
  readonly errorMessage = this.page.getByTestId('todo-error');
  readonly logoutButton = this.page.getByTestId('logout-button');

  async goto() {
    await this.page.goto('/app.html');
    await expect(this.pageRoot).toBeVisible();
  }

  todoRow(title: string) {
    return this.page
      .getByTestId('todo-item')
      .filter({ has: this.page.getByLabel(`Edit ${title}`, { exact: true }) })
      .first();
  }

  async expectTodoVisible(title: string) {
    await expect(this.todoRow(title)).toBeVisible();
  }

  async createTodo(title: string) {
    await this.todoInput.fill(title);
    await Promise.all([
      this.page.waitForResponse((response) => response.url().endsWith('/api/todos') && response.request().method() === 'POST'),
      this.addButton.click()
    ]);
    await this.expectTodoVisible(title);
  }

  async updateTodo(title: string, replacement: string) {
    const row = this.todoRow(title);
    await row.locator('input.edit-input').fill(replacement);
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes('/api/todos/') && response.request().method() === 'PUT'),
      row.getByTestId(/save-todo-/).click()
    ]);
    await this.expectTodoVisible(replacement);
  }

  async completeTodo(title: string) {
    const row = this.todoRow(title);
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes('/api/todos/') && response.request().method() === 'PUT'),
      row.getByTestId(/complete-todo-/).click()
    ]);
    await expect(row).toContainText('Completed');
  }

  async deleteTodo(title: string) {
    const row = this.todoRow(title);
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes('/api/todos/') && response.request().method() === 'DELETE'),
      row.getByTestId(/delete-todo-/).click()
    ]);
    await expect(row).toHaveCount(0);
  }
}
