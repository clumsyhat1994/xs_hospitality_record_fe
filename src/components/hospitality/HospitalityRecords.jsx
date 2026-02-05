import { useState, useEffect, useCallback } from "react";

import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Checkbox,
  IconButton,
  Button,
  Toolbar,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
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
    };
  });
  const [filters, setFilters] = useState(draftFilters);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    };

    const urlPage = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 0;
    const urlSize = searchParams.get("size")
      ? Number(searchParams.get("size"))
      : 10;

    // Applied filters come from URL (source of truth)
    setFilters(urlFilters);

    // Draft should match applied when URL changes (e.g. back/forward, switching tabs)
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

      next.set("page", "0");
      next.set("size", String(size)); // keep current size
      return next;
    });

    // setFilters({ ...draftFilters });
    // setPage(0);
  };

  const handleClear = () => {
    // const empty = {
    //   receptionDateFrom: "",
    //   receptionDateTo: "",
    //   invoiceNumberFrom: "",
    //   invoiceNumberTo: "",
    // };
    // setDraftFilters(empty);
    // setFilters(empty);
    // setPage(0);
    setSearchParams(new URLSearchParams());
    navigate(moduleRoutes.HOSPITALITY_RECORDS, { replace: true });
  };

  // const handleToggleAll = (checked) => {
  //   if (checked) {
  //     setSelectedIds(records.map((r) => r.id));
  //   } else {
  //     setSelectedIds([]);
  //   }
  // };

  // const handleToggleOne = (id) => {
  //   setSelectedIds((prev) =>
  //     prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //   );
  // };

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

  // const handleBatchDeleteClick = () => {
  //   if (selectedIds.length === 0) return;
  //   if (!window.confirm(`Delete ${selectedIds.length} selected records?`)) {
  //     return;
  //   }
  //   setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
  //   setSelectedIds([]);
  // };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSave = async () => {
    // if (editingRecord) {
    //   setRecords((prev) =>
    //     prev.map((r) => (r.id === editingRecord.id ? { ...r, ...values } : r))
    //   );
    // } else {
    //   setRecords((prev) => [values, ...prev]);
    // }
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
          load={load}
          loading={loading}
          setLoading={setLoading}
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
