import {
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
  Typography,
} from "@mui/material";
import {
  hospitalityRecordFieldLabels as fieldLabels,
  purchaseRecordFieldLabels as purchaseLabels,
  usageRecordFieldLabels as usageLabels,
} from "../../constants/recordFieldLabels";
import { formatDisplayAmount, formatDisplayDate } from "../../utils/formatters";

export default function ItemsTable({ receiptLines = [] }) {
  if (!receiptLines.length) {
    return (
      <Typography variant="body2" sx={{ p: 1 }}>
        没有领用明细~
      </Typography>
    );
  }

  return (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell>{fieldLabels.receiptProductName}</TableCell>
          <TableCell>{purchaseLabels.specification}</TableCell>
          <TableCell align="right">{purchaseLabels.unitPrice}</TableCell>
          <TableCell align="right">{usageLabels.usedQuantity}</TableCell>
          <TableCell>{usageLabels.receiptDate}</TableCell>
          <TableCell>{usageLabels.recipient}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {receiptLines.map((line, index) => (
          <TableRow
            key={line.purchaseLineId ?? `${line.productName}-${index}`}
          >
            <TableCell>{line.productName ?? "—"}</TableCell>
            <TableCell>{line.specification ?? "—"}</TableCell>
            <TableCell align="right">
              {formatDisplayAmount(line.unitPrice)}
            </TableCell>
            <TableCell align="right">{line.quantity ?? "—"}</TableCell>
            <TableCell>{formatDisplayDate(line.receiptDate)}</TableCell>
            <TableCell>{line.recipientName ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
