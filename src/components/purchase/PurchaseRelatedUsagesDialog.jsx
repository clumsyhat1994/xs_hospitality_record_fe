import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import usageRecordApi from "../../api/usageRecordApi";
import { formatDisplayDate } from "../../utils/formatters";
import {
  usageRecordFieldLabels as usageLabels,
  purchaseRecordFieldLabels as purchaseLabels,
} from "../../constants/recordFieldLabels";

function usageLinesForPurchaseLine(usage, purchaseLineId) {
  if (!purchaseLineId) return [];
  return (usage.usageLines ?? []).filter(
    (line) => line.purchaseLineId === purchaseLineId,
  );
}

export default function PurchaseRelatedUsagesDialog({
  open,
  purchaseRecord,
  purchaseLine,
  onClose,
}) {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(false);
  const purchaseLineId = purchaseLine?.id;

  useEffect(() => {
    if (!open || purchaseLineId == null) {
      return undefined;
    }
    const controller = new AbortController();
    setUsages([]);
    setLoading(true);
    usageRecordApi
      .filteredList(0, 500, { purchaseLineId }, { signal: controller.signal })
      .then((res) => {
        setUsages(res.data?.content ?? []);
      })
      .catch((e) => {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          console.error(e);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, purchaseLineId]);

  const lineSummary = [
    [purchaseLabels.supplier, purchaseRecord?.supplier?.trim() || "—"],
    [purchaseLabels.productName, purchaseLine?.productName?.trim() || "—"],
    [purchaseLabels.specification, purchaseLine?.specification?.trim() || "—"],
    [
      purchaseLabels.purchasedQuantity,
      purchaseLine?.purchasedQuantity ?? "—",
    ],
    [
      purchaseLabels.remainingQuantity,
      purchaseLine?.remainingQuantity ?? "—",
    ],
    [
      purchaseLabels.purchaseDate,
      purchaseRecord?.purchaseDate
        ? formatDisplayDate(purchaseRecord.purchaseDate)
        : "—",
    ],
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>领用记录</DialogTitle>
      <Box
        sx={{
          px: 3,
          pb: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          typography: "body2",
          color: "text.secondary",
        }}
      >
        {lineSummary.map(([label, value]) => (
          <Typography
            key={label}
            component="span"
            variant="body2"
            color="text.secondary"
          >
            {label}：{value}
          </Typography>
        ))}
      </Box>
      <DialogContent dividers sx={{ borderBottom: "none" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "60vh" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{usageLabels.usageDate}</TableCell>
                  <TableCell>{usageLabels.department}</TableCell>
                  <TableCell>{usageLabels.counterparty}</TableCell>
                  <TableCell>{usageLabels.recipient}</TableCell>
                  <TableCell>{purchaseLabels.productName}</TableCell>
                  <TableCell>{purchaseLabels.specification}</TableCell>
                  <TableCell align="right">{usageLabels.usedQuantity}</TableCell>
                  <TableCell>{usageLabels.remark}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usages.flatMap((usage) => {
                  const lines = usageLinesForPurchaseLine(usage, purchaseLineId);
                  if (!lines.length) return [];
                  return lines.map((line, lineIndex) => (
                    <TableRow
                      key={`${usage.id}-${line.purchaseLineId ?? lineIndex}`}
                      hover
                    >
                      <TableCell>
                        {lineIndex === 0
                          ? formatDisplayDate(usage.usageDate)
                          : ""}
                      </TableCell>
                      <TableCell>
                        {lineIndex === 0 ? (usage.departmentName ?? "—") : ""}
                      </TableCell>
                      <TableCell>
                        {lineIndex === 0 ? (usage.counterpartyName ?? "—") : ""}
                      </TableCell>
                      <TableCell>
                        {lineIndex === 0 ? (usage.recipientName ?? "—") : ""}
                      </TableCell>
                      <TableCell>{line.productName ?? "—"}</TableCell>
                      <TableCell>{line.specification ?? "—"}</TableCell>
                      <TableCell align="right">
                        {line.quantity ?? "—"}
                      </TableCell>
                      <TableCell>
                        {lineIndex === 0 ? (usage.remark ?? "") : ""}
                      </TableCell>
                    </TableRow>
                  ));
                })}
                {!loading &&
                  usages.every(
                    (u) =>
                      usageLinesForPurchaseLine(u, purchaseLineId).length === 0,
                  ) && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        暂无领用记录
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
}
