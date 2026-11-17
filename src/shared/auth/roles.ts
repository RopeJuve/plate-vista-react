import type { User } from "../../types";

/** An owner or admin runs the restaurant: they may override staff rules and see till problems. */
export const isOwnerOrAdmin = (user: User | null) =>
  [user?.role, user?.position].some((role) => role === "owner" || role === "admin");

/** Only the owner manages money matters such as the Payout Account; the API answers 403 to an admin. */
export const isOwner = (user: User | null) => [user?.role, user?.position].some((role) => role === "owner");
