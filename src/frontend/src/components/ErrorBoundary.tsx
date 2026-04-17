import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "[ErrorBoundary] Uncaught error:",
      error,
      info.componentStack,
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            background: "#f8fafc",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              textAlign: "center",
              maxWidth: "320px",
              margin: 0,
            }}
          >
            The app encountered an unexpected error. Tap retry to continue, or
            reload the page.
          </p>
          {this.state.error && (
            <pre
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                background: "#f1f5f9",
                padding: "10px 14px",
                borderRadius: "8px",
                maxWidth: "360px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                background: "#f1f5f9",
                color: "#334155",
                fontWeight: 600,
                fontSize: "14px",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
