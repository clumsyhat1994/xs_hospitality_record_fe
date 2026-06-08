import { useState, useEffect, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";
import { setParams } from "../../utils/queryParamsHelper";
import purchaseRecordApi from "../../api/purchaseRecordApi";
import { downloadBlob } from "../../utils/downloadBlob";
import { getBackendErrorMessage } from "../../utils/errorUtils";
import PurchaseRecordsToolbar from "./PurchaseRecordsToolbar";
import PurchaseRecordsTable from "./PurchaseRecordsTable";
import PurchaseRecordDialog from "./PurchaseRecordDialog";
import PurchaseRelatedUsagesDialog from "./PurchaseRelatedUsagesDialog";
import UsageRecordDialog from "../usage/UsageRecordDialog";

const emptyRecord = {
  id: null,
  category: "",
  applicationDate: "",
  purchaseDate: "",
  invoiceDate: "",
  invoiceNumber: "",
  supplierId: null,
  lines: [
    {
      id: null,
      productName: "",
      specification: "",
      unitPrice: null,
      purchasedQuantity: null,
    },
  ],
};

export default function PurchaseRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [relatedUsagesTarget, setRelatedUsagesTarget] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [draftFilters, setDraftFilters] = useState({
    category: "",
    purchaseDateFrom: "",
    purchaseDateTo: "",
    supplierContains: "",
    productNameContains: "",
  });
  const [filters, setFilters] = useState(draftFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlFilters = {
      category: searchParams.get("category") ?? "",
      purchaseDateFrom: searchParams.get("purchaseDateFrom") ?? "",
      purchaseDateTo: searchParams.get("purchaseDateTo") ?? "",
      supplierContains: searchParams.get("supplierContains") ?? "",
      productNameContains: searchParams.get("productNameContains") ?? "",
    };
    const urlPage = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 0;
    const urlSize = searchParams.get("size")
      ? Number(searchParams.get("size"))
      : 10;

    setFilters(urlFilters);
    setDraftFilters(urlFilters);
    setPage(urlPage);
    setSize(urlSize);
  }, [searchParams]);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const res = await purchaseRecordApi.filteredList(page, size, filters, {
          signal,
        });
        const data = res.data;
        setRecords(data.content ?? []);
        setTotalElements(data.totalElements ?? 0);
      } catch (e) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          console.error(e);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, size, filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleDraftFilterChange = (field, value) => {
    setDraftFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      setParams(next, "category", draftFilters.category);
      setParams(next, "purchaseDateFrom", draftFilters.purchaseDateFrom);
      setParams(next, "purchaseDateTo", draftFilters.purchaseDateTo);
      setParams(next, "supplierContains", draftFilters.supplierContains);
      setParams(next, "productNameContains", draftFilters.productNameContains);
      next.set("page", "0");
      next.set("size", String(size));
      return next;
    });
  };

  const handleClear = () => {
    setSearchParams(new URLSearchParams());
    navigate(moduleRoutes.PURCHASE_RECORDS, { replace: true });
  };

  const handleExport = async () => {
    try {
      const res = await purchaseRecordApi.export(filters);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `purchase-records-${dateStr}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
      window.alert("导出失败，请联系系统管理员。");
    }
  };

  const handleCreatePurchaseClick = () => {
    setEditingRecord(null);
    setPurchaseDialogOpen(true);
  };

  const handleCreateUsageClick = () => {
    setUsageDialogOpen(true);
  };

  const handleEditRow = (record) => {
    setEditingRecord(record);
    setPurchaseDialogOpen(true);
  };

  const handleViewUsages = (record, line) => {
    setRelatedUsagesTarget({ purchaseRecord: record, purchaseLine: line });
  };

  const handleDeleteRow = async (id) => {
    if (!window.confirm("确定删除这条采购记录以及所有相关采购明细吗?")) return;
    try {
      await purchaseRecordApi.deleteOne(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      window.alert(getBackendErrorMessage(err));
    }
  };

  const handlePurchaseDialogSave = async () => {
    await load();
    setPurchaseDialogOpen(false);
  };

  const handleUsageDialogSave = async () => {
    await load();
    setUsageDialogOpen(false);
  };

  const setPageUrl = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      next.set("size", String(size));
      return next;
    });
  };

  const setSizeUrl = (newSize) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("size", String(newSize));
      next.set("page", "0");
      return next;
    });
  };

  return (
    <Box>
      <Paper elevation={2}>
        <PurchaseRecordsToolbar
          draftFilters={draftFilters}
          onDraftFilterChange={handleDraftFilterChange}
          onSearch={handleSearch}
          onClear={handleClear}
          onCreatePurchase={handleCreatePurchaseClick}
          onCreateUsage={handleCreateUsageClick}
          onExport={handleExport}
        />
        <PurchaseRecordsTable
          records={records}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          onViewUsages={handleViewUsages}
          page={page}
          setPage={setPageUrl}
          size={size}
          setSize={setSizeUrl}
          totalElements={totalElements}
          loading={loading}
        />
      </Paper>
      <PurchaseRecordDialog
        open={purchaseDialogOpen}
        initialValues={editingRecord || emptyRecord}
        isEditMode={!!editingRecord}
        onClose={() => setPurchaseDialogOpen(false)}
        onSave={handlePurchaseDialogSave}
      />
      <UsageRecordDialog
        open={usageDialogOpen}
        onClose={() => setUsageDialogOpen(false)}
        onSave={handleUsageDialogSave}
      />
      <PurchaseRelatedUsagesDialog
        open={relatedUsagesTarget != null}
        purchaseRecord={relatedUsagesTarget?.purchaseRecord}
        purchaseLine={relatedUsagesTarget?.purchaseLine}
        onClose={() => setRelatedUsagesTarget(null)}
      />
    </Box>
  );
}
