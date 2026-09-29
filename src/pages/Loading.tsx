import { PlateMark } from "../Components/rail";

type LoadingProps = {
  fullScreen?: boolean;
};

/** The plate spins while the order prints. */
const Loading = ({ fullScreen = true }: LoadingProps) => {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-dvh w-full items-center justify-center bg-background text-foreground"
          : "flex min-h-[40vh] w-full items-center justify-center text-foreground"
      }
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <PlateMark className="h-10 w-10 animate-spin [animation-duration:1.8s]" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">Loading</span>
      </div>
    </div>
  );
};

export default Loading;
