import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Skeleton,
  IconButton,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { NumberedTablePagination } from "../common/NumberedTablePagination";
import { formatDisplayDate } from "../../utils/formatters";
import { usageRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";

/** Aligns with purchase slice fields used in UsageItemLinesFieldArray / API slice DTO. */
function formatPurchaseDateForAllocation(value) {
  if (!value) return "-";
  if (typeof value === "string") return value.slice(0, 10);
  return formatDisplayDate(value);
}

export default function UsageRecordsTable({
  records,
  page,
  setPage,
  size,
  setSize,
  totalElements,
  loading,
  onEditRow,
  onDeleteRow,
}) {
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
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                py: 3,
              },
            }}
          >
            <TableCell sx={{ minWidth: 90 }}>{fieldLabels.actions}</TableCell>
            <TableCell sx={{ minWidth: 110 }}>
              {fieldLabels.usageDate}
            </TableCell>
            <TableCell sx={{ minWidth: 160 }}>
              {fieldLabels.department}
            </TableCell>
            <TableCell sx={{ minWidth: 160 }}>
              {fieldLabels.counterparty}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>
              {fieldLabels.recipient}
            </TableCell>
            <TableCell align="center" sx={{ minWidth: 360 }}>
              {fieldLabels.purchaseAllocations}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.hospitalityRecordId}
            </TableCell>
            <TableCell sx={{ minWidth: 200 }}>{fieldLabels.remark}</TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.createdAt}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 9 }).map((__, i) => (
                  <TableCell key={i}>
                    <Skeleton height={26} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <>
              {records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    {record.hospitalityRecordId == null ? (
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
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{formatDisplayDate(record.usageDate)}</TableCell>
                  <TableCell>{record.departmentName}</TableCell>
                  <TableCell>{record.counterpartyName}</TableCell>
                  <TableCell>{record.recipientName}</TableCell>
                  <TableCell align="center" sx={{ verticalAlign: "top", py: 0.5 }}>
                    {record.purchaseAllocations?.length ? (
                      <Table
                        size="small"
                        sx={{
                          width: "max-content",
                          maxWidth: "100%",
                          mx: "auto",
                          "& .MuiTableCell-root": {
                            py: 0.35,
                            px: 1,
                            fontSize: "0.8125rem",
                            lineHeight: 1.35,
                            borderBottom: "none",
                          },
                          "& thead .MuiTableCell-root": {
                            color: "text.secondary",
                            fontWeight: 600,
                            borderBottom: 1,
                            borderColor: "divider",
                            whiteSpace: "nowrap",
                          },
                          "& tbody .MuiTableCell-root": {
                            verticalAlign: "top",
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>品名</TableCell>
                            <TableCell>规格</TableCell>
                            <TableCell>采购日期</TableCell>
                            <TableCell align="right">剩余</TableCell>
                            <TableCell align="right">领用数量</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.purchaseAllocations.map((a, i) => (
                            <TableRow key={`${a.purchaseId ?? "row"}-${i}`}>
                              <TableCell sx={{ wordBreak: "break-word" }}>
                                {a.productName ?? "—"}
                              </TableCell>
                              <TableCell sx={{ wordBreak: "break-word" }}>
                                {a.specification ?? "—"}
                              </TableCell>
                              <TableCell sx={{ whiteSpace: "nowrap" }}>
                                {formatPurchaseDateForAllocation(
                                  a.purchaseDate,
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                {Math.max(0, Number(a.remainingQuantity ?? 0))}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                {a.quantity ?? "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {record.hospitalityRecordId != null
                      ? record.hospitalityRecordId
                      : "—"}
                  </TableCell>
                  <TableCell>{record.remark ?? ""}</TableCell>
                  <TableCell>{formatDisplayDate(record.createdAt)}</TableCell>
                </TableRow>
              ))}

              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="left">
                    暂无领用记录
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
      <NumberedTablePagination
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
