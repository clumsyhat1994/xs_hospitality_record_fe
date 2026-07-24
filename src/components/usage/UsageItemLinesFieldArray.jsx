import { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Button,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import purchaseRecordApi from "../../api/purchaseRecordApi";
import masterDataApi from "../../api/masterDataApi";
import { flattenPurchaseRecordsToLines } from "../../utils/giftReceiptLineFormUtils";
import RHFCellTextField from "../form/RHFCellTextField";
import RHFAutocomplete from "../form/RHFAutocomplete";
import RHFAsyncAutocomplete from "../form/RHFAsyncAutocomplete";
import { GIFT_PURCHASE_CATEGORY_OPTIONS } from "../../constants/giftPurchaseCategories";
import { usageRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";
import { formatDisplayAmount } from "../../utils/formatters";

const lineGridSx = {
  display: "grid",
  gridTemplateColumns: "32px repeat(12, minmax(0, 1fr)) 48px",
  gridTemplateRows: "auto auto",
  columnGap: 0.5,
  rowGap: 3,
  alignItems: "start",
  pt: 3,
  pb: 1,
  px: 0.5,
  border: "1px dashed",
  borderColor: "primary.light",
  borderRadius: 1,
};

const lineFieldSx = { px: 0.5, minWidth: 0 };

const lineSideColumnSx = {
  gridRow: "1 / 3",
  alignSelf: "stretch",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transform: "translateY(-8px)",
};

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateYearsAgo(baseDate, years) {
  const date = new Date(baseDate);
  date.setFullYear(date.getFullYear() - years);
  return date;
}

function getPurchaseLineLabel(option) {
  const unitPrice = formatDisplayAmount(option?.unitPrice);
  return `${option?.productName ?? "-"} | 规格: ${
    option?.specification ?? "-"
  } | 单价: ${unitPrice || "-"} | 采购日期: ${
    option?.purchaseDate ?? "-"
  } | 剩余: ${Math.max(0, Number(option?.effectiveRemainingQuantity ?? 0))}`;
}

function purchaseLineRemainingCeiling(line, initialUsedByPurchaseLineId) {
  if (!line?.id) return 0;
  const baseline =
    Number(initialUsedByPurchaseLineId[String(line.id)] ?? 0) || 0;
  return Number(line.remainingQuantity ?? 0) + baseline;
}

function quantityAllocatedInOtherRows(allLines, rowIndex, purchaseLineId) {
  if (purchaseLineId == null || String(purchaseLineId).trim() === "") return 0;
  const targetId = String(purchaseLineId);
  return (allLines ?? []).reduce((sum, row, i) => {
    if (i === rowIndex) return sum;
    if (String(row?.purchaseLineId ?? "") !== targetId) return sum;
    const quantity = Number(row?.quantity);
    return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
}

function buildIncludePurchaseLineIdsForUsage(initialUsedByPurchaseLineId) {
  return Object.keys(initialUsedByPurchaseLineId ?? {})
    .map((idStr) => Number(idStr))
    .filter((n) => Number.isFinite(n) && n > 0);
}

async function fetchEligiblePurchaseLinesByCategory(category, includeLineIds = []) {
  const today = new Date();
  const twoYearsAgo = getDateYearsAgo(today, 2);

  const pageSize = 200;
  let page = 0;
  let categoryRecords = [];
  let totalElements = Infinity;

  const filters = {
    category,
    purchaseDateFrom: undefined,
    purchaseDateTo: formatDate(today),
    inStockOnly: true,
  };
  const listOptions = {
    ...(includeLineIds.length > 0 ? { includeLineIds } : {}),
    sort: ["purchaseDate,asc", "id,asc"],
  };

  while (categoryRecords.length < totalElements) {
    const res = await purchaseRecordApi.filteredList(
      page,
      pageSize,
      filters,
      listOptions,
    );
    const data = res?.data ?? {};
    const content = Array.isArray(data.content) ? data.content : [];
    totalElements = Number.isFinite(data.totalElements)
      ? data.totalElements
      : content.length;

    categoryRecords = categoryRecords.concat(content);
    if (content.length < pageSize) break;
    page += 1;
  }

  return flattenPurchaseRecordsToLines(categoryRecords);
}

function GiftReceiptLineRow({
  fieldId,
  index,
  onRemove,
  purchaseLinesByCategory,
  loadCategoryLines,
  loadingCategoryLines,
  initialUsedByPurchaseLineId,
  allGiftReceiptLines,
  categoryOptions,
  handlers,
  setHandlers,
}) {
  const { setValue } = useFormContext();
  const line = allGiftReceiptLines?.[index];
  const selectedCategory = line?.category;
  const selectedPurchaseLineId = line?.purchaseLineId;
  const categoryPurchaseLines = selectedCategory
    ? (purchaseLinesByCategory[selectedCategory] ?? [])
    : [];
  const categoryPurchaseLinesWithRemaining = useMemo(
    () =>
      categoryPurchaseLines.map((purchaseLine) => {
        const ceiling = purchaseLineRemainingCeiling(
          purchaseLine,
          initialUsedByPurchaseLineId,
        );
        const allocatedElsewhere = quantityAllocatedInOtherRows(
          allGiftReceiptLines,
          index,
          purchaseLine.id,
        );
        return {
          ...purchaseLine,
          effectiveRemainingQuantity: Math.max(0, ceiling - allocatedElsewhere),
        };
      }),
    [
      categoryPurchaseLines,
      initialUsedByPurchaseLineId,
      allGiftReceiptLines,
      index,
    ],
  );

  const purchaseLineOptionsForRow = categoryPurchaseLinesWithRemaining;

  const selectedPurchaseLineOption =
    categoryPurchaseLinesWithRemaining.find(
      (purchaseLine) => String(purchaseLine.id) === String(selectedPurchaseLineId ?? ""),
    ) ?? null;
    
  const maxAllowedQuantity = Math.max(
    0,
    selectedPurchaseLineOption != null
      ? Number(selectedPurchaseLineOption.effectiveRemainingQuantity ?? 0)
      : Math.max(
          0,
          (initialUsedByPurchaseLineId[String(selectedPurchaseLineId ?? "")] || 0) -
            quantityAllocatedInOtherRows(
              allGiftReceiptLines,
              index,
              selectedPurchaseLineId,
            ),
        ),
  );

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryLines(selectedCategory);
    }
  }, [loadCategoryLines, selectedCategory]);

  return (
    <Box key={fieldId} sx={lineGridSx}>
      <Box
        sx={{
          ...lineSideColumnSx,
          gridColumn: 1,
          color: "text.secondary",
        }}
      >
        {index + 1}
      </Box>

      <Box sx={{ ...lineFieldSx, gridRow: 1, gridColumn: "2 / 5" }}>
        <RHFAutocomplete
          name={`giftReceiptLines.${index}.category`}
          label="礼品类型"
          options={categoryOptions}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          rules={{ required: "请选择礼品类型" }}
          afterFieldValueChange={() => {
            setValue(`giftReceiptLines.${index}.purchaseLineId`, "");
            setValue(`giftReceiptLines.${index}.quantity`, "");
            setValue(`giftReceiptLines.${index}.unitPrice`, "");
          }}
          required={false}
        />
      </Box>

      <Box sx={{ ...lineFieldSx, gridRow: 1, gridColumn: "5 / 14" }}>
        <RHFAutocomplete
          name={`giftReceiptLines.${index}.purchaseLineId`}
          label="采购明细"
          options={purchaseLineOptionsForRow}
          loading={Boolean(
            selectedCategory && loadingCategoryLines[selectedCategory],
          )}
          getOptionValue={(option) => option.id}
          getOptionLabel={getPurchaseLineLabel}
          rules={{
            validate: (value) => {
              if (!selectedCategory) return true;
              return value ? true : "请选择采购明细";
            },
          }}
          afterFieldValueChange={(next) => {
            setValue(`giftReceiptLines.${index}.quantity`, "");
            const price =
              next != null && next.unitPrice != null && next.unitPrice !== ""
                ? next.unitPrice
                : "";
            setValue(`giftReceiptLines.${index}.unitPrice`, price);
          }}
          autocompleteProps={{ disabled: !selectedCategory }}
          required={false}
        />
      </Box>

      <Box sx={{ ...lineSideColumnSx, gridColumn: 14 }}>
        <IconButton
          color="error"
          onClick={() => onRemove(index)}
          aria-label="删除领用物品"
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ ...lineFieldSx, gridRow: 2, gridColumn: "2 / 6" }}>
        <RHFAsyncAutocomplete
          name={`giftReceiptLines.${index}.recipientId`}
          label={fieldLabels.recipient}
          options={handlers ?? []}
          setOptions={setHandlers}
          fetchOptions={masterDataApi.searchHandlers}
          rules={{ required: "请选择领用人" }}
        />
      </Box>

      <Box sx={{ ...lineFieldSx, gridRow: 2, gridColumn: "6 / 10" }}>
        <RHFCellTextField
          name={`giftReceiptLines.${index}.receiptDate`}
          label={fieldLabels.receiptDate}
          type="date"
          rules={{ required: "请选择领用日期" }}
        />
      </Box>

      <Box sx={{ ...lineFieldSx, gridRow: 2, gridColumn: "10 / 14" }}>
        <RHFCellTextField
          name={`giftReceiptLines.${index}.quantity`}
          label="领用数量"
          type="number"
          disabled={!selectedPurchaseLineId}
          rules={{
            validate: (value) => {
              if (!selectedPurchaseLineId) return true;
              if (value === "" || value == null) return "请输入领用数量";
              const quantity = Number(value);
              if (!Number.isFinite(quantity)) return "请输入有效数量";
              if (quantity < 1) return "数量至少为 1";
              if (quantity > maxAllowedQuantity) {
                return `数量不能超过剩余库存 ${maxAllowedQuantity}`;
              }
              return true;
            },
          }}
          slotProps={{
            htmlInput: {
              min: 1,
              max: maxAllowedQuantity,
            },
          }}
          helperText={
            selectedPurchaseLineId
              ? `可领用上限：${maxAllowedQuantity}`
              : undefined
          }
          required={false}
        />
      </Box>
    </Box>
  );
}

