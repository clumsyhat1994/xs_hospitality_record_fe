/** Hospitality record create/update: backend field → react-hook-form field. */
export const BEErrorFieldToFEFormFieldMap = {
  counterparty: "counterpartyId",
  department: "departmentCode",
  ourHostPosition: "ourHostPositionId",
  inventoryGiftLines: "giftInventoryLines",
};

/** Standalone usage record create/update: backend field → react-hook-form field. */
export const UsageRecordBEErrorFieldToFEFormFieldMap = {
  department: "departmentId",
  counterparty: "counterpartyId",
  recipient: "recipientId",
  inventoryGiftLines: "giftInventoryLines",
};
