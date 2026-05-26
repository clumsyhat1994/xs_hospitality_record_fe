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

function renderCategory(value) {
  const map = {
    BEVERAGE: "酒水",
    BUSINESS_GIFT: "商务礼品",
    TEA: "茶叶",
    FRUIT: "水果",
  };
  return map[value] ?? value ?? "";
}

function usageLinesForPurchase(usage, purchaseRecordId) {
  if (!purchaseRecordId) return [];
  return (usage.usageLines ?? []).filter(
    (line) => line.purchaseRecordId === purchaseRecordId,
  );
}

export default function PurchaseRelatedUsagesDialog({
  open,
  purchaseRecord,
  onClose,
}) {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(false);
  const purchaseRecordId = purchaseRecord?.id;

  useEffect(() => {
    if (!open || purchaseRecordId == null) {
      return undefined;
    }
    const controller = new AbortController();
    setUsages([]);
    setLoading(true);
    usageRecordApi
      .filteredList(0, 500, { purchaseRecordId }, { signal: controller.signal })
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
  }, [open, purchaseRecordId]);

  const titleSupplier = purchaseRecord?.supplier?.trim() || "—";
  const titleCategory = renderCategory(purchaseRecord?.category);
  const titleInvoice = purchaseRecord?.invoiceNumber?.trim() || "—";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>领用记录</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          采购：{titleCategory} · {titleSupplier} · 发票 {titleInvoice}
        </Typography>
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
                  <TableCell>{usageLabels.hospitalityRecordId}</TableCell>
                  <TableCell>{usageLabels.remark}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usages.flatMap((usage) => {
                  const lines = usageLinesForPurchase(usage, purchaseRecordId);
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
                        {lineIndex === 0
                          ? usage.hospitalityRecordId != null
                            ? usage.hospitalityRecordId
                            : "—"
                          : ""}
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
                      usageLinesForPurchase(u, purchaseRecordId).length === 0,
                  ) && (
                    <TableRow>
                      <TableCell colSpan={9}>暂无领用记录</TableCell>
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
