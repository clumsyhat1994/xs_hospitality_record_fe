import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Paper } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";
import { setParams } from "../../utils/queryParamsHelper";
import usageRecordApi from "../../api/usageRecordApi";
import UsageRecordsToolbar from "./UsageRecordsToolbar";
import UsageRecordsTable from "./UsageRecordsTable";
import UsageRecordDialog from "./UsageRecordDialog";

function buildApiFilters(filters) {
  const out = {};
  if (filters.departmentId?.trim())
    out.departmentId = filters.departmentId.trim();
  if (filters.usageDateFrom?.trim())
    out.usageDateFrom = filters.usageDateFrom.trim();
  if (filters.usageDateTo?.trim()) out.usageDateTo = filters.usageDateTo.trim();
  if (filters.standaloneOnly === "true") out.standaloneOnly = true;
  return out;
}

function draftFiltersFromSearchParams(searchParams) {
  return {
    usageDateFrom: searchParams.get("usageDateFrom") ?? "",
    usageDateTo: searchParams.get("usageDateTo") ?? "",
    departmentId: searchParams.get("departmentId") ?? "",
    standaloneOnly: searchParams.get("standaloneOnly") ?? "",
  };
}

function usageRecordsQueryFromSearchParams(searchParams) {
  const draft = draftFiltersFromSearchParams(searchParams);
  return {
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    size: searchParams.get("size") ? Number(searchParams.get("size")) : 10,
    apiFilters: buildApiFilters(draft),
  };
}

export default function UsageRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [draftFilters, setDraftFilters] = useState(() =>
    draftFiltersFromSearchParams(searchParams),
  );
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const usageRecordsQuery = useMemo(
    () => usageRecordsQueryFromSearchParams(searchParams),
    [searchParams],
  );

  useEffect(() => {
    setDraftFilters(draftFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const res = await usageRecordApi.filteredList(
          usageRecordsQuery.page,
          usageRecordsQuery.size,
          usageRecordsQuery.apiFilters,
          { signal },
        );
        const data = res.data;
        setRecords(data.content ?? []);
        setTotalElements(data.totalElements ?? 0);
      } catch (e) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          console.error(e);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [usageRecordsQuery],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleDraftFilterChange = (field, value) => {
    setDraftFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      setParams(next, "usageDateFrom", draftFilters.usageDateFrom);
      setParams(next, "usageDateTo", draftFilters.usageDateTo);
      setParams(next, "departmentId", draftFilters.departmentId);
      setParams(next, "standaloneOnly", draftFilters.standaloneOnly);
      next.set("page", "0");
      const prevSize = prev.get("size");
      next.set("size", prevSize?.trim() ? prevSize : "10");
      return next;
    });
  };

  const handleClear = () => {
    setSearchParams(new URLSearchParams());
    navigate(moduleRoutes.USAGE_RECORDS, { replace: true });
  };

  const setPageUrl = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      if (!next.get("size")?.trim()) next.set("size", "10");
      return next;
    });
  };

  const setSizeUrl = (newSize) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("size", String(newSize));
      next.set("page", "0");
      return next;
    });
  };

  const handleCreateUsage = () => {
    setEditingRecord(null);
    setUsageDialogOpen(true);
  };

  const handleEditUsage = (record) => {
    setEditingRecord(record);
    setUsageDialogOpen(true);
  };

  const handleDeleteUsage = async (id) => {
    if (!window.confirm("确定删除这条独立领用记录吗？")) return;
    await usageRecordApi.deleteOne(id);
    await load();
  };

  const handleUsageSaved = async () => {
    await load();
    setUsageDialogOpen(false);
  };

  return (
    <Box>
      <Paper elevation={2}>
        <UsageRecordsToolbar
          draftFilters={draftFilters}
          onDraftFilterChange={handleDraftFilterChange}
          onSearch={handleSearch}
          onClear={handleClear}
          onCreateUsage={handleCreateUsage}
        />
        <UsageRecordsTable
          records={records}
          page={usageRecordsQuery.page}
          setPage={setPageUrl}
          size={usageRecordsQuery.size}
          setSize={setSizeUrl}
          totalElements={totalElements}
          loading={loading}
          onEditRow={handleEditUsage}
          onDeleteRow={handleDeleteUsage}
        />
      </Paper>
      <UsageRecordDialog
        open={usageDialogOpen}
        onClose={() => setUsageDialogOpen(false)}
        onSave={handleUsageSaved}
        editingRecord={editingRecord}
      />
    </Box>
  );
}
