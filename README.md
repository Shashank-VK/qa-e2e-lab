# QA E2E Lab

QA automation portfolio project demonstrating browser and API test automation against a tiny bundled Express todo application. The application is intentionally small so the test suites show the engineering practices: Page Object Model, authentication state reuse, API assertions, schema validation, reports, and CI execution.

## Stack

- **Demo app:** Node.js, Express, vanilla HTML/CSS/JavaScript
- **Browser automation:** Playwright Test with TypeScript and Chromium
- **API automation:** Postman collection v2.1 executed headlessly by Newman
- **CI:** GitHub Actions on every push

## What is tested

### Playwright E2E

The suite contains 12 functional scenarios plus one authentication setup test:

- Valid login and invalid login credentials
- Required-field login validation
- Seeded todo list read flow
- Todo create, update, complete, and delete happy paths
- Required-field validation when creating and editing a todo
- Logout flow
- Authenticated dashboard access using a saved Playwright `storageState`

The tests use page objects in `e2e/pages/` and run serially against a seeded local app for deterministic CRUD coverage. Screenshots are captured only on failure, traces are collected on the first retry, and the HTML report is written to `playwright-report/`.

### Postman/Newman API

The collection in `postman/qa-e2e-lab.collection.json` covers:

- Successful and unsuccessful authentication
- Authorized list, create, get, update, and delete requests
- Unauthorized access rejection
- Blank-title validation
- Not-found behavior after deletion
- Status-code assertions on every request
- JSON-schema assertions on success and error responses

`postman/staging.environment.json` provides the local staging URL and runtime variables. The Newman runner resets the seed data, starts the demo server, and writes JUnit and HTML reports to `reports/`.

## Test matrix

| Suite name | What it covers | Count |
| --- | --- | ---: |
| Playwright E2E | Login, validation, todo CRUD, logout, and storage-state authentication | 12 functional tests (+ 1 setup test) |
| Postman/Newman API | Auth, CRUD, negative cases, status codes, and JSON schemas | 10 requests |

## Run locally

### Prerequisites

- Node.js 20+
- npm 10+

Install dependencies and Chromium once:

```bash
npm ci
npm run install:browsers
```

### Demo app

```bash
npm run seed
npm start
```

Open <http://127.0.0.1:3000>. The seeded account is `qa@example.com` / `Password123!`.

### Playwright

The Playwright web server hook seeds and starts the app automatically:

```bash
npm run test:e2e
```

Run with a visible browser:

```bash
npm run test:e2e:headed
```

View the generated report:

```bash
npx playwright show-report
```

### Postman/Newman

The npm script seeds the database, starts the API server, runs the collection headlessly with the staging environment, and closes the server:

```bash
npm run test:api
```

Generated files:

- `reports/newman-results.xml` — JUnit output for CI
- `reports/newman-report.html` — interactive HTML API report

Run both suites:

```bash
npm test
```

## Continuous integration

`.github/workflows/qa.yml` runs two independent jobs on every push:

1. **Playwright E2E** installs Chromium, runs the TypeScript browser suite, and uploads the HTML report and failure artifacts.
2. **Newman API** runs the Postman collection and uploads the JUnit and HTML reports.

The project uses only npm scripts for local and CI execution.
