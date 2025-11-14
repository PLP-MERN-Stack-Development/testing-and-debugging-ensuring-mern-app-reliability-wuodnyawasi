import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { usePosts } from '../../hooks/usePosts';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('usePosts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPosts = [
    {
      _id: '1',
      title: 'Post 1',
      content: 'Content 1',
      author: { username: 'user1' },
      category: { name: 'Tech' }
    },
    {
      _id: '2',
      title: 'Post 2',
      content: 'Content 2',
      author: { username: 'user2' },
      category: { name: 'Lifestyle' }
    }
  ];

  const mockPagination = {
    currentPage: 1,
    totalPages: 2,
    totalPosts: 15,
    hasNext: true,
    hasPrev: false
  };

  it('fetches posts on mount', async () => {
    const mockResponse = {
      data: {
        posts: mockPosts,
        pagination: mockPagination
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => usePosts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual(mockPosts);
      expect(result.current.pagination).toEqual(mockPagination);
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts?page=1&limit=10');
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Network error';
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.posts).toEqual([]);
    });
  });

  it('creates post successfully', async () => {
    const newPost = {
      title: 'New Post',
      content: 'New content',
      category: 'category-id'
    };

    const createdPost = { ...newPost, _id: '3' };
    const mockCreateResponse = { data: createdPost };
    const mockFetchResponse = {
      data: {
        posts: [...mockPosts, createdPost],
        pagination: { ...mockPagination, totalPosts: 16 }
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockCreateResponse);
    mockedAxios.get.mockResolvedValueOnce(mockFetchResponse);

    const { result } = renderHook(() => usePosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let createResult;
    await act(async () => {
      createResult = await result.current.createPost(newPost);
    });

    expect(createResult.success).toBe(true);
    expect(createResult.post).toEqual(createdPost);
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/posts', newPost);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Initial + after create
  });

  it('handles create post error', async () => {
    const newPost = {
      title: 'New Post',
      content: 'New content',
      category: 'category-id'
    };

    const errorMessage = 'Validation error';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    const { result } = renderHook(() => usePosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let createResult;
    await act(async () => {
      createResult = await result.current.createPost(newPost);
    });

    expect(createResult.success).toBe(false);
    expect(createResult.error).toBe(errorMessage);
    expect(result.current.error).toBe(errorMessage);
  });

  it('updates post successfully', async () => {
    const updatedPost = { ...mockPosts[0], title: 'Updated Title' };
    const mockUpdateResponse = { data: updatedPost };

    mockedAxios.put.mockResolvedValueOnce(mockUpdateResponse);

    const { result } = renderHook(() => usePosts());

    // Wait for initial load and set posts
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.posts = mockPosts;
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updatePost('1', { title: 'Updated Title' });
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.post).toEqual(updatedPost);
    expect(result.current.posts[0]).toEqual(updatedPost);
    expect(mockedAxios.put).toHaveBeenCalledWith('/api/posts/1', { title: 'Updated Title' });
  });

  it('deletes post successfully', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => usePosts());

    // Wait for initial load and set posts
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.posts = mockPosts;
    });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deletePost('1');
    });

    expect(deleteResult.success).toBe(true);
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]._id).toBe('2');
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/posts/1');
  });

  it('fetches single post', async () => {
    const singlePost = mockPosts[0];
    const mockResponse = { data: singlePost };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => usePosts());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.getPost('1');
    });

    expect(fetchResult.success).toBe(true);
    expect(fetchResult.post).toEqual(singlePost);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts/1');
  });

  it('updates filters and refetches', async () => {
    const mockFilteredResponse = {
      data: {
        posts: [mockPosts[0]],
        pagination: { ...mockPagination, totalPosts: 1 }
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockFilteredResponse);

    const { result } = renderHook(() => usePosts());

    act(() => {
      result.current.updateFilters({ category: 'tech' });
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts?page=1&limit=10&category=tech');
    });
  });

  it('clears filters', () => {
    const { result } = renderHook(() => usePosts({ category: 'tech', search: 'test' }));

    expect(result.current.filters).toEqual({ category: 'tech', search: 'test' });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });

  it('refetches posts', async () => {
    const mockRefetchResponse = {
      data: {
        posts: mockPosts,
        pagination: mockPagination
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockRefetchResponse);

    const { result } = renderHook(() => usePosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.refetch();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('handles network errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch posts');
      expect(result.current.posts).toEqual([]);
    });
  });

  it('applies initial filters', () => {
    const initialFilters = { category: 'tech', author: 'user1' };

    renderHook(() => usePosts(initialFilters));

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts?page=1&limit=10&category=tech&author=user1');
  });
});
