/**
 * Sum saved usage quantities per purchase line id (includePurchaseLineIds / remaining ceiling baselines).
 *
 * @param {unknown[]|undefined|null} usageLines
 * @returns {Record<string, number>}
 */
export function initialUsedByPurchaseLineIdFromUsageLines(usageLines) {
  if (!Array.isArray(usageLines) || usageLines.length === 0) {
    return {};
  }
  return usageLines.filter(Boolean).reduce((acc, line) => {
    const purchaseLineId = line?.purchaseLineId;
    const quantity = Number(line?.quantity);
    if (!purchaseLineId || !Number.isFinite(quantity) || quantity <= 0) return acc;
    const key = String(purchaseLineId);
    acc[key] = (acc[key] ?? 0) + quantity;
    return acc;
  }, {});
}

/** Flatten purchase records into selectable purchase lines for gift usage forms. */
export function flattenPurchaseRecordsToLines(records) {
  if (!Array.isArray(records)) return [];
  const out = [];
  for (const record of records) {
    const lines = Array.isArray(record?.lines) ? record.lines : [];
    for (const line of lines) {
      if (!line?.id) continue;
      out.push({
        ...line,
        purchaseRecordId: record.id,
        category: record.category,
        purchaseDate: record.purchaseDate,
        supplierName: record.supplierName,
        invoiceNumber: record.invoiceNumber,
      });
    }
  }
  return out;
}
