const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Post = require('../../src/models/Post');
const Category = require('../../src/models/Category');
const User = require('../../src/models/User');

let mongoServer;

jest.setTimeout(60000);

describe('Post Model', () => {
  let testUser;
  let testCategory;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);

      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      testCategory = await Category.create({
        name: 'Test Category',
        description: 'A test category',
        slug: 'test-category'
      });
    } catch (error) {
      console.error('Failed to setup MongoDB:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  });

  describe('Post Creation', () => {
    it('should create a post with valid data', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        author: testUser._id,
        category: testCategory._id,
        slug: 'test-post'
      };

      const post = new Post(postData);
      const savedPost = await post.save();

      expect(savedPost._id).toBeDefined();
      expect(savedPost.title).toBe(postData.title);
      expect(savedPost.content).toBe(postData.content);
      expect(savedPost.author.toString()).toBe(testUser._id.toString());
      expect(savedPost.category.toString()).toBe(testCategory._id.toString());
      expect(savedPost.slug).toBe(postData.slug);
      expect(savedPost.published).toBe(true);
      expect(savedPost.createdAt).toBeDefined();
      expect(savedPost.updatedAt).toBeDefined();
    });

    it('should fail to create post without required fields', async () => {
      const invalidPost = new Post({
        title: 'Test Post'
        // Missing content, author, category, slug
      });

      await expect(invalidPost.save()).rejects.toThrow();
    });

    it('should enforce unique slug', async () => {
      const post1 = new Post({
        title: 'Test Post 1',
        content: 'Content 1',
        author: testUser._id,
        category: testCategory._id,
        slug: 'unique-slug'
      });

      const post2 = new Post({
        title: 'Test Post 2',
        content: 'Content 2',
        author: testUser._id,
        category: testCategory._id,
        slug: 'unique-slug' // Same slug
      });

      await post1.save();
      await expect(post2.save()).rejects.toThrow();
    });

    it('should update updatedAt on save', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Content',
        author: testUser._id,
        category: testCategory._id,
        slug: 'test-post'
      });

      const savedPost = await post.save();
      const originalUpdatedAt = savedPost.updatedAt;

      // Wait a bit and save again
      await new Promise(resolve => setTimeout(resolve, 10));
      savedPost.title = 'Updated Title';
      await savedPost.save();

      expect(savedPost.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Post Validation', () => {
    it('should enforce title length limits', async () => {
      const longTitle = 'a'.repeat(201); // 201 characters
      const post = new Post({
        title: longTitle,
        content: 'Content',
        author: testUser._id,
        category: testCategory._id,
        slug: 'test-post'
      });

      await expect(post.save()).rejects.toThrow();
    });

    it('should allow empty tags array', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Content',
        author: testUser._id,
        category: testCategory._id,
        slug: 'test-post',
        tags: []
      });

      const savedPost = await post.save();
      expect(savedPost.tags).toEqual([]);
    });

    it('should allow tags array with values', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Content',
        author: testUser._id,
        category: testCategory._id,
        slug: 'test-post',
        tags: ['tag1', 'tag2', 'tag3']
      });

      const savedPost = await post.save();
      expect(savedPost.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });
});

describe('Category Model', () => {
  describe('Category Creation', () => {
    it('should create a category with valid data', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Posts about technology',
        slug: 'technology'
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory._id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBe(categoryData.description);
      expect(savedCategory.slug).toBe(categoryData.slug);
      expect(savedCategory.createdAt).toBeDefined();
    });

    it('should enforce unique name and slug', async () => {
      const category1 = new Category({
        name: 'Technology',
        description: 'Tech posts',
        slug: 'technology'
      });

      const category2 = new Category({
        name: 'Technology', // Same name
        description: 'More tech posts',
        slug: 'technology' // Same slug
      });

      await category1.save();
      await expect(category2.save()).rejects.toThrow();
    });

    it('should fail without required fields', async () => {
      const invalidCategory = new Category({
        description: 'No name or slug'
      });

      await expect(invalidCategory.save()).rejects.toThrow();
    });
  });

  describe('Category Validation', () => {
    it('should enforce name length limits', async () => {
      const longName = 'a'.repeat(51); // 51 characters
      const category = new Category({
        name: longName,
        slug: 'test-slug'
      });

      await expect(category.save()).rejects.toThrow();
    });

    it('should enforce description length limits', async () => {
      const longDescription = 'a'.repeat(201); // 201 characters
      const category = new Category({
        name: 'Test Category',
        description: longDescription,
        slug: 'test-slug'
      });

      await expect(category.save()).rejects.toThrow();
    });

    it('should trim whitespace from fields', async () => {
      const category = new Category({
        name: '  Technology  ',
        description: '  Tech posts  ',
        slug: '  technology  '
      });

      const savedCategory = await category.save();
      expect(savedCategory.name).toBe('Technology');
      expect(savedCategory.description).toBe('Tech posts');
      expect(savedCategory.slug).toBe('technology');
    });
  });
});
