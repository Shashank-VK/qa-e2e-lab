const fs = require('fs');
const path = require('path');
const express = require('express');

const dataDirectory = path.join(__dirname, 'data');
const databasePath = path.join(dataDirectory, 'db.json');
const seedPath = path.join(dataDirectory, 'seed.json');
const publicDirectory = path.join(__dirname, 'public');
const validToken = 'qa-demo-token';

function readDatabase() {
  if (!fs.existsSync(databasePath)) {
    fs.copyFileSync(seedPath, databasePath);
  }
  return JSON.parse(fs.readFileSync(databasePath, 'utf8'));
}

function writeDatabase(database) {
  fs.writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(publicDirectory));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.post('/api/auth/login', (request, response) => {
    const { email, password } = request.body || {};
    const database = readDatabase();
    const user = database.users.find((candidate) => candidate.email === email);

    if (!user || user.password !== password) {
      return response.status(401).json({ error: 'Invalid email or password' });
    }

    return response.json({
      token: validToken,
      user: { id: user.id, email: user.email, name: user.name }
    });
  });

  app.use('/api/todos', (request, response, next) => {
    const authorization = request.get('authorization');
    if (authorization !== `Bearer ${validToken}`) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    return next();
  });

  app.get('/api/todos', (request, response) => {
    const database = readDatabase();
    response.json(database.todos);
  });

  app.get('/api/todos/:id', (request, response) => {
    const database = readDatabase();
    const todo = database.todos.find((item) => item.id === Number(request.params.id));
    if (!todo) {
      return response.status(404).json({ error: 'Todo not found' });
    }
    return response.json(todo);
  });

  app.post('/api/todos', (request, response) => {
    const title = typeof request.body?.title === 'string' ? request.body.title.trim() : '';
    if (!title) {
      return response.status(400).json({ error: 'Title is required' });
    }

    const database = readDatabase();
    const now = new Date().toISOString();
    const todo = {
      id: database.todos.reduce((highest, item) => Math.max(highest, item.id), 0) + 1,
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
      userId: 1
    };
    database.todos.push(todo);
    writeDatabase(database);
    return response.status(201).json(todo);
  });

  app.put('/api/todos/:id', (request, response) => {
    const database = readDatabase();
    const todo = database.todos.find((item) => item.id === Number(request.params.id));
    if (!todo) {
      return response.status(404).json({ error: 'Todo not found' });
    }

    if (request.body?.title !== undefined) {
      if (typeof request.body.title !== 'string' || !request.body.title.trim()) {
        return response.status(400).json({ error: 'Title is required' });
      }
      todo.title = request.body.title.trim();
    }
    if (request.body?.completed !== undefined) {
      if (typeof request.body.completed !== 'boolean') {
        return response.status(400).json({ error: 'Completed must be a boolean' });
      }
      todo.completed = request.body.completed;
    }
    todo.updatedAt = new Date().toISOString();
    writeDatabase(database);
    return response.json(todo);
  });

  app.delete('/api/todos/:id', (request, response) => {
    const database = readDatabase();
    const index = database.todos.findIndex((item) => item.id === Number(request.params.id));
    if (index === -1) {
      return response.status(404).json({ error: 'Todo not found' });
    }
    database.todos.splice(index, 1);
    writeDatabase(database);
    return response.status(204).send();
  });

  app.get('/', (_request, response) => {
    response.sendFile(path.join(publicDirectory, 'index.html'));
  });

  app.get('/app.html', (_request, response) => {
    response.sendFile(path.join(publicDirectory, 'app.html'));
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, '0.0.0.0', () => {
    console.log(`QA demo app listening on http://127.0.0.1:${port}`);
  });
}

module.exports = { createApp, validToken };
