import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

  const variantClasses = {
    primary: 'btn-primary bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'btn-secondary bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'btn-danger bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'btn-success bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
  };

  const sizeClasses = {
    sm: 'btn-sm px-3 py-1.5 text-sm',
    md: 'btn-md px-4 py-2 text-base',
    lg: 'btn-lg px-6 py-3 text-lg'
  };

  const disabledClasses = disabled ? 'btn-disabled opacity-50 cursor-not-allowed' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default Button;
