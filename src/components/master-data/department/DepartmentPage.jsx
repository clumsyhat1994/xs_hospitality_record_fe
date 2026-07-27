import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Paper, Chip } from "@mui/material";
import MasterDataToolbar from "../MasterDataToolbar";
import MasterDataTable from "../MasterDataTable";
import MasterDataDialog from "../MasterDataDialog";
import masterDataApi from "../../../api/masterDataApi";
import { useMasterData } from "../../../context/MasterDataContext";
import { toNullableNumber } from "../../../utils/numberUtils";
import useOptimisticActiveToggle from "../../../hooks/useOptimisticActiveToggle";
import {
  departmentFieldLabels as fieldLabels,
  activeStatusLabels,
} from "../../../constants/masterDataFieldLabels";
import moduleLables from "../../../constants/moduleLables";

const emptyRow = {
  name: "",
  code: "",
  sortOrder: "",
};

export default function DepartmentPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [searchName, setSearchName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const debounceRef = useRef(null);
  const { setDepartments } = useMasterData();
  const { togglingIds, handleToggleActive: toggleActive } =
    useOptimisticActiveToggle(setRows, {
      activate: masterDataApi.activateDepartment,
      deactivate: masterDataApi.deactivateDepartment,
    });

  const isEditMode = editingRow?.id != null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await masterDataApi.listDepartments(page, size, keyword);
      const data = res.data;
      setRows(data.content || data);
      setTotal(data.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

  const refreshDepartmentOptions = useCallback(async () => {
    try {
      const res = await masterDataApi.searchDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Failed to refresh department options", err);
    }
  }, [setDepartments]);

  const handleToggleActive = async (row) => {
    await toggleActive(row);
    await refreshDepartmentOptions();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCreate = () => {
    setEditingRow(null);
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setEditingRow({
      id: row.id,
      name: row.name ?? "",
      code: row.code ?? "",
      sortOrder: row.sortOrder != null ? String(row.sortOrder) : "",
    });
    setDialogOpen(true);
  };

  const handleSearchChange = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchName(value);
    debounceRef.current = setTimeout(() => {
      setKeyword(value);
      setPage(0);
    }, 500);
  };

  const handleSaveSuccess = async () => {
    setKeyword("");
    setSearchName("");
    await loadData();
    await refreshDepartmentOptions();
  };

  const columns = [
    { fieldName: "name", headerName: fieldLabels.name, width: 220 },
    { fieldName: "code", headerName: fieldLabels.code, width: 140 },
    { fieldName: "sortOrder", headerName: fieldLabels.sortOrder, width: 100 },
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

  const dialogTextFields = isEditMode
    ? [
        { fieldName: "name", label: fieldLabels.name, sm: 12 },
        {
          fieldName: "code",
          label: fieldLabels.code,
          disabled: true,
          required: false,
        },
        {
          fieldName: "sortOrder",
          label: fieldLabels.sortOrder,
          disabled: true,
          required: false,
        },
      ]
    : [
        { fieldName: "name", label: fieldLabels.name },
        { fieldName: "code", label: fieldLabels.code },
        {
          fieldName: "sortOrder",
          label: fieldLabels.sortOrder,
          type: "number",
          slotProps: { htmlInput: { min: 0, step: 1 } },
          rules: {
            validate: (v) => {
              const n = Number(v);
              if (v === "" || v == null || Number.isNaN(n)) return "不能为空";
              if (!Number.isInteger(n) || n < 0) return "请输入非负整数";
              return true;
            },
          },
        },
      ];

  return (
    <Box>
      <Paper elevation={2}>
        <MasterDataToolbar
          title={moduleLables.DEPARTMENT}
          searchPlaceholder="按名称搜索"
          searchSx={{ width: 270 }}
          searchValue={searchName}
          onSearchChange={handleSearchChange}
          onSearchSubmit={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setPage(0);
            setKeyword(searchName);
          }}
          onCreate={handleCreate}
        />

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
          initialValues={editingRow || emptyRow}
          createTitle={`新建${moduleLables.DEPARTMENT}`}
          editTitle={`编辑${moduleLables.DEPARTMENT}`}
          onClose={() => {
            setDialogOpen(false);
            setEditingRow(null);
          }}
          onSaveSuccess={handleSaveSuccess}
          save={(data) => {
            if (!isEditMode) {
              return masterDataApi.createDepartment({
                name: data.name?.trim(),
                code: data.code?.trim(),
                sortOrder: toNullableNumber(data.sortOrder, { integer: true }),
              });
            }
            return masterDataApi.updateDepartment(editingRow.id, {
              name: data.name?.trim(),
            });
          }}
          textFields={dialogTextFields}
        />
      </Paper>
    </Box>
  );
}
