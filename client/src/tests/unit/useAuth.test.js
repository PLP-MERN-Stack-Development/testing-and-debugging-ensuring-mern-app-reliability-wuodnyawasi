import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from '../../hooks/useAuth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('provides auth context to children', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('token');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isAuthenticated');
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('initializes with no user when no token', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('checks auth on mount when token exists', async () => {
    const mockToken = 'mock-token';
    const mockUser = { id: '1', username: 'testuser' };

    localStorageMock.getItem.mockReturnValue(mockToken);
    mockedAxios.get.mockResolvedValueOnce({
      data: { user: mockUser }
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/profile');
  });

  it('handles auth check failure', async () => {
    const mockToken = 'invalid-token';

    localStorageMock.getItem.mockReturnValue(mockToken);
    mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('logs in user successfully', async () => {
    const loginData = { email: 'test@example.com', password: 'password' };
    const mockResponse = {
      data: {
        token: 'new-token',
        user: { id: '1', username: 'testuser' }
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login(loginData.email, loginData.password);
    });

    expect(loginResult.success).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.token).toBe('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', loginData);
  });

  it('handles login failure', async () => {
    const loginData = { email: 'test@example.com', password: 'wrongpassword' };
    const errorResponse = {
      response: { data: { error: 'Invalid credentials' } }
    };

    mockedAxios.post.mockRejectedValueOnce(errorResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login(loginData.email, loginData.password);
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid credentials');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('registers user successfully', async () => {
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    };
    const mockResponse = {
      data: {
        token: 'new-token',
        user: { id: '1', username: 'testuser' }
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register(
        registerData.username,
        registerData.email,
        registerData.password
      );
    });

    expect(registerResult.success).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles registration failure', async () => {
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    };
    const errorResponse = {
      response: { data: { error: 'User already exists' } }
    };

    mockedAxios.post.mockRejectedValueOnce(errorResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register(
        registerData.username,
        registerData.email,
        registerData.password
      );
    });

    expect(registerResult.success).toBe(false);
    expect(registerResult.error).toBe('User already exists');
  });

  it('logs out user', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set initial state
    act(() => {
      result.current.logout();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets axios default headers with token', async () => {
    const mockToken = 'test-token';
    localStorageMock.getItem.mockReturnValue(mockToken);

    mockedAxios.get.mockResolvedValueOnce({
      data: { user: { id: '1', username: 'testuser' } }
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });
  });

  it('removes axios default headers on logout', () => {
    axios.defaults.headers.common['Authorization'] = 'Bearer test-token';

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
