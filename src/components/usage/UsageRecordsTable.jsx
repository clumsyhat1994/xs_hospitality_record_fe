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
  Tooltip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { NumberedTablePagination } from "../common/NumberedTablePagination";
import { formatDisplayDate } from "../../utils/formatters";
import {
  usageRecordFieldLabels as fieldLabels,
  purchaseRecordFieldLabels as purchaseLabels,
} from "../../constants/recordFieldLabels";

/** Aligns with purchase slice fields used in UsageItemLinesFieldArray / API slice DTO. */
function formatPurchaseDateForSlice(value) {
  if (!value) return "-";
  if (typeof value === "string") return value.slice(0, 10);
  return formatDisplayDate(value);
}

const usageLineCellSx = {
  fontSize: "0.8125rem",
  verticalAlign: "top",
};

const HOSPITALITY_LINKED_TOOLTIP =
  "该领用记录已关联招待记录，请在招待记录中修改。";

/** Inserts line breaks after commas for multi-line tooltips. */
function tooltipTitleAtCommas(text) {
  return text.replace(/([，,])\s*/g, "$1\n").trimEnd();
}

function RecordLeadingCells({ record, rowSpan, onEditRow, onDeleteRow }) {
  return (
    <>
      <TableCell rowSpan={rowSpan}>
        {record.hospitalityRecordId == null ? (
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => onEditRow(record)}>
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
          // Linked to a hospitality record — edit usage via that record, not here.
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Tooltip
              title={tooltipTitleAtCommas(HOSPITALITY_LINKED_TOOLTIP)}
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: { fontSize: "0.875rem", whiteSpace: "pre-line" },
                },
              }}
            >
              <InfoOutlinedIcon
                fontSize="small"
                color="disabled"
                sx={{ cursor: "help" }}
              />
            </Tooltip>
          </Box>
        )}
      </TableCell>
      <TableCell rowSpan={rowSpan}>
        {formatDisplayDate(record.usageDate)}
      </TableCell>
      <TableCell rowSpan={rowSpan}>{record.departmentName}</TableCell>
      <TableCell rowSpan={rowSpan}>{record.counterpartyName}</TableCell>
    </>
  );
}

function RecordTrailingCells({ record, rowSpan }) {
  return (
    <>
      <TableCell rowSpan={rowSpan} align="center">
        {record.remark ?? ""}
      </TableCell>
      <TableCell rowSpan={rowSpan}>
        {formatDisplayDate(record.createdAt)}
      </TableCell>
    </>
  );
}

function UsageLineCells({ line }) {
  return (
    <>
      <TableCell sx={{ ...usageLineCellSx, whiteSpace: "nowrap" }}>
        {formatPurchaseDateForSlice(line.receiptDate)}
      </TableCell>
      <TableCell sx={{ ...usageLineCellSx, whiteSpace: "nowrap" }}>
        {line.recipientName ?? "—"}
      </TableCell>
      <TableCell sx={{ ...usageLineCellSx, wordBreak: "break-word" }}>
        {line.productName ?? "—"}
      </TableCell>
      <TableCell sx={{ ...usageLineCellSx, wordBreak: "break-word" }}>
        {line.specification ?? "—"}
      </TableCell>
      <TableCell sx={{ ...usageLineCellSx, whiteSpace: "nowrap" }}>
        {formatPurchaseDateForSlice(line.purchaseDate)}
      </TableCell>
      <TableCell
        align="right"
        sx={{ ...usageLineCellSx, whiteSpace: "nowrap" }}
      >
        {Math.max(0, Number(line.remainingQuantity ?? 0))}
      </TableCell>
      <TableCell
        align="right"
        sx={{ ...usageLineCellSx, whiteSpace: "nowrap" }}
      >
        {line.quantity ?? "—"}
      </TableCell>
    </>
  );
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
                borderBottom: 0,
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
            <TableCell colSpan={7} align="center" sx={{ minWidth: 480 }}>
              {fieldLabels.receiptLines}
            </TableCell>
            <TableCell align="center" sx={{ minWidth: 200 }}>
              {fieldLabels.remark}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {fieldLabels.createdAt}
            </TableCell>
          </TableRow>
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                pt: 0,
                pb: 1,
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.8125rem",
                lineHeight: 1.35,
                whiteSpace: "nowrap",
                borderTop: 0,
                borderBottom: 1,
                borderColor: "divider",
              },
            }}
          >
            <TableCell colSpan={4} sx={{ p: 0, border: 0 }} />
            <TableCell sx={{ minWidth: 100 }}>
              {fieldLabels.receiptDate}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>
              {fieldLabels.recipient}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>
              {purchaseLabels.productName}
            </TableCell>
            <TableCell sx={{ minWidth: 80 }}>
              {purchaseLabels.specification}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>
              {purchaseLabels.purchaseDate}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 72 }}>
              {purchaseLabels.remainingQuantity}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 72 }}>
              {fieldLabels.usedQuantity}
            </TableCell>
            <TableCell colSpan={2} sx={{ p: 0, border: 0 }} />
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 14 }).map((__, i) => (
                  <TableCell key={i}>
                    <Skeleton height={26} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <>
              {records.flatMap((record) => {
                const lines = record.receiptLines ?? [];

                if (!lines.length) {
                  return [
                    <TableRow key={record.id} hover>
                      <RecordLeadingCells
                        record={record}
                        rowSpan={1}
                        onEditRow={onEditRow}
                        onDeleteRow={onDeleteRow}
                      />
                      <TableCell colSpan={7} align="center">
                        —
                      </TableCell>
                      <RecordTrailingCells record={record} rowSpan={1} />
                    </TableRow>,
                  ];
                }

                return lines.map((line, lineIndex) => (
                  <TableRow
                    key={`${record.id}-${line.purchaseLineId ?? lineIndex}`}
                    hover
                  >
                    {lineIndex === 0 && (
                      <RecordLeadingCells
                        record={record}
                        rowSpan={lines.length}
                        onEditRow={onEditRow}
                        onDeleteRow={onDeleteRow}
                      />
                    )}
                    <UsageLineCells line={line} />
                    {lineIndex === 0 && (
                      <RecordTrailingCells
                        record={record}
                        rowSpan={lines.length}
                      />
                    )}
                  </TableRow>
                ));
              })}

              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} align="left">
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
