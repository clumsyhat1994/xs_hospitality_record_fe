import { useEffect, useState, useCallback } from "react";
import { Box, Paper, Chip } from "@mui/material";
import MasterDataToolbar from "../MasterDataToolbar";
import MasterDataTable from "../MasterDataTable";
import MasterDataDialog from "../MasterDataDialog";
import masterDataApi from "../../../api/masterDataApi";
import { formatDisplayAmount } from "../../../utils/formatters";
import { toNullableNumber } from "../../../utils/numberUtils";
import useOptimisticActiveToggle from "../../../hooks/useOptimisticActiveToggle";
import {
  perCapitaLimitFieldLabels as fieldLabels,
  activeStatusLabels,
} from "../../../constants/masterDataFieldLabels";
import moduleLables from "../../../constants/moduleLables";

export default function PerCapitaLimitPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const { togglingIds, handleToggleActive } = useOptimisticActiveToggle(
    setRows,
    {
      activate: masterDataApi.activatePerCapitaLimit,
      deactivate: masterDataApi.deactivatePerCapitaLimit,
    },
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await masterDataApi.listPerCapitaLimits(page, size);
      const data = res.data;
      setRows(data.content || data);
      setTotal(data.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to load per capita limits", err);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (row) => {
    setEditingRow({
      id: row.id,
      gradeName: row.gradeName ?? "",
      typeName: row.typeName ?? "",
      maxPerCapita:
        row.maxPerCapita != null ? String(row.maxPerCapita) : "",
    });
    setDialogOpen(true);
  };

  const columns = [
    { fieldName: "typeName", headerName: fieldLabels.typeName, width: 180 },
    { fieldName: "gradeName", headerName: fieldLabels.gradeName, width: 180 },
    {
      fieldName: "maxPerCapita",
      headerName: fieldLabels.maxPerCapita,
      width: 160,
      renderCell: (value) => formatDisplayAmount(value),
    },
    {
      fieldName: "active",
      headerName: fieldLabels.active,
      width: 100,
      renderCell: (value) =>
        value ? (
          <Chip label={activeStatusLabels.enabled} color="success" size="small" />
        ) : (
          <Chip label={activeStatusLabels.disabled} color="default" size="small" />
        ),
    },
  ];

  const dialogTextFields = [
    {
      fieldName: "typeName",
      label: fieldLabels.typeName,
      disabled: true,
      required: false,
    },
    {
      fieldName: "gradeName",
      label: fieldLabels.gradeName,
      disabled: true,
      required: false,
    },
    {
      fieldName: "maxPerCapita",
      label: fieldLabels.maxPerCapita,
      type: "number",
      sm: 12,
      slotProps: { htmlInput: { min: 0, step: "0.01" } },
      rules: {
        validate: (v) => {
          const n = Number(v);
          if (v === "" || v == null || Number.isNaN(n)) return "不能为空";
          if (n < 0) return "不能小于 0";
          return true;
        },
      },
    },
  ];

  return (
    <Box>
      <Paper elevation={2}>
        <MasterDataToolbar title={moduleLables.PER_CAPITA_LIMIT} />

        <MasterDataTable
          rows={rows}
          columns={columns}
          onEdit={handleEdit}
          page={page}
          size={size}
          total={total}
          loading={loading}
          onToggleActive={handleToggleActive}
          togglingIds={togglingIds}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setSize(newSize);
            setPage(0);
          }}
        />

        <MasterDataDialog
          open={dialogOpen}
          initialValues={editingRow || {}}
          editTitle={`编辑${moduleLables.PER_CAPITA_LIMIT}`}
          onClose={() => {
            setDialogOpen(false);
            setEditingRow(null);
          }}
          onSaveSuccess={loadData}
          save={(data) =>
            masterDataApi.updatePerCapitaLimit(editingRow.id, {
              maxPerCapita: toNullableNumber(data.maxPerCapita),
            })
          }
          textFields={dialogTextFields}
        />
      </Paper>
    </Box>
  );
}
