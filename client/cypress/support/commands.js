Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.request('POST', '/api/auth/login', { email, password })
      .then((response) => {
        window.localStorage.setItem('token', response.body.token);
      });
  });
});

Cypress.Commands.add('register', (username, email, password) => {
  cy.request('POST', '/api/auth/register', { username, email, password })
    .then((response) => {
      window.localStorage.setItem('token', response.body.token);
    });
});

Cypress.Commands.add('createPost', (postData) => {
  cy.request({
    method: 'POST',
    url: '/api/posts',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`
    },
    body: postData
  });
});

Cypress.Commands.add('resetDb', () => {
  cy.request('POST', '/api/test/reset');
});

Cypress.Commands.add('waitForApi', (method, url) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();

  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
});

Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});
