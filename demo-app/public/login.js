const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('[data-testid="login-error"]');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  if (!email || !password) {
    loginError.textContent = 'Email and password are required';
    return;
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    loginError.textContent = 'Invalid email or password';
    return;
  }

  const result = await response.json();
  localStorage.setItem('qa-token', result.token);
  localStorage.setItem('qa-user', JSON.stringify(result.user));
  window.location.href = '/app.html';
});
