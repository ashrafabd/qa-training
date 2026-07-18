import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const ERROR_LOG_KEY = "qa-runtime-errors-v1";

function pushRuntimeError(entry: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || "[]") as string[];
    const next = [entry, ...existing].slice(0, 25);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or parse failures for non-critical telemetry.
  }
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  componentDidMount() {
    window.addEventListener("error", (event) => {
      pushRuntimeError(`${new Date().toISOString()} :: ${event.message}`);
    });
    window.addEventListener("unhandledrejection", (event) => {
      pushRuntimeError(`${new Date().toISOString()} :: ${String(event.reason || "Unhandled rejection")}`);
    });
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled UI error:", error);
    pushRuntimeError(`${new Date().toISOString()} :: ${String(error)}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="card" role="alert">
          <h1>Something went wrong</h1>
          <p className="muted">Please refresh the page. The error has been logged in console.</p>
        </section>
      );
    }
    return this.props.children;
  }
}
