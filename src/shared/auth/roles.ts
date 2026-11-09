import type { User } from "../../types";

/** An owner or admin runs the restaurant: they may override staff rules and see till problems. */
export const isOwnerOrAdmin = (user: User | null) =>
  [user?.role, user?.position].some((role) => role === "owner" || role === "admin");
