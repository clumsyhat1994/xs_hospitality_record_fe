import { useState, useEffect, useCallback } from "react";

import {
  Box,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import hospitalityApi from "../../api/hospitalityApi";
import HospitalityRecordsToolBar from "./HospitalityRecordsToolbar";
import HospitalityRecordDialog from "./HospitalityRecordsDialog";
import HospitalityRecordsTable from "./HospitalityRecordsTable";

import { MasterDataProvider } from "../../context/MasterDataContext";
import { downloadBlob } from "../../utils/downloadBlob";
import { useNavigate, useSearchParams } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";
import { setOrDelete, setParams } from "../../utils/queryParamsHelper";
const emptyRecord = {
  id: null,
  receptionDate: "",
  counterpartyId: null,
  invoiceAmount: null,
  handlerName: "",
  deptHeadApprovalDate: "",
  partySecretaryApprovalDate: "",
  invoiceDate: "",
  invoiceNumberString: "",
  departmentCode: "",
  hospitalityTypeId: null,
  location: "",
  theirCount: null,
  ourCount: null,
  ourHostPositionId: null,
  theirHostPositionId: null,
  items: [],
};

export default function HospitalityRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [draftFilters, setDraftFilters] = useState(() => {
    const from = searchParams.get("invoiceNumberFrom") ?? "";
    const to = searchParams.get("invoiceNumberTo") ?? "";
    return {
      receptionDateFrom: "",
      receptionDateTo: "",
      invoiceNumberFrom: from,
      invoiceNumberTo: to,
      handlerId: null,
      counterpartyId: null,
      departmentCode: "",
      hospitalityTypeId: null,
      hasInvoiceUploaded: null,
      hasFormUploaded: null,
      invoiceNumberFilled: null,
    };
  });
  const [filters, setFilters] = useState(draftFilters);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const boolParam = (key) => {
      const v = searchParams.get(key);
      if (v === "true") return true;
      if (v === "false") return false;
      return null;
    };

    const urlFilters = {
      receptionDateFrom: searchParams.get("receptionDateFrom") ?? "",
      receptionDateTo: searchParams.get("receptionDateTo") ?? "",
      invoiceNumberFrom: searchParams.get("invoiceNumberFrom") ?? "",
      invoiceNumberTo: searchParams.get("invoiceNumberTo") ?? "",

      departmentCode: searchParams.get("departmentCode") ?? "",

      handlerId: searchParams.get("handlerId")
        ? Number(searchParams.get("handlerId"))
        : null,

      counterpartyId: searchParams.get("counterpartyId")
        ? Number(searchParams.get("counterpartyId"))
        : null,

      hospitalityTypeId: searchParams.get("hospitalityTypeId")
        ? Number(searchParams.get("hospitalityTypeId"))
        : null,

      hasInvoiceUploaded: boolParam("hasInvoiceUploaded"),
      hasFormUploaded: boolParam("hasFormUploaded"),
      invoiceNumberFilled: boolParam("invoiceNumberFilled"),
    };

    const urlPage = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 0;
    const urlSize = searchParams.get("size")
      ? Number(searchParams.get("size"))
      : 10;

    // filters = criteria used for list/export (URL is source of truth).
    // draftFilters = what user has typed into toolbar filter inputs; usually they become filters only after 查询.
    // When searchParams change (back/forward, shared link, etc.), keep both in sync so
    // the toolbar does not show a stale draft that was never submitted. Same snapshot for
    // both; order of setState calls does not matter (batched).
    setFilters(urlFilters);
    setDraftFilters(urlFilters);

    setPage(urlPage);
    setSize(urlSize);
  }, [searchParams]);

  const handleExport = async () => {
    try {
      const res = await hospitalityApi.export(filters);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, "hospitality-records.xlsx");
    } catch (err) {
      console.error("Export failed", err);
      window.alert("导出失败，请联系系统管理员。");
    }
  };

  const handleDraftFilterChange = (field, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      setParams(next, "receptionDateFrom", draftFilters.receptionDateFrom);
      setParams(next, "receptionDateTo", draftFilters.receptionDateTo);
      setParams(next, "invoiceNumberFrom", draftFilters.invoiceNumberFrom);
      setParams(next, "invoiceNumberTo", draftFilters.invoiceNumberTo);
      setParams(next, "departmentCode", draftFilters.departmentCode);

      setParams(next, "handlerId", draftFilters.handlerId);
      setParams(next, "counterpartyId", draftFilters.counterpartyId);
      setParams(next, "hospitalityTypeId", draftFilters.hospitalityTypeId);
      setParams(next, "hasInvoiceUploaded", draftFilters.hasInvoiceUploaded);
      setParams(next, "hasFormUploaded", draftFilters.hasFormUploaded);
      setParams(next, "invoiceNumberFilled", draftFilters.invoiceNumberFilled);

      next.set("page", "0");
      next.set("size", String(size)); // keep current size
      return next;
    });
  };

  const handleClear = () => {
    setSearchParams(new URLSearchParams());
    navigate(moduleRoutes.HOSPITALITY_RECORDS, { replace: true });
  };

  const handleCreateClick = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEditRow = (record) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleDeleteRow = (id) => {
    if (!window.confirm("确定删除这条记录吗?")) return;
    hospitalityApi.deleteOne(id).catch((err) => console.error(err));
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSave = async () => {
    load();
    setDialogOpen(false);
  };

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const res = await hospitalityApi.filtered_list(page, size, filters, {
          signal,
        });

        const data = res.data;

        setRecords(data.content);
        setTotalElements(data.totalElements);
      } catch (e) {
        // Ignore abort/cancel
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          console.error(e);
        }
      } finally {
        // Avoid setting loading=false if we were aborted
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, size, filters, setRecords, setTotalElements]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleSaveAttachments = useCallback(
    async (record, { invoiceFiles, formFiles, removeInvoicePaths, removeFormPaths }) => {
      const inv = invoiceFiles ?? [];
      const frm = formFiles ?? [];
      const removedInv = removeInvoicePaths ?? [];
      const removedFrm = removeFormPaths ?? [];
      if (inv.length === 0 && frm.length === 0 && removedInv.length === 0 && removedFrm.length === 0) return;
      const params = new URLSearchParams();
      removedInv.forEach((p) => params.append("removeInvoicePaths", p));
      removedFrm.forEach((p) => params.append("removeFormPaths", p));
      const fd = new FormData();
      inv.forEach((f) => fd.append("invoiceImages", f));
      frm.forEach((f) => fd.append("hospitalityFormImages", f));
      await hospitalityApi.patchAttachments(record.id, fd, params);
      await load();
    },
    [load]
  );

 

  const setPageUrl = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      next.set("size", String(size));
      return next;
    });
  };

  const setSizeUrl = (newSize) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("size", String(newSize));
      next.set("page", "0"); // common UX: reset to first page when size changes
      return next;
    });
  };

  return (
    <Box>
      <Paper elevation={2}>
        <HospitalityRecordsToolBar
          selectedCount={selectedIds.length}
          draftFilters={draftFilters}
          onDraftFilterChange={handleDraftFilterChange}
          onSearch={handleSearch}
          onClear={handleClear}
          onCreate={handleCreateClick}
          //onBatchDelete={handleBatchDeleteClick}
          onExport={handleExport}
        />
        <HospitalityRecordsTable
          filters={filters}
          page={page}
          setPage={setPageUrl}
          //setPage={setPage}
          records={records}
          setRecords={setRecords}
          selectedIds={selectedIds}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          size={size}
          setSize={setSizeUrl}
          //setSize={setSize}
          totalElements={totalElements}
          setTotalElements={setTotalElements}
          loading={loading}
          onSaveAttachments={handleSaveAttachments}
        />
      </Paper>
      <HospitalityRecordDialog
        open={dialogOpen}
        initialValues={editingRecord || emptyRecord}
        isEditMode={!!editingRecord}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
      />
    </Box>
  );
}
