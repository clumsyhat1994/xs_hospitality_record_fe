/**
 * Build URL to open/download a stored hospitality image (relative path from API).
 */
export function hospitalityImageFileUrl(relativePath) {
  if (!relativePath) return "";
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const trimmed = String(relativePath).replace(/^\/+/, "");
  const segments = trimmed.split("/").map((s) => encodeURIComponent(s));
  return `/api/hospitality/files/${segments.join("/")}`;
}
