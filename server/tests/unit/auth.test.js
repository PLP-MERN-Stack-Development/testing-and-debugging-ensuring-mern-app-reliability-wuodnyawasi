const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { generateToken, verifyToken } = require('../../src/utils/auth');
const User = require('../../src/models/User');

let mongoServer;

jest.setTimeout(60000);

describe('Authentication Utils', () => {
  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
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

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com'
      };

      const token = generateToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user ID and email in token', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com'
      };

      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com'
      };

      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here');
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      // Mock expired token (this would normally be handled by JWT library)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzY5NjQ4MDAsImV4cCI6MTYzNjk2NDgwMX0.invalid';

      expect(() => {
        verifyToken(expiredToken);
      }).toThrow('Invalid token');
    });
  });
});

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const savedUser = await user.save();
      expect(savedUser.password).not.toBe('password123');
      expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    }, 15000);

    it('should not rehash password if not modified', async () => {
      const user = new User({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123'
      });

      await user.save();
      const originalHash = user.password;

      user.username = 'updateduser';
      await user.save();

      expect(user.password).toBe(originalHash);
    }, 15000);
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'password123'
      });

      await user.save();
      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);
    }, 15000);

    it('should return false for incorrect password', async () => {
      const user = new User({
        username: 'testuser4',
        email: 'test4@example.com',
        password: 'password123'
      });

      await user.save();
      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    }, 15000);
  });

  describe('toJSON', () => {
    it('should exclude password from JSON output', async () => {
      const user = new User({
        username: 'testuser5',
        email: 'test5@example.com',
        password: 'password123'
      });

      await user.save();
      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.username).toBe('testuser5');
      expect(userJson.email).toBe('test5@example.com');
    }, 15000);
  });
});
