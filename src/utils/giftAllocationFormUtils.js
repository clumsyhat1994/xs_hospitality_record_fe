/**
 * Sum saved allocation quantities per purchase id (includePurchaseIds / remaining ceiling baselines).
 *
 * @param {unknown[]|undefined|null} purchaseAllocations
 * @returns {Record<string, number>}
 */
export function initialAllocatedByPurchaseIdFromSlices(purchaseAllocations) {
  if (!Array.isArray(purchaseAllocations) || purchaseAllocations.length === 0) {
    return {};
  }
  return purchaseAllocations.filter(Boolean).reduce((acc, a) => {
    const purchaseId = a?.purchaseId;
    const quantity = Number(a?.quantity);
    if (!purchaseId || !Number.isFinite(quantity) || quantity <= 0) return acc;
    const key = String(purchaseId);
    acc[key] = (acc[key] ?? 0) + quantity;
    return acc;
  }, {});
}
