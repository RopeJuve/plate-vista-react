import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { GuestAuthProvider } from "../features/guest-ordering/GuestAuthContext";
import { RealtimeProvider } from "../shared/realtime/RealtimeProvider";
import type { MockRealtimeControls } from "./mockRealtime";

/** The providers `useRealtime` needs, with the socket replaced by the mock from `createMockRealtime`. */
const RealtimeTestProviders = ({
  realtime,
  path = "/",
  children,
}: {
  realtime: MockRealtimeControls;
  path?: string;
  children?: ReactNode;
}) => (
  <MemoryRouter initialEntries={[path]}>
    <AuthProvider>
      <GuestAuthProvider>
        <RealtimeProvider createClient={realtime.createClient}>{children}</RealtimeProvider>
      </GuestAuthProvider>
    </AuthProvider>
  </MemoryRouter>
);

export default RealtimeTestProviders;
