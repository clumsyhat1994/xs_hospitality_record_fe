import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Checkbox,
  IconButton,
  Stack,
  TablePagination,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCallback, useEffect, useState } from "react";
import hospitalityApi from "../../api/hospitalityApi";
import fieldLabels from "../../constants/recordFieldLabels";
import { ItemsPopperCell } from "./ItemsPopperCell";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "";
  return Number(value).toFixed(2);
}

export default function HospitalityRecordsTable({
  records,
  setRecords,
  selectedIds,
  onToggleAll,
  onToggleOne,
  onEditRow,
  onDeleteRow,
  page,
  setPage,
  filters,
  size,
  setSize,
  totalElements,
  setTotalElements,
  load,
  loading,
  setLoading,
}) {
  const allSelected =
    records.length > 0 && selectedIds.length === records.length;
  const indeterminate =
    selectedIds.length > 0 && selectedIds.length < records.length;

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(0);
  };

  return (
    <TableContainer sx={{ maxHeight: "80vh", overflowX: "auto" }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {/* <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={(e) => onToggleAll(e.target.checked)}
              />
            </TableCell> */}
            <TableCell sx={{ minWidth: 95 }} padding="checkbox" align="center">
              操作
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.receptionDate}
            </TableCell>
            <TableCell sx={{ minWidth: 150 }}>
              {fieldLabels.counterparty}
            </TableCell>
            <TableCell sx={{ minWidth: 110 }}>
              {fieldLabels.department}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>
              {fieldLabels.handlerName}
            </TableCell>
            <TableCell sx={{ minWidth: 110 }}>
              {fieldLabels.hospitalityType}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>{fieldLabels.location}</TableCell>
            <TableCell sx={{ minWidth: 100 }}>{fieldLabels.items}</TableCell>
            <TableCell align="right" sx={{ minWidth: 110 }}>
              {fieldLabels.invoiceAmount}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 110 }}>
              {fieldLabels.totalAmount}
            </TableCell>
            <TableCell align="center" sx={{ minWidth: 200 }}>
              {fieldLabels.invoiceNumberString}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.invoiceDate}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.deptHeadApprovalDate}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.partySecretaryApprovalDate}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 100 }}>
              {fieldLabels.theirCount}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 100 }}>
              {fieldLabels.ourCount}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 100 }}>
              {fieldLabels.totalCount}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 110 }}>
              {fieldLabels.perCapitaAmount}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.ourHostPosition}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.theirHostPosition}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                {/* <TableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={24} height={28} />
                </TableCell> */}

                <TableCell padding="checkbox">
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="circular" width={28} height={28} />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>

                <TableCell align="right">
                  <Skeleton height={26} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton height={26} />
                </TableCell>

                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>

                <TableCell align="right">
                  <Skeleton height={26} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton height={26} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton height={26} />
                </TableCell>

                <TableCell align="right">
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
                <TableCell>
                  <Skeleton height={26} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <>
              {records.map((record) => {
                const selected = selectedIds.includes(record.id);
                return (
                  <TableRow key={record.id} hover selected={selected}>
                    {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected}
                        onChange={() => onToggleOne(record.id)}
                      />
                    </TableCell> */}

                    <TableCell padding="checkbox">
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => onEditRow(record)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteRow(record.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>

                    <TableCell>{formatDate(record.receptionDate)}</TableCell>
                    <TableCell>{record.counterpartyName}</TableCell>
                    <TableCell>{record.departmentName}</TableCell>
                    <TableCell>{record.handlerName}</TableCell>
                    <TableCell>{record.hospitalityTypeName}</TableCell>
                    <TableCell>{record.location}</TableCell>
                    <TableCell>
                      <ItemsPopperCell items={record.items} />
                    </TableCell>
                    <TableCell align="right">
                      {formatAmount(record.invoiceAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatAmount(record.totalAmount)}
                    </TableCell>
                    <TableCell>{record.invoiceNumberString}</TableCell>
                    <TableCell>{record.invoiceDate}</TableCell>
                    <TableCell>
                      {formatDate(record.deptHeadApprovalDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(record.partySecretaryApprovalDate)}
                    </TableCell>
                    <TableCell align="right">{record.theirCount}</TableCell>
                    <TableCell align="right">{record.ourCount}</TableCell>
                    <TableCell align="right">{record.totalCount}</TableCell>
                    <TableCell align="right">
                      {formatAmount(record.perCapitaAmount)}
                    </TableCell>
                    <TableCell>{record.ourHostPosition}</TableCell>
                    <TableCell>{record.theirHostPosition}</TableCell>
                  </TableRow>
                );
              })}

              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={17} align="left">
                    您已抵达台帐宇宙的尽头~
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={size}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </TableContainer>
  );
}
