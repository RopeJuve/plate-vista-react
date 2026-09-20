import { Component, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Something went wrong</h1>
          <p className="text-gray-600">Please reload the app and try again.</p>
          <button
            type="button"
            className="rounded-md bg-orange-500 px-4 py-2 text-white"
            onClick={this.handleReload}
          >
            Go to login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
