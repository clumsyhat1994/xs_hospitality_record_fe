/** Hospitality record create/update: backend field → react-hook-form field. */
export const BEErrorFieldToFEFormFieldMap = {
  counterparty: "counterpartyId",
  department: "departmentCode",
  ourHostPosition: "ourHostPositionId",
};

/** Standalone usage record create/update: backend field → react-hook-form field. */
export const UsageRecordBEErrorFieldToFEFormFieldMap = {
  department: "departmentId",
  counterparty: "counterpartyId",
};
