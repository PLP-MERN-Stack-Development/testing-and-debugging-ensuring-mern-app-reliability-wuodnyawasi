describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset database state before each test
    cy.request('POST', '/api/test/reset');
  });

  it('should allow user registration', () => {
    cy.visit('/register');

    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="register-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="welcome-message"]').should('contain', 'Welcome testuser');
  });

  it('should allow user login', () => {
    // First register a user
    cy.request('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    cy.visit('/login');

    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-menu"]').should('contain', 'testuser');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');

    cy.get('[data-cy="email-input"]').type('wrong@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();

    cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('should allow user logout', () => {
    // Login first
    cy.request('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    }).then((response) => {
      window.localStorage.setItem('token', response.body.token);
    });

    cy.visit('/dashboard');

    cy.get('[data-cy="logout-button"]').click();

    cy.url().should('include', '/login');
    cy.window().its('localStorage.token').should('be.undefined');
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/dashboard');

    cy.url().should('include', '/login');
  });

  it('should persist authentication across page reloads', () => {
    // Login first
    cy.request('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    }).then((response) => {
      window.localStorage.setItem('token', response.body.token);
    });

    cy.visit('/dashboard');

    cy.reload();

    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-menu"]').should('contain', 'testuser');
  });
});
