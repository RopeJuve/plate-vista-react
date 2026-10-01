/** Badge colours for a table's status in the admin. Same meaning as on the floor: ink = seated, amber = reserved. */
export const TABLE_STATUS_BADGE: Record<string, string> = {
  occupied: "bg-ink text-paper",
  reserved: "bg-amber text-ink",
  vacant: "bg-ink/[0.06] text-ink-soft",
};

/** A table the server sent without a status has nobody at it. */
export const tableStatusOf = (table: { status?: string }): string => table.status || "vacant";

export const tableStatusBadge = (status: string): string => TABLE_STATUS_BADGE[status] ?? TABLE_STATUS_BADGE.vacant;
