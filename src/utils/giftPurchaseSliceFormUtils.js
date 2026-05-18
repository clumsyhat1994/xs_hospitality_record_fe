/**
 * Sum saved usage quantities per purchase id (includePurchaseIds / remaining ceiling baselines).
 *
 * @param {unknown[]|undefined|null} purchaseSlices
 * @returns {Record<string, number>}
 */
export function initialUsedByPurchaseIdFromSlices(purchaseSlices) {
  if (!Array.isArray(purchaseSlices) || purchaseSlices.length === 0) {
    return {};
  }
  return purchaseSlices.filter(Boolean).reduce((acc, slice) => {
    const purchaseId = slice?.purchaseId;
    const quantity = Number(slice?.quantity);
    if (!purchaseId || !Number.isFinite(quantity) || quantity <= 0) return acc;
    const key = String(purchaseId);
    acc[key] = (acc[key] ?? 0) + quantity;
    return acc;
  }, {});
}
