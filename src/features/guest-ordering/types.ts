export type CartLine = {
  productId: string;
  quantity: number;
  notes: string;
};

export type GuestSession = {
  token: string;
  sessionId: string;
  tableId: string;
  tableNumber: number;
  slug: string;
  qrCode: string;
  /** 4-character code other guests enter to join this open table. */
  joinCode: string;
  /** True when this guest opened the table (the first scan). */
  opened: boolean;
};
