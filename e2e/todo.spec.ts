import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { TodoPage } from './pages/TodoPage';

async function openTodoPage(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAsSeededUser();
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  return todoPage;
}

test.describe('todo CRUD and validation', () => {
  test('reads seeded todos on the dashboard', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.expectTodoVisible('Buy groceries');
    await todoPage.expectTodoVisible('Review test plan');
  });

  test('creates a todo from the form', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.createTodo('Write Playwright coverage');
  });

  test('updates a todo title', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.createTodo('Draft API checks');
    await todoPage.updateTodo('Draft API checks', 'Publish API checks');
  });

  test('marks a todo as complete', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.createTodo('Verify completion state');
    await todoPage.completeTodo('Verify completion state');
  });

  test('deletes a todo', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.createTodo('Remove this temporary todo');
    await todoPage.deleteTodo('Remove this temporary todo');
  });

  test('shows a validation error for an empty todo title', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.addButton.click();
    await expect(todoPage.errorMessage).toHaveText('Todo title is required');
  });

  test('shows a validation error when editing a todo to blank', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    const row = todoPage.todoRow('Buy groceries');
    await row.locator('input.edit-input').fill('   ');
    await row.getByTestId(/save-todo-/).click();
    await expect(todoPage.errorMessage).toHaveText('Todo title is required');
  });

  test('logs out and returns to the login page', async ({ page }) => {
    const todoPage = await openTodoPage(page);
    await todoPage.logoutButton.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('login-page')).toBeVisible();
  });
});
