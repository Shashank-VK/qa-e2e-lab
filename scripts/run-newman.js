const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const newman = require('newman');
const { createApp } = require('../demo-app/server');

const projectRoot = path.join(__dirname, '..');
const reportsDirectory = path.join(projectRoot, 'reports');
const collection = path.join(projectRoot, 'postman', 'qa-e2e-lab.collection.json');
const environment = path.join(projectRoot, 'postman', 'staging.environment.json');
const port = Number(process.env.PORT || 3000);

fs.mkdirSync(reportsDirectory, { recursive: true });
execFileSync(process.execPath, [path.join(projectRoot, 'demo-app', 'seed.js')], { stdio: 'inherit' });

const server = createApp().listen(port, '127.0.0.1', () => {
  console.log(`Newman test server listening on http://127.0.0.1:${port}`);
  newman.run({
    collection,
    environment,
    reporters: ['cli', 'junit', 'htmlextra'],
    reporter: {
      junit: { export: path.join(reportsDirectory, 'newman-results.xml') },
      htmlextra: { export: path.join(reportsDirectory, 'newman-report.html'), title: 'QA E2E Lab API Report' }
    }
  }, (error, summary) => {
    server.close(() => {
      if (error) {
        console.error(error);
        process.exitCode = 1;
        return;
      }
      const failures = summary?.run?.failures || [];
      if (failures.length > 0) {
        console.error(`Newman reported ${failures.length} failure(s).`);
        process.exitCode = 1;
        return;
      }
      console.log('Newman API suite passed.');
    });
  });
});

server.on('error', (error) => {
  console.error(`Unable to start Newman test server: ${error.message}`);
  process.exitCode = 1;
});
