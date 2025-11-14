import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const usePosts = (initialFilters = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchPosts = useCallback(async (page = 1, newFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
        ...newFilters
      });

      const response = await axios.get(`/api/posts?${queryParams}`);
      const { posts: fetchedPosts, pagination: paginationData } = response.data;

      setPosts(fetchedPosts);
      setPagination(paginationData);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.response?.data?.error || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createPost = async (postData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/posts', postData);
      // Refresh posts after creating
      await fetchPosts(pagination.currentPage);
      return { success: true, post: response.data };
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId, postData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/posts/${postId}`, postData);
      // Update the post in the local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? response.data : post
        )
      );
      return { success: true, post: response.data };
    } catch (err) {
      console.error('Error updating post:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/posts/${postId}`);
      // Remove the post from local state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting post:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getPost = async (postId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/posts/${postId}`);
      return { success: true, post: response.data };
    } catch (err) {
      console.error('Error fetching post:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts(1, filters);
  }, [filters, fetchPosts]);

  return {
    posts,
    loading,
    error,
    pagination,
    filters,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPost,
    updateFilters,
    clearFilters,
    refetch: () => fetchPosts(pagination.currentPage)
  };
};

export default usePosts;
