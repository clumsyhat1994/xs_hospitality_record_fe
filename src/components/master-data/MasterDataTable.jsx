// src/components/master-data/MasterDataTable.jsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  TableContainer,
  Paper,
  TablePagination,
  CircularProgress,
  Box,
  Switch,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

export default function MasterDataTable({
  rows,
  columns,
  getRowId = (row) => row.id,
  onEdit,
  onDeleteOne,
  page,
  size,
  total,
  onPageChange,
  onPageSizeChange,
  onToggleActive,
  togglingIds = new Set(),
  loading = false,
}) {
  return (
    <>
      <TableContainer sx={{ height: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                return (
                  <TableCell key={col.fieldName} sx={{ width: col.width }}>
                    {col.headerName}
                  </TableCell>
                );
              })}
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      p: 2,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  这里什么都没有~
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const id = getRowId(row);
                const isToggling = togglingIds.has(id);
                return (
                  <TableRow key={id} hover>
                    {columns.map((col) => {
                      //console.log(row);
                      //console.log(row[col.fieldName]);
                      return (
                        <TableCell key={col.fieldName}>
                          {col.renderCell
                            ? col.renderCell(row[col.fieldName])
                            : row[col.fieldName]}
                        </TableCell>
                      );
                    })}
                    <TableCell align="right">
                      <Tooltip title={row.active ? "点击停用" : "点击启用"}>
                        <span>
                          <Switch
                            size="large"
                            checked={!!row.active}
                            onChange={() => onToggleActive(row)}
                            disabled={isToggling}
                          />
                        </span>
                      </Tooltip>
                      <IconButton size="small" onClick={() => onEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteOne(row)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={size}
        onRowsPerPageChange={(e) =>
          onPageSizeChange(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[10, 20, 50]}
        count={total}
      />
    </>
  );
}
