import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-gray-50)',
          padding: 'var(--space-4)'
        }}>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: 'var(--space-4)' }}>
              Something went wrong
            </h2>
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
              The admin panel encountered an error. Please try refreshing the page.
            </p>
            
            <details style={{ marginBottom: 'var(--space-4)' }}>
              <summary style={{ cursor: 'pointer', marginBottom: 'var(--space-2)' }}>
                Error Details
              </summary>
              <pre style={{
                background: 'var(--color-gray-100)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
            
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn--primary"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="btn"
                style={{ background: 'var(--color-gray-200)', color: 'var(--color-text)' }}
              >
                Clear Data & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
