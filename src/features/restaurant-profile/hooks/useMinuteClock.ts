import { useEffect, useState } from "react";

/** The current time, refreshed every minute, so "Open · until 19:00" turns to Closed on its own. */
export const useMinuteClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
};
