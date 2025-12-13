import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Paper } from "@mui/material";
import Chip from "@mui/material/Chip";
import MasterDataToolbar from ".//MasterDataToolbar";
import MasterDataTable from "./MasterDataTable";
import MasterDataDialog from "./MasterDataDialog";
import masterDataApi from "../../api/masterDataApi";

const emptyRow = {
  code: "",
  name: "",
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
  const debounceRef = useRef(null);
  const loadData = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await masterDataApi.listCounterParties(page, size, keyword);

        const data = res.data;

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
    setEditingRow(row);
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

  const handleSave = async (data) => {
    try {
      if (editingRow?.id == null) {
        await masterDataApi.createCounterParty(data);
      } else {
        await masterDataApi.updateCounterParty(editingRow.id, data);
      }
      setDialogOpen(false);
      setEditingRow(null);
      if (editingRow?.id == null) {
        await loadData();
      } else {
        await loadData(keyword);
      }
    } catch (err) {
      console.error("Save failed", err);
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

  const columns = [
    { fieldName: "name", headerName: "公司名称", width: 240 },
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
          onSave={handleSave}
          textFields={dialogTextFields}
        />
      </Paper>
    </Box>
  );
}
