import type { User } from "../../types";

/** The name shown for whoever is signed in: their username, else their email. */
export const staffName = (user: User | null, fallback: string): string =>
  user?.employee || user?.email || fallback;

/** One letter for a staff member's round badge. */
export const initialOf = (name: string | undefined): string => (name || "?").charAt(0);
