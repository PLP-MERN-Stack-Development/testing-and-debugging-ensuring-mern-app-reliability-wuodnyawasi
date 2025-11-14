import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Component that doesn't throw
const NormalComponent = () => <div>Normal component</div>;

describe('ErrorBoundary Component', () => {
  // Mock console.error to avoid noise in test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary showDetails={true}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (for developers)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (for developers)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('allows manual showDetails override', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (for developers)')).toBeInTheDocument();
  });

  it('retries when Try Again button is clicked', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click try again
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Rerender with normal component
    rerender(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });
  });

  it('calls window.location.reload when Refresh Page is clicked', () => {
    // Mock window.location.reload
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /refresh page/i }));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('logs error to console when error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('handles componentDidCatch errors gracefully', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // Should not throw and should render error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
