export const ORDER_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETE: "Complete",
} as const;

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.COMPLETE]: "Completed",
};
