'use client';

import React, { Suspense, lazy, useState, Component, ReactNode } from 'react';
import { Bot } from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SplineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.warn('[InteractiveRobotSpline] Error loading Spline 3D scene:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  const [hasError, setHasError] = useState(false);

  const fallbackUI = (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-zinc-900 to-black text-white p-6 relative overflow-hidden ${className ?? ''}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0,transparent_70%)] pointer-events-none" />
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-xl backdrop-blur-sm animate-pulse">
        <Bot className="w-10 h-10 text-primary" />
      </div>
      <div className="text-center max-w-xs space-y-1 relative z-10">
        <h3 className="font-semibold text-lg text-white">Whobee AI Assistant</h3>
        <p className="text-xs text-zinc-400">Siap membantu mengelola etalase toko Anda</p>
      </div>
    </div>
  );

  if (hasError) {
    return fallbackUI;
  }

  return (
    <SplineErrorBoundary fallback={fallbackUI}>
      <Suspense
        fallback={
          <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className ?? ''}`}>
            <svg className="animate-spin h-6 w-6 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z" />
            </svg>
          </div>
        }
      >
        <Spline
          scene={scene}
          className={className}
          onError={() => setHasError(true)}
        />
      </Suspense>
    </SplineErrorBoundary>
  );
}
