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
  const [searchParams] = useSearchParams();
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
      counterpartyId: null,
      departmentCode: "",
    };
  });
  const [filters, setFilters] = useState(draftFilters);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
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
    setFilters({ ...draftFilters });
    setPage(0);
  };

  const handleClear = () => {
    const empty = {
      receptionDateFrom: "",
      receptionDateTo: "",
      invoiceNumberFrom: "",
      invoiceNumberTo: "",
    };
    setDraftFilters(empty);
    setFilters(empty);
    setPage(0);
    navigate(moduleRoutes.HOSPITALITY_RECORDS, { replace: true });
  };

  const handleToggleAll = (checked) => {
    if (checked) {
      setSelectedIds(records.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  const handleBatchDeleteClick = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected records?`)) {
      return;
    }
    setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

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
          onBatchDelete={handleBatchDeleteClick}
          onExport={handleExport}
        />
        <HospitalityRecordsTable
          filters={filters}
          page={page}
          setPage={setPage}
          records={records}
          setRecords={setRecords}
          selectedIds={selectedIds}
          onToggleAll={handleToggleAll}
          onToggleOne={handleToggleOne}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          size={size}
          setSize={setSize}
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
