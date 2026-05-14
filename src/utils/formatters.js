export function formatDisplayDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

export function formatDisplayAmount(value) {
  if (value === null || value === undefined || value === "") return "";
  return Number(value).toFixed(2);
}
