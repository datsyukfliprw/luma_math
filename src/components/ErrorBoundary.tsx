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
    // Log error details for development
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
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#faf9f4] p-4 sm:p-8">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
            {/* LumaMath mascot branding */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F4D589] bg-[#FEF3D9] text-4xl">
                ⭐
              </div>
            </div>

            <h1 className="mb-3 text-center text-2xl font-black text-[#073B5A]">
              Oops! Something went wrong
            </h1>

            <p className="mb-6 text-center text-base font-semibold text-[#073B5A]/75">
              Don't worry, your progress is safe. Let's get you back to learning.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleGoHome}
                className="rounded-xl bg-[#00AFB9] px-6 py-3 text-base font-black text-white transition-colors hover:bg-[#0081A7]"
              >
                Go to Home
              </button>

              <button
                onClick={this.handleRefresh}
                className="rounded-xl border-2 border-[#073B5A] px-6 py-3 text-base font-black text-[#073B5A] transition-colors hover:bg-[#073B5A]/5"
              >
                Refresh Page
              </button>
            </div>

            {/* Error details only in development */}
            {isDevelopment && this.state.error && (
              <details className="mt-6">
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
