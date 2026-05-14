import { useState, useEffect, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";
import { setParams } from "../../utils/queryParamsHelper";
import purchaseRecordApi from "../../api/purchaseRecordApi";
import PurchaseRecordsToolbar from "./PurchaseRecordsToolbar";
import PurchaseRecordsTable from "./PurchaseRecordsTable";
import PurchaseRecordDialog from "./PurchaseRecordDialog";
import UsageRecordDialog from "../usage/UsageRecordDialog";

const emptyRecord = {
  id: null,
  category: "",
  applicationDate: "",
  purchaseDate: "",
  invoiceDate: "",
  invoiceNumber: "",
  supplier: "",
  productName: "",
  specification: "",
  unitPrice: null,
  purchasedQuantity: null,
};

export default function PurchaseRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
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
    const urlPage = searchParams.get("page") ? Number(searchParams.get("page")) : 0;
    const urlSize = searchParams.get("size") ? Number(searchParams.get("size")) : 10;

    setFilters(urlFilters);
    setDraftFilters(urlFilters);
    setPage(urlPage);
    setSize(urlSize);
  }, [searchParams]);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const res = await purchaseRecordApi.filteredList(page, size, filters, { signal });
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
    [page, size, filters]
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

  const handleDeleteRow = async (id) => {
    if (!window.confirm("确定删除这条采购记录吗?")) return;
    await purchaseRecordApi.deleteOne(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
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
        />
        <PurchaseRecordsTable
          records={records}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
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
    </Box>
  );
}
