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
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6 text-center text-ink">
          <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Something went wrong</h1>
          <p className="max-w-sm text-ink-soft">This screen hit an error. Go back to the login page and try again.</p>
          <button
            type="button"
            className="h-11 rounded-md bg-ink px-5 font-semibold text-paper hover:bg-ink/85"
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
