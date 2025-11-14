import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught exception:', err);
  return false;
});

Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = function(...args) {
    console.log('Fetch request:', args[0]);
    return originalFetch.apply(this, args);
  };
});
