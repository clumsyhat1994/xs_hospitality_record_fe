import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Button, Paper, Stack, Tooltip, Typography } from "@mui/material";
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

const emptyRow = {
  name: "",
  counterpartyTypeIds: [],
};

export default function CounterpartyPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [searchName, setSearchName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const debounceRef = useRef(null);
  const { counterpartyTypes } = useMasterData();

  const loadData = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await masterDataApi.listCounterParties(page, size, keyword);

        const data = res.data;
        //console.log(data.content);
        setRows(data.content || data); // if backend returns plain list, this still works
        setTotal(data.totalElements ?? 0);
      } catch (err) {
        console.error("Failed to load counterparties", err);
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  useEffect(() => {
    loadData(keyword);
  }, [loadData, keyword]);

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
      counterpartyTypeIds: row.counterpartyTypes.map((type) => type.id),
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

  // const handleSave = async (data) => {
  //   try {
  //     if (editingRow?.id == null) {
  //       await masterDataApi.createCounterParty(data);
  //     } else {
  //       await masterDataApi.updateCounterParty(editingRow.id, data);
  //     }
  //     setDialogOpen(false);
  //     setEditingRow(null);
  //     if (editingRow?.id == null) {
  //       await loadData();
  //     } else {
  //       await loadData(keyword);
  //     }
  //   } catch (err) {
  //     console.error("Save failed", err);
  //   }
  // };

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
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    setTogglingIds((prev) => new Set(prev).add(id));
    try {
      if (row.active) await masterDataApi.deactivateCounterparty(id);
      else await masterDataApi.activateCounterparty(id);
    } catch (err) {
      // rollback if failed
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: row.active } : r))
      );
      console.error(err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    // try {
    //   if (row.active) {
    //     await masterDataApi.deactivateCounterparty(row.id);
    //   } else {
    //     await masterDataApi.activateCounterparty(row.id);
    //   }
    //   await loadData(keyword);
    // } catch (err) {
    //   console.error("Toggle active failed", err);
    // }
  };

  const handleExport = async () => {
    try {
      const res = await masterDataApi.exportCounterparty();
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, "hospitality-records.xlsx");
    } catch (err) {
      console.error("Export failed", err);
      window.alert("导出失败，请联系系统管理员。");
    }
  };

  const columns = [
    { fieldName: "name", headerName: "公司名称", width: 300 },
    {
      fieldName: "counterpartyTypes",
      width: 250,
      headerName: "归属地",
      renderCell: (value) => {
        return value.map((o) => o.name).join("、");
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
  const dialogTextFields = [{ fieldName: "name", label: "公司名称" }];
  const dialogMuiltiAutoCompleteFields = [
    {
      fieldName: "counterpartyTypeIds",
      label: "归属地",
      options: counterpartyTypes,
      sm: 6,
    },
  ];

  return (
    <Box>
      <Paper elevation={2}>
        <MasterDataToolbar
          title="往来单位"
          searchPlaceholder="按名称搜索"
          searchValue={searchName}
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
                <Stack spacing={1} sx={{ maxWidth: 320 }}>
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
                    归属地支持分隔符：, ， ; ； 、<br />
                    “是否启用”可为空，默认启用
                  </Typography>
                </Stack>
              }
              slotProps={{
                tooltip: {
                  sx: {
                    p: 1.5,
                  },
                },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setImportOpen(true)}
              >
                导入Excel
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
            loadData(keyword);
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
            loadData(keyword);
            setImportOpen(false);
          }}
        />
      </Paper>
    </Box>
  );
}
