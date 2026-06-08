export const SOFT_CODES = ["SEQUENTIAL_INVOICE", "SOFT_COUNTERPARTY_CONFLICT"];

export function getBackendErrorMessage(error, fallback = "操作失败，请稍后重试") {
  const data = error?.response?.data;
  if (!data) return error?.message ?? fallback;
  if (typeof data === "string") return data;
  return data.detail ?? data.message ?? fallback;
}

export function analyzeBackendErrors(errors) {
  const hasHardErrors = errors.some((e) => !SOFT_CODES.includes(e.code));
  const onlySoftErrors = !hasHardErrors;

  return { hasHardErrors, onlySoftErrors };
}
