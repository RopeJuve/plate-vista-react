import { Wordmark } from "../rail";

/** A full-screen message for a guest who cannot order: a bad scan, a lockout, a lost connection. */
const GuestNotice = ({ message }: { message: string }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center text-ink">
    <Wordmark className="mb-8 text-ink" />
    <p className="max-w-sm text-xl font-bold" role="alert">
      {message}
    </p>
  </div>
);

export default GuestNotice;
