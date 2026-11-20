import { useEffect, useRef } from "react";
import { waiterCallAt } from "../boardState";
import { useStaffBoard } from "../StaffBoardProvider";

/** Opening a calling table answers its call: the waiter is now looking at it. */
export const useCloseWaiterCallOnOpen = (tableId: string) => {
  const { state, dismissWaiterCall } = useStaffBoard();
  const call = waiterCallAt(state, tableId);
  // One request per call, not one per board update while the server confirms it.
  const answered = useRef("");

  useEffect(() => {
    if (!call) {
      return;
    }
    const key = `${call.sessionId}:${call.calledAt}`;
    if (answered.current === key) {
      return;
    }
    answered.current = key;
    dismissWaiterCall(call.sessionId);
  }, [call, dismissWaiterCall]);
};