export default function UsageItemLinesFieldArray({
  control,
  errors,
  clearErrors,
  initialUsedByPurchaseLineId = {},
  allowedCategories,
  handlers = [],
  setHandlers,
  defaultReceiptDate = "",
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "giftReceiptLines",
  });
  const [purchaseLinesByCategory, setPurchaseLinesByCategory] = useState({});
  const [loadingByCategory, setLoadingByCategory] = useState({});
  const giftReceiptLines = useWatch({
    control,
    name: "giftReceiptLines",
  });
  const { getFieldState } = useFormContext();

  // Backend errors attach to giftReceiptLines (array root), not nested paths like
  // giftReceiptLines.0.receiptDate — clear the root server error when lines change
  // so handleSubmit is not blocked after the user fixes a line.
  useEffect(() => {
    if (getFieldState("giftReceiptLines").error?.type === "server") {
      clearErrors("giftReceiptLines");
    }
  }, [giftReceiptLines, clearErrors, getFieldState]);

  const categoryOptions = useMemo(() => {
    if (!allowedCategories?.length) return GIFT_PURCHASE_CATEGORY_OPTIONS;
    const allowed = new Set(allowedCategories);
    return GIFT_PURCHASE_CATEGORY_OPTIONS.filter((opt) =>
      allowed.has(opt.value),
    );
  }, [allowedCategories]);

  const defaultCategory =
    categoryOptions.length === 1 ? categoryOptions[0].value : "";

  const handleAdd = () => {
    append({
      category: defaultCategory,
      purchaseLineId: "",
      quantity: "",
      unitPrice: "",
      recipientId: null,
      receiptDate: defaultReceiptDate,
    });
    clearErrors("giftReceiptLines");
  };

  const handleRemove = (index) => {
    remove(index);
    clearErrors("giftReceiptLines");
  };

  const loadCategoryLines = async (category) => {
    if (!category) return;
    if (purchaseLinesByCategory[category]) return;
    if (loadingByCategory[category]) return;
    setLoadingByCategory((prev) => ({ ...prev, [category]: true }));
    try {
      const includeLineIds = buildIncludePurchaseLineIdsForUsage(
        initialUsedByPurchaseLineId,
      );
      const lines = await fetchEligiblePurchaseLinesByCategory(
        category,
        includeLineIds,
      );
      setPurchaseLinesByCategory((prev) => ({
        ...prev,
        [category]: lines,
      }));
    } catch (err) {
      console.error("加载可领用采购明细失败", err);
    } finally {
      setLoadingByCategory((prev) => ({ ...prev, [category]: false }));
    }
  };

  return (
    <>
      <Divider sx={{ mt: 2, mb: 2, fontSize: 13 }}>领用物品</Divider>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {fields.map((field, index) => (
          <GiftReceiptLineRow
            key={field.id}
            fieldId={field.id}
            index={index}
            onRemove={handleRemove}
            purchaseLinesByCategory={purchaseLinesByCategory}
            loadCategoryLines={loadCategoryLines}
            loadingCategoryLines={loadingByCategory}
            initialUsedByPurchaseLineId={initialUsedByPurchaseLineId}
            allGiftReceiptLines={giftReceiptLines}
            categoryOptions={categoryOptions}
            handlers={handlers}
            setHandlers={setHandlers}
          />
        ))}
      </Stack>
      <Button
        sx={{ mt: 1, minHeight: 40 }}
        size="small"
        variant="outlined"
        fullWidth
        onClick={handleAdd}
      >
        <AddIcon fontSize="small" />
        点击添加物品
      </Button>
      {errors?.giftReceiptLines?.message && (
        <Alert
          id="gift-receipt-lines-error"
          sx={{ mt: 1, whiteSpace: "pre-line" }}
          severity="error"
        >
          {errors.giftReceiptLines.message}
        </Alert>
      )}
    </>
  );
}
