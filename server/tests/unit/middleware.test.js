// Mock mongoose and User model before requiring the modules
jest.mock('mongoose');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/User');

const { authenticate, authorize } = require('../../src/utils/auth');

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  email: 'test@example.com'
};

const User = require('../../src/models/User');
User.findById = jest.fn();

// Mock jwt
const jwt = require('jsonwebtoken');
jwt.sign = jest.fn();
jwt.verify = jest.fn();

describe('Authentication Middleware', () => {
  let testToken;

  beforeAll(() => {
    // Mock jwt.sign to return a test token
    jwt.sign.mockReturnValue('mocked.jwt.token');
    testToken = 'mocked.jwt.token';
  });

  describe('authenticate middleware', () => {
    beforeEach(() => {
      User.findById.mockClear();
    });

    it('should authenticate user with valid token', async () => {
      User.findById.mockResolvedValue(mockUser);
      jwt.verify.mockReturnValue({ userId: mockUser._id, email: mockUser.email });

      const req = {
        headers: {
          authorization: `Bearer ${testToken}`
        }
      };
      const res = {};
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(testToken, expect.any(String));
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for missing authorization header', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid authorization header format', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const req = {
        headers: {
          authorization: 'Bearer invalid.token.here'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('invalid.token.here', expect.any(String));
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token is not valid'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for token with non-existent user', async () => {
      User.findById.mockResolvedValue(null);
      jwt.verify.mockReturnValue({ userId: '507f1f77bcf86cd799439011', email: 'fake@example.com' });

      const req = {
        headers: {
          authorization: 'Bearer fake.token.here'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('fake.token.here', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token is not valid'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should call next for authorized requests', () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      authorize(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should be a placeholder for ownership authorization', () => {
      // This middleware is currently a placeholder
      // In a real implementation, it would check if the user owns the resource
      const req = {};
      const res = {};
      const next = jest.fn();

      authorize(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
