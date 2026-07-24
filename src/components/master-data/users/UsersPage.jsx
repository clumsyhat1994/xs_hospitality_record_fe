import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Paper, Chip } from "@mui/material";
import MasterDataToolbar from "../MasterDataToolbar";
import MasterDataTable from "../MasterDataTable";
import UsersDialog from "./UsersDialog";
import userApi from "../../../api/userApi";
import { useMasterData } from "../../../context/MasterDataContext";
import roleLabels from "../../../constants/roleLabels";

function mapUserRow(user) {
  return {
    ...user,
    active: user.enabled,
  };
}

export default function UsersPage() {
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
  const [roleOptions, setRoleOptions] = useState(["ADMIN", "USER"]);
  const debounceRef = useRef(null);
  const { departments } = useMasterData();

  const emptyRow = {
    username: "",
    password: "",
    roles: ["USER"],
    departmentId: "",
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.listUsers(page, size, keyword);
      const data = res.data;
      const content = data.content || data;
      setRows((Array.isArray(content) ? content : []).map(mapUserRow));
      setTotal(data.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    userApi
      .listRoles()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRoleOptions(res.data);
        }
      })
      .catch((err) => console.error("Failed to load roles", err));
  }, []);

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
      id: row.id,
      username: row.username,
      password: "",
      roles: row.roles ?? [],
      departmentId: row.departmentId,
    });
    setDialogOpen(true);
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

  // Optimistic toggle: flip UI first for a snappy switch, roll back if the API fails.
  const handleToggleActive = async (row) => {
    const id = row.id;
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, active: !r.active, enabled: !r.enabled } : r,
      ),
    );
    setTogglingIds((prev) => new Set(prev).add(id));
    try {
      if (row.enabled) await userApi.disableUser(id);
      else await userApi.enableUser(id);
    } catch (err) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, active: row.active, enabled: row.enabled }
            : r,
        ),
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

  const columns = [
    { fieldName: "username", headerName: "用户名", width: 180 },
    {
      fieldName: "departmentName",
      headerName: "部门",
      width: 180,
    },
    {
      fieldName: "roles",
      headerName: "角色",
      width: 180,
      renderCell: (value) =>
        (value ?? []).map((role) => roleLabels[role] || role).join("、"),
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

  return (
    <Box>
      <Paper elevation={2}>
        <MasterDataToolbar
          title="用户管理"
          searchPlaceholder="按用户名搜索"
          searchLabel="用户名"
          searchSx={{ width: 270 }}
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

        <UsersDialog
          open={dialogOpen}
          initialValues={editingRow || emptyRow}
          departments={departments}
          roleOptions={roleOptions}
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
              ? userApi.createUser(data)
              : userApi.updateUser(editingRow.id, data)
          }
        />
      </Paper>
    </Box>
  );
}
