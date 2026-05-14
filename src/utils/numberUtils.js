export function toNullableNumber(value, { integer = false } = {}) {
  if (value === "" || value == null) return null;
  const n = integer ? Number.parseInt(value, 10) : Number(value);
  // Keep raw input when conversion is invalid (e.g. "12a", "abc", Infinity/-Infinity)
  // so backend/form validation can surface a clear error instead of sending NaN/null/0.
  return Number.isFinite(n) ? n : value;
}
