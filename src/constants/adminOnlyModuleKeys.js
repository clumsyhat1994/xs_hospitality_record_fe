import moduleKeys from "./moduleKeys";

/** Modules gated in the sidebar — also blocked at the route level. */
const adminOnlyModuleKeys = new Set([
  moduleKeys.PURCHASE_RECORDS,
  moduleKeys.USAGE_RECORDS,
  moduleKeys.INVOICE_CONFLICT,
  moduleKeys.COUNTERPARTY,
  moduleKeys.USERS,
  moduleKeys.DEPARTMENT,
  moduleKeys.POSITION,
  moduleKeys.GRADE,
]);

export function isAdminOnlyModule(key) {
  return adminOnlyModuleKeys.has(key);
}

export default adminOnlyModuleKeys;
