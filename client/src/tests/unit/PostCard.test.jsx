import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '../../components/PostCard';

const mockPost = {
  _id: '1',
  title: 'Test Post Title',
  content: 'This is a test post content that should be truncated because it is longer than 150 characters. This extra content should not be visible in the card preview.',
  author: { username: 'testuser' },
  category: { name: 'Technology' },
  tags: ['react', 'testing'],
  createdAt: '2023-01-01T00:00:00.000Z'
};

const mockPostWithoutTags = {
  _id: '2',
  title: 'Post Without Tags',
  content: 'Short content',
  author: { username: 'author2' },
  category: { name: 'Lifestyle' },
  createdAt: '2023-01-02T00:00:00.000Z'
};

describe('PostCard Component', () => {
  it('renders post information correctly', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('By testuser')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
  });

  it('truncates long content', () => {
    render(<PostCard post={mockPost} />);

    const content = screen.getByText(/This is a test post content/);
    expect(content.textContent).toContain('...');
    expect(content.textContent.length).toBeLessThan(mockPost.content.length);
  });

  it('renders without tags when none provided', () => {
    render(<PostCard post={mockPostWithoutTags} />);

    expect(screen.getByText('Post Without Tags')).toBeInTheDocument();
    expect(screen.queryByText('#')).not.toBeInTheDocument();
  });

  it('handles missing post data gracefully', () => {
    render(<PostCard post={null} />);

    expect(screen.getByText('Error: Post data is not available')).toBeInTheDocument();
  });

  it('handles missing author gracefully', () => {
    const postWithoutAuthor = { ...mockPost, author: null };
    render(<PostCard post={postWithoutAuthor} />);

    expect(screen.getByText('By Unknown Author')).toBeInTheDocument();
  });

  it('handles missing category gracefully', () => {
    const postWithoutCategory = { ...mockPost, category: null };
    render(<PostCard post={postWithoutCategory} />);

    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('handles invalid date gracefully', () => {
    const postWithInvalidDate = { ...mockPost, createdAt: 'invalid-date' };
    // Mock console.error to avoid noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<PostCard post={postWithInvalidDate} />);

    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('does not show action buttons when canEdit is false', () => {
    render(<PostCard post={mockPost} canEdit={false} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows action buttons when canEdit is true', () => {
    render(<PostCard post={mockPost} canEdit={true} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<PostCard post={mockPost} canEdit={true} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockPost);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<PostCard post={mockPost} canEdit={true} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockPost._id);
  });

  it('handles missing title gracefully', () => {
    const postWithoutTitle = { ...mockPost, title: null };
    render(<PostCard post={postWithoutTitle} />);

    expect(screen.getByText('Untitled Post')).toBeInTheDocument();
  });

  it('handles missing content gracefully', () => {
    const postWithoutContent = { ...mockPost, content: null };
    render(<PostCard post={postWithoutContent} />);

    // Should not crash and should show empty content area
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<PostCard post={mockPost} />);
    const postCard = container.firstChild;

    expect(postCard).toHaveClass('post-card');
    expect(postCard).toHaveClass('bg-white');
    expect(postCard).toHaveClass('shadow-md');
  });
});
