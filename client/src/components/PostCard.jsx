import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const PostCard = ({ post, onEdit, onDelete, canEdit = false }) => {
  if (!post) {
    return (
      <div className="post-card-error bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: Post data is not available</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-card bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="post-header mb-4">
        <h3 className="post-title text-xl font-bold text-gray-900 mb-2">
          {post.title || 'Untitled Post'}
        </h3>

        <div className="post-meta text-sm text-gray-600 mb-3">
          <span className="post-author">
            By {post.author?.username || 'Unknown Author'}
          </span>
          <span className="mx-2">•</span>
          <span className="post-category">
            {post.category?.name || 'Uncategorized'}
          </span>
          <span className="mx-2">•</span>
          <span className="post-date">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>

      <div className="post-content mb-4">
        <p className="text-gray-700 leading-relaxed">
          {truncateContent(post.content)}
        </p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags mb-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="tag bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {canEdit && (
        <div className="post-actions flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit && onEdit(post)}
            aria-label={`Edit post: ${post.title}`}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(post._id)}
            aria-label={`Delete post: ${post.title}`}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    author: PropTypes.shape({
      username: PropTypes.string
    }),
    category: PropTypes.shape({
      name: PropTypes.string
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool
};

export default PostCard;
