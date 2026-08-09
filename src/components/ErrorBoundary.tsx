import { Component } from "react";
import type { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const isDevelopment = import.meta.env.DEV;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    console.error("Component stack:", errorInfo.componentStack);
    console.error("Error stack:", error.stack);
  }

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#F0EEE7] p-4 sm:p-8">
          <div className="w-full max-w-md rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 text-center shadow-lg sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9F7F8] text-3xl font-black text-[#0081A7]">
              !
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Something Went Wrong
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#073B5A]">We couldn&apos;t open that page.</h1>
            <p className="mt-3 text-base font-semibold leading-7 text-[#073B5A]/70">
              Your saved learning progress is still on this device. Return home or refresh and try again.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="rounded-2xl bg-[#00AFB9] px-6 py-3 text-base font-black text-white transition-colors hover:bg-[#0081A7]"
              >
                Go to Home
              </button>

              <button
                type="button"
                onClick={this.handleRefresh}
                className="rounded-2xl border border-[#073B5A]/15 px-6 py-3 text-base font-black text-[#073B5A] transition-colors hover:bg-[#073B5A]/5"
              >
                Refresh Page
              </button>
            </div>

            {isDevelopment && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-[#073B5A]/70">
                  Development Error Details
                </summary>
                <div className="mt-3 overflow-auto rounded-lg bg-[#F5FBFC] p-4">
                  <pre className="text-xs text-[#073B5A]">{this.state.error.toString()}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
