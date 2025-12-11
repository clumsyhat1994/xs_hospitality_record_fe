import { useState, useEffect } from "react";

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
  receptionDate: "2025-12-30",
  counterpartyId: 1,
  invoiceAmount: "1688",
  handlerName: "张三",
  deptHeadApprovalDate: "2023-10-28",
  partySecretaryApprovalDate: "2023-10-29",
  invoiceDate: "2023-10-30",
  invoiceNumberString: "25444000000006604608",
  departmentCode: "SHENG",
  hospitalityTypeId: "1",
  location: "餐厅",
  theirCount: "8",
  ourCount: "4",
  ourHostPositionId: "1",
  theirHostPositionId: "2",
  items: [
    { itemName: "白菜", unitPrice: 12, quantity: 3 },
    { itemName: "香菇", unitPrice: 120, quantity: 5 },
  ],
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
    };
  });
  const [filters, setFilters] = useState(draftFilters);
  const [page, setPage] = useState(0);

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
    if (!window.confirm("Delete this record?")) return;
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

  const handleDialogSave = async (values) => {
    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? { ...r, ...values } : r))
      );
    } else {
      setRecords((prev) => [values, ...prev]);
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <MasterDataProvider>
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
          />
        </Paper>
        <HospitalityRecordDialog
          open={dialogOpen}
          initialValues={editingRecord || emptyRecord}
          isEditMode={!!editingRecord}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
        />
      </MasterDataProvider>
    </Box>
  );
}
