describe('Posts Management', () => {
  let authToken;
  let testUser;

  before(() => {
    // Register and login a test user
    cy.request('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    }).then((response) => {
      testUser = response.body.user;
      authToken = response.body.token;
    });
  });

  beforeEach(() => {
    // Set auth token for each test
    window.localStorage.setItem('token', authToken);
  });

  it('should display posts list', () => {
    cy.visit('/posts');

    cy.get('[data-cy="posts-list"]').should('be.visible');
    cy.get('[data-cy="post-card"]').should('have.length.greaterThan', 0);
  });

  it('should create a new post', () => {
    cy.visit('/posts/new');

    cy.get('[data-cy="title-input"]').type('Test Post Title');
    cy.get('[data-cy="content-input"]').type('This is a test post content for e2e testing.');
    cy.get('[data-cy="category-select"]').select('Technology');
    cy.get('[data-cy="tags-input"]').type('test, e2e, cypress');
    cy.get('[data-cy="submit-button"]').click();

    cy.url().should('include', '/posts');
    cy.get('[data-cy="success-message"]').should('contain', 'Post created successfully');
    cy.get('[data-cy="post-card"]').first().should('contain', 'Test Post Title');
  });

  it('should edit an existing post', () => {
    // First create a post
    cy.request({
      method: 'POST',
      url: '/api/posts',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Post to Edit',
        content: 'Original content',
        category: '507f1f77bcf86cd799439011' // Mock category ID
      }
    });

    cy.visit('/posts');

    cy.get('[data-cy="post-card"]').first().within(() => {
      cy.get('[data-cy="edit-button"]').click();
    });

    cy.get('[data-cy="title-input"]').clear().type('Updated Post Title');
    cy.get('[data-cy="content-input"]').clear().type('Updated content for the post.');
    cy.get('[data-cy="submit-button"]').click();

    cy.get('[data-cy="success-message"]').should('contain', 'Post updated successfully');
    cy.get('[data-cy="post-card"]').first().should('contain', 'Updated Post Title');
  });

  it('should delete a post', () => {
    // First create a post
    cy.request({
      method: 'POST',
      url: '/api/posts',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Post to Delete',
        content: 'This post will be deleted',
        category: '507f1f77bcf86cd799439011'
      }
    });

    cy.visit('/posts');

    const initialPostCount = Cypress.$('[data-cy="post-card"]').length;

    cy.get('[data-cy="post-card"]').first().within(() => {
      cy.get('[data-cy="delete-button"]').click();
    });

    // Confirm deletion
    cy.get('[data-cy="confirm-delete"]').click();

    cy.get('[data-cy="success-message"]').should('contain', 'Post deleted successfully');
    cy.get('[data-cy="post-card"]').should('have.length', initialPostCount - 1);
  });

  it('should filter posts by category', () => {
    cy.visit('/posts');

    cy.get('[data-cy="category-filter"]').select('Technology');

    cy.get('[data-cy="post-card"]').each(($post) => {
      cy.wrap($post).should('contain', 'Technology');
    });
  });

  it('should search posts', () => {
    cy.visit('/posts');

    cy.get('[data-cy="search-input"]').type('test post');

    cy.get('[data-cy="post-card"]').each(($post) => {
      cy.wrap($post).should('contain', 'test post');
    });
  });

  it('should paginate posts', () => {
    // Create multiple posts to test pagination
    for (let i = 0; i < 15; i++) {
      cy.request({
        method: 'POST',
        url: '/api/posts',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          title: `Pagination Test Post ${i}`,
          content: `Content for post ${i}`,
          category: '507f1f77bcf86cd799439011'
        }
      });
    }

    cy.visit('/posts');

    // Should show first page with 10 posts
    cy.get('[data-cy="post-card"]').should('have.length', 10);

    // Navigate to next page
    cy.get('[data-cy="next-page"]').click();

    // Should show second page with remaining posts
    cy.get('[data-cy="post-card"]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="current-page"]').should('contain', '2');
  });

  it('should handle form validation errors', () => {
    cy.visit('/posts/new');

    // Try to submit empty form
    cy.get('[data-cy="submit-button"]').click();

    cy.get('[data-cy="error-message"]').should('contain', 'Title is required');
    cy.get('[data-cy="error-message"]').should('contain', 'Content is required');
  });

  it('should handle API errors gracefully', () => {
    // Simulate API error by visiting a non-existent post
    cy.visit('/posts/non-existent-id');

    cy.get('[data-cy="error-message"]').should('contain', 'Post not found');
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-6');

    cy.visit('/posts');

    cy.get('[data-cy="posts-list"]').should('be.visible');
    cy.get('[data-cy="post-card"]').should('be.visible');

    // Mobile menu should be accessible
    cy.get('[data-cy="mobile-menu"]').should('be.visible');
  });
});
