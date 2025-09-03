import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SafeRenderBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface SafeRenderBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

class SafeRenderBoundary extends Component<SafeRenderBoundaryProps, SafeRenderBoundaryState> {
  constructor(props: SafeRenderBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeRenderBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('SafeRenderBoundary caught an error:', error, errorInfo);
    
    // Check if this is the specific React child error we're trying to fix
    if (error.message.includes('Objects are not valid as a React child')) {
      console.error('Detected React child rendering error:', {
        error: error.message,
        componentStack: errorInfo.componentStack,
        errorStack: error.stack
      });
      
      // Additional logging to help identify the source
      if (error.message.includes('currency') || error.message.includes('amount')) {
        console.error('Currency/amount related rendering error detected');
      }
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Rendering Error in {this.props.componentName || 'Component'}</strong>
            <br />
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Technical Details</summary>
              <pre className="text-xs mt-1 whitespace-pre-wrap">
                {this.state.error?.stack}
              </pre>
            </details>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default SafeRenderBoundary;