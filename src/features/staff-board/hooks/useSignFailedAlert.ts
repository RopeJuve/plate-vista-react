import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { isOwnerOrAdmin } from "../../../shared/auth/roles";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { notify } from "../../../utils/notify";

const SIGN_FAILED_MESSAGE = "A payment signature failed — see Till & payments";

/** Tells an owner or admin when the TSE could not sign a payment; they fix it under Till & payments. */
export const useSignFailedAlert = () => {
  const { subscribe } = useRealtime();
  const { user } = useAuth();
  const canFix = isOwnerOrAdmin(user);

  useEffect(() => {
    if (!canFix) {
      return;
    }
    return subscribe("payment.signFailed", () => notify(SIGN_FAILED_MESSAGE, "error", { href: "/admin/kasse" }));
  }, [canFix, subscribe]);
};
