const { defineConfig } = require("@playwright/test");

// These default to the project's standard dev setup (Django on 8000, which
// matches the "proxy" field in package.json, and CRA's default port 3000),
// so `npx playwright test` works out of the box. Override via env vars only
// if those ports are already in use on your machine - if you change
// BACKEND_PORT you must also update package.json's "proxy" field (or add a
// src/setupProxy.js) to match, since CRA's dev-server proxy target is what
// actually routes the app's /api/* calls to Django.
const BACKEND_PORT = process.env.BACKEND_PORT || "8000";
const FRONTEND_PORT = process.env.FRONTEND_PORT || "3000";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    headless: true,
  },
  webServer: [
    {
      command: `python manage.py runserver 127.0.0.1:${BACKEND_PORT} --noreload`,
      cwd: "../adonai_backend",
      url: `http://127.0.0.1:${BACKEND_PORT}/api/hero/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: "npm start",
      cwd: ".",
      port: Number(FRONTEND_PORT),
      env: { PORT: FRONTEND_PORT, BROWSER: "none" },
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
