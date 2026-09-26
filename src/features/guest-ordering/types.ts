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
};
