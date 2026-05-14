import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Stack,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { NumberedTablePagination } from "../common/NumberedTablePagination";
import {
  formatDisplayAmount,
  formatDisplayDate,
} from "../../utils/formatters";
import { purchaseRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";

function renderCategory(value) {
  const map = {
    BEVERAGE: "酒水",
    BUSINESS_GIFT: "商务礼品",
    TEA: "茶叶",
    FRUIT: "水果",
  };
  return map[value] ?? value ?? "";
}

export default function PurchaseRecordsTable({
  records,
  onEditRow,
  onDeleteRow,
  page,
  setPage,
  size,
  setSize,
  totalElements,
  loading,
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
            <TableCell sx={{ minWidth: 95 }} padding="checkbox" align="center">
              操作
            </TableCell>
            <TableCell sx={{ minWidth: 110 }}>{fieldLabels.purchaseCategory}</TableCell>
            <TableCell sx={{ minWidth: 200 }}>{fieldLabels.supplier}</TableCell>
            <TableCell sx={{ minWidth: 120 }}>{fieldLabels.productName}</TableCell>
            <TableCell align="right" sx={{ minWidth: 100 }}>
              {fieldLabels.purchasedQuantity}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 100 }}>
              {fieldLabels.remainingQuantity}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>{fieldLabels.specification}</TableCell>
            <TableCell align="right" sx={{ minWidth: 100 }}>
              {fieldLabels.unitPrice}
            </TableCell>
            <TableCell align="right" sx={{ minWidth: 120 }}>
              {fieldLabels.totalAmount}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>{fieldLabels.applicationDate}</TableCell>
            <TableCell sx={{ minWidth: 120 }}>{fieldLabels.purchaseDate}</TableCell>
            <TableCell sx={{ minWidth: 120 }}>{fieldLabels.invoiceDate}</TableCell>
            <TableCell sx={{ minWidth: 200 }}>{fieldLabels.invoiceNumberString}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell padding="checkbox">
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="circular" width={28} height={28} />
                  </Stack>
                </TableCell>
                {Array.from({ length: 12 }).map((__, i) => (
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
                  <TableCell padding="checkbox">
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
                  </TableCell>
                  <TableCell>{renderCategory(record.category)}</TableCell>
                  <TableCell>{record.supplier}</TableCell>
                  <TableCell>{record.productName}</TableCell>
                  <TableCell align="right">{record.purchasedQuantity}</TableCell>
                  <TableCell align="right">{record.remainingQuantity}</TableCell>
                  <TableCell>{record.specification}</TableCell>
                  <TableCell align="right">
                    {formatDisplayAmount(record.unitPrice)}
                  </TableCell>
                  <TableCell align="right">
                    {formatDisplayAmount(record.totalAmount)}
                  </TableCell>
                  <TableCell>{formatDisplayDate(record.applicationDate)}</TableCell>
                  <TableCell>{formatDisplayDate(record.purchaseDate)}</TableCell>
                  <TableCell>{formatDisplayDate(record.invoiceDate)}</TableCell>
                  <TableCell>{record.invoiceNumber}</TableCell>
                </TableRow>
              ))}

              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} align="left">
                    我采购记录呢？
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
