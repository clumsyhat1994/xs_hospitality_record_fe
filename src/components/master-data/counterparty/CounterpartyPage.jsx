import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Box, Button, Paper, Stack, Tooltip, Typography } from "@mui/material";
import BaseSelect from "../../form/BaseSelect";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Chip from "@mui/material/Chip";
import MasterDataToolbar from "../MasterDataToolbar";
import MasterDataTable from "../MasterDataTable";
import MasterDataDialog from "../MasterDataDialog";
import masterDataApi from "../../../api/masterDataApi";
import { useMasterData } from "../../../context/MasterDataContext";
import { useForm } from "react-hook-form";
import { downloadBlob } from "../../../utils/downloadBlob";
import CounterpartyImportDialog from "./CounterpartyImportDialog";
import { masterDataButtonLabels as buttonLabels } from "../../../constants/buttonLabels";

function counterpartyRoleLabel(role) {
  return role?.label || role?.name || "";
}

export default function CounterpartyPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [searchName, setSearchName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const debounceRef = useRef(null);
  const { counterpartyTypes, counterpartyRoles } = useMasterData();

  const emptyRow = {
    name: "",
    counterpartyRoleIds: [],
    counterpartyTypeIds: [],
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await masterDataApi.listCounterParties(
        page,
        size,
        keyword,
        roleFilter,
      );

      const data = res.data;
      setRows(data.content || data); // if backend returns plain list, this still works
      setTotal(data.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to load counterparties", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, roleFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleCreate = () => {
    setEditingRow(null);
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setEditingRow({
      ...row,
      counterpartyRoleIds: (row.counterpartyRoles ?? []).map((role) => role.id),
      counterpartyTypeIds: (row.counterpartyTypes ?? []).map((type) => type.id),
    });
    setDialogOpen(true);
  };

  const handleDeleteOne = async (row) => {
    if (!window.confirm(`确定删除「${row.name}」吗？`)) return;
    try {
      await masterDataApi.deleteCounterParty(row.id);
      await loadData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSearchChange = (value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearchName(value);
    debounceRef.current = setTimeout(() => {
      setKeyword(value);
      setPage(0);
    }, 500);
  };

  const handleToggleActive = async (row) => {
    const id = row.id;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
    setTogglingIds((prev) => new Set(prev).add(id));
    try {
      if (row.active) await masterDataApi.deactivateCounterparty(id);
      else await masterDataApi.activateCounterparty(id);
    } catch (err) {
      // rollback if failed
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: row.active } : r)),
      );
      console.error(err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleExport = async () => {
    try {
      const res = await masterDataApi.exportCounterparty();
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `counterparties-${dateStr}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
      window.alert("导出失败，请联系系统管理员。");
    }
  };

  const columns = [
    { fieldName: "name", headerName: "公司名称", width: 300 },
    {
      fieldName: "counterpartyRoles",
      width: 120,
      headerName: "角色",
      renderCell: (value) =>
        (value ?? []).map((o) => counterpartyRoleLabel(o)).join("、"),
    },
    {
      fieldName: "counterpartyTypes",
      width: 250,
      headerName: "归属地",
      renderCell: (value) => {
        return (value ?? []).map((o) => o.name).join("、");
      },
    },
    {
      fieldName: "active",
      headerName: "状态",
      width: 100,
      renderCell: (value) =>
        value ? (
          <Chip label="启用" color="success" size="small" />
        ) : (
          <Chip label="停用" color="default" size="small" />
        ),
    },
  ];
  const roleFilterOptions = useMemo(
    () => [
      { value: "", label: "全部角色" },
      ...counterpartyRoles.map((role) => ({
        value: role.name,
        label: counterpartyRoleLabel(role),
      })),
    ],
    [counterpartyRoles],
  );

  const dialogTextFields = [{ fieldName: "name", label: "公司名称" }];
  const dialogMuiltiAutoCompleteFields = [
    {
      fieldName: "counterpartyRoleIds",
      label: "角色",
      options: counterpartyRoles,
      getOptionLabel: (opt) => counterpartyRoleLabel(opt),
      sm: 6,
    },
    {
      fieldName: "counterpartyTypeIds",
      label: "归属地",
      options: counterpartyTypes,
      sm: 6,
      rules: { required: false },
    },
  ];

  return (
    <Box>
      <Paper elevation={2}>
        <MasterDataToolbar
          title="往来单位"
          searchPlaceholder="按名称搜索"
          searchSx={{ width: 270 }}
          searchValue={searchName}
          extraFilters={
            <BaseSelect
              label="角色"
              options={roleFilterOptions}
              fieldValue={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.value}
              fullWidth={false}
              sx={{ width: 150, flexShrink: 0 }}
            />
          }
          onSearchChange={handleSearchChange}
          onSearchSubmit={() => {
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            setPage(0);
            setKeyword(searchName);
          }}
          onCreate={handleCreate}
          onExport={handleExport}
          extraActions={
            <Tooltip
              arrow
              placement="bottom"
              title={
                <Stack spacing={1.5} sx={{ maxWidth: 520 }}>
                  <Typography variant="body2">Excel导入格式如图</Typography>
                  <img
                    src="/images/counterparty-import-example.png"
                    alt="导入示例"
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      border: "1px solid #eee",
                    }}
                  />

                  <Typography variant="caption">
                    角色必填（客户/供应商）；多个角色或归属地可用分隔符：
                    , ， ; ； 、 /
                    <br />
                    “是否启用”可为空，默认启用
                  </Typography>
                </Stack>
              }
              slotProps={{
                tooltip: {
                  sx: {
                    p: 2,
                    maxWidth: 560,
                  },
                },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setImportOpen(true)}
              >
                {buttonLabels.importExcel}
              </Button>
            </Tooltip>
          }
        />

        <MasterDataTable
          rows={rows}
          columns={columns}
          onEdit={handleEdit}
          onDeleteOne={handleDeleteOne}
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
          onClose={() => {
            setDialogOpen(false);
            setEditingRow(null);
          }}
          onSaveSuccess={() => {
            setKeyword("");
            loadData();
          }}
          save={(data) =>
            editingRow?.id == null
              ? masterDataApi.createCounterParty(data)
              : masterDataApi.updateCounterParty(editingRow.id, data)
          }
          textFields={dialogTextFields}
          multiAutoCompleteFields={dialogMuiltiAutoCompleteFields}
        />
        <CounterpartyImportDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onSuccess={() => {
            loadData();
            setImportOpen(false);
          }}
        />
      </Paper>
    </Box>
  );
}
