/** Hospitality record create/update: backend field → react-hook-form field. */
export const BEErrorFieldToFEFormFieldMap = {
  counterparty: "counterpartyId",
  department: "departmentCode",
  ourHostPosition: "ourHostPositionId",
  inventoryGiftLines: "giftInventoryLines",
};

/** Standalone usage record create/update: backend field → react-hook-form field. */
export const UsageRecordBEErrorFieldToFEFormFieldMap = {
  department: "departmentCode",
  counterparty: "counterpartyId",
  recipient: "recipientId",
  inventoryGiftLines: "giftInventoryLines",
};
