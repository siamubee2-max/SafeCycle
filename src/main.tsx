import React from 'react';
import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// Catches any render-time crash and shows a branded fallback screen instead of
// a blank white page. This is critical for WKWebView: if React throws during
// mount, document#root stays empty and the native loading overlay never
// dismisses — the reviewer sees an "empty screen".
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#003634',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px',
              letterSpacing: '-0.5px',
            }}
          >
            SafeCycle
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: '1.6',
              maxWidth: '280px',
              marginBottom: '40px',
            }}
          >
            Something went wrong. Please close and reopen the app.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '16px 40px',
              backgroundColor: '#C6A87C',
              color: '#003634',
              border: 'none',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
