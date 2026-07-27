import { useCallback, useState } from "react";

const defaultIsActive = (row) => row.active;
const defaultMapOptimistic = (row) => ({ ...row, active: !row.active });
const defaultMapRollback = (row, original) => ({
  ...row,
  active: original.active,
});

/**
 * Optimistic active/inactive toggle for master-data tables.
 * Flips the row in UI first, rolls back if the API call fails.
 */
export default function useOptimisticActiveToggle(
  setRows,
  {
    activate,
    deactivate,
    isActive = defaultIsActive,
    mapOptimistic = defaultMapOptimistic,
    mapRollback = defaultMapRollback,
  },
) {
  const [togglingIds, setTogglingIds] = useState(new Set());

  const handleToggleActive = useCallback(
    async (row) => {
      const id = row.id;
      setRows((prev) =>
        prev.map((r) => (r.id === id ? mapOptimistic(r) : r)),
      );
      setTogglingIds((prev) => new Set(prev).add(id));
      try {
        if (isActive(row)) await deactivate(id);
        else await activate(id);
      } catch (err) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? mapRollback(r, row) : r)),
        );
        console.error(err);
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [setRows, activate, deactivate, isActive, mapOptimistic, mapRollback],
  );

  return { togglingIds, handleToggleActive };
}
