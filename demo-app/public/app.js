const token = localStorage.getItem('qa-token');
if (!token) {
  window.location.replace('/');
}

const todoList = document.querySelector('#todo-list');
const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-title');
const todoError = document.querySelector('[data-testid="todo-error"]');
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

function showError(message) {
  todoError.textContent = message;
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (response.status === 401) {
    localStorage.clear();
    window.location.replace('/');
    return null;
  }
  return response;
}

function renderTodos(todos) {
  todoList.innerHTML = todos.map((todo) => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-testid="todo-item" data-todo-id="${todo.id}">
      <div class="todo-content">
        <input class="edit-input" aria-label="Edit ${escapeHtml(todo.title)}" value="${escapeHtml(todo.title)}" data-testid="edit-title-${todo.id}" />
        <span class="status" data-testid="todo-status-${todo.id}">${todo.completed ? 'Completed' : 'Open'}</span>
      </div>
      <div class="todo-actions">
        <button type="button" class="secondary" data-action="save" data-testid="save-todo-${todo.id}">Save</button>
        <button type="button" class="secondary" data-action="complete" data-testid="complete-todo-${todo.id}">${todo.completed ? 'Reopen' : 'Complete'}</button>
        <button type="button" class="danger" data-action="delete" data-testid="delete-todo-${todo.id}">Delete</button>
      </div>
    </li>
  `).join('');
}

async function loadTodos() {
  const response = await request('/api/todos');
  if (response?.ok) {
    renderTodos(await response.json());
  }
}

todoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');
  const title = todoInput.value.trim();
  if (!title) {
    showError('Todo title is required');
    return;
  }

  const response = await request('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
  if (response?.ok) {
    todoInput.value = '';
    await loadTodos();
  }
});

todoList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const item = button.closest('[data-todo-id]');
  const id = item.dataset.todoId;
  showError('');

  if (button.dataset.action === 'delete') {
    const response = await request(`/api/todos/${id}`, { method: 'DELETE' });
    if (response?.ok) await loadTodos();
    return;
  }

  if (button.dataset.action === 'complete') {
    const response = await request(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: button.textContent.trim() !== 'Reopen' })
    });
    if (response?.ok) await loadTodos();
    return;
  }

  const title = item.querySelector('.edit-input').value.trim();
  if (!title) {
    showError('Todo title is required');
    return;
  }
  const response = await request(`/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title })
  });
  if (response?.ok) await loadTodos();
});

document.querySelector('[data-testid="logout-button"]').addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('/');
});

loadTodos();
