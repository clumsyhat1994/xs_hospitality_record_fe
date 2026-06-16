import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Button,
  Alert,
  Divider,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import purchaseRecordApi from "../../api/purchaseRecordApi";
import {
  flattenPurchaseRecordsToLines,
} from "../../utils/giftUsageLineFormUtils";
import RHFCellTextField from "../form/RHFCellTextField";
import RHFAutocomplete from "../form/RHFAutocomplete";
import { GIFT_PURCHASE_CATEGORY_OPTIONS } from "../../constants/giftPurchaseCategories";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateYearsAgo(baseDate, years) {
  const date = new Date(baseDate);
  date.setFullYear(date.getFullYear() - years);
  return date;
}

function getPurchaseLineLabel(option) {
  return `${option?.productName ?? "-"} | 规格: ${
    option?.specification ?? "-"
  } | 采购日期: ${option?.purchaseDate ?? "-"} | 剩余: ${Math.max(
    0,
    Number(option?.effectiveRemainingQuantity ?? 0),
  )}`;
}

function purchaseLineRemainingCeiling(line, initialUsedByPurchaseLineId) {
  if (!line?.id) return 0;
  const baseline =
    Number(initialUsedByPurchaseLineId[String(line.id)] ?? 0) || 0;
  return Number(line.remainingQuantity ?? 0) + baseline;
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

function GiftInventoryLineRow({
  fieldId,
  index,
  onRemove,
  purchaseLinesByCategory,
  loadCategoryLines,
  loadingCategoryLines,
  initialUsedByPurchaseLineId,
  allGiftInventoryLines,
  categoryOptions,
}) {
  const { setValue } = useFormContext();
  const line = allGiftInventoryLines?.[index];
  const selectedCategory = line?.category;
  const selectedPurchaseLineId = line?.purchaseLineId;
  const categoryPurchaseLines = selectedCategory
    ? (purchaseLinesByCategory[selectedCategory] ?? [])
    : [];
  const categoryPurchaseLinesWithRemaining = categoryPurchaseLines.map((purchaseLine) => {
    const ceiling = purchaseLineRemainingCeiling(
      purchaseLine,
      initialUsedByPurchaseLineId,
    );
    return {
      ...purchaseLine,
      effectiveRemainingQuantity: Math.max(0, ceiling),
    };
  });

  const purchaseLineIdsTakenByOtherRows = useMemo(() => {
    const taken = new Set();
    (allGiftInventoryLines ?? []).forEach((row, i) => {
      if (i === index) return;
      const pid = row?.purchaseLineId;
      if (pid == null || String(pid).trim() === "") return;
      taken.add(String(pid));
    });
    return taken;
  }, [allGiftInventoryLines, index]);

  const purchaseLineOptionsForRow = useMemo(
    () =>
      categoryPurchaseLinesWithRemaining.filter(
        (r) =>
          !purchaseLineIdsTakenByOtherRows.has(String(r.id)) ||
          String(r.id) === String(selectedPurchaseLineId ?? ""),
      ),
    [
      categoryPurchaseLinesWithRemaining,
      purchaseLineIdsTakenByOtherRows,
      selectedPurchaseLineId,
    ],
  );

  const selectedPurchaseLineOption =
    categoryPurchaseLinesWithRemaining.find(
      (purchaseLine) => String(purchaseLine.id) === String(selectedPurchaseLineId ?? ""),
    ) ?? null;
  const selectedPurchaseLineLabel =
    !selectedPurchaseLineId || !selectedPurchaseLineOption
      ? ""
      : getPurchaseLineLabel(selectedPurchaseLineOption);
  const maxAllowedQuantity = Math.max(
    0,
    selectedPurchaseLineOption != null
      ? Number(selectedPurchaseLineOption.effectiveRemainingQuantity ?? 0)
      : initialUsedByPurchaseLineId[String(selectedPurchaseLineId ?? "")] || 0,
  );

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryLines(selectedCategory);
    }
  }, [loadCategoryLines, selectedCategory]);

  return (
    <TableRow
      key={fieldId}
      sx={{
        "& > .MuiTableCell-root": {
          borderBottom: "none",
          verticalAlign: "top",
        },
      }}
    >
      <TableCell
        align="center"
        sx={{
          width: "40px",
          pt: 0.8,
          pb: 0,
          pl: 0,
          pr: 1,
          color: "text.secondary",
        }}
      >
        {index + 1}
      </TableCell>
      <TableCell sx={{ width: "170px", pt: 0.8, pb: 0, px: 1 }}>
        <RHFAutocomplete
          name={`giftInventoryLines.${index}.category`}
          label="礼品类型"
          options={categoryOptions}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          rules={{ required: "请选择礼品类型" }}
          afterFieldValueChange={() => {
            setValue(`giftInventoryLines.${index}.purchaseLineId`, "");
            setValue(`giftInventoryLines.${index}.quantity`, "");
            setValue(`giftInventoryLines.${index}.unitPrice`, "");
          }}
          required={false}
        />
      </TableCell>

      <TableCell sx={{ width: "420px", pt: 0.8, pb: 0, px: 1 }}>
        {selectedCategory && (
          <RHFAutocomplete
            name={`giftInventoryLines.${index}.purchaseLineId`}
            label="采购明细"
            options={purchaseLineOptionsForRow}
            loading={Boolean(
              selectedCategory && loadingCategoryLines[selectedCategory],
            )}
            getOptionValue={(option) => option.id}
            getOptionLabel={getPurchaseLineLabel}
            rules={{ required: "请选择采购明细" }}
            afterFieldValueChange={(next) => {
              setValue(`giftInventoryLines.${index}.quantity`, "");
              const price =
                next != null && next.unitPrice != null && next.unitPrice !== ""
                  ? next.unitPrice
                  : "";
              setValue(`giftInventoryLines.${index}.unitPrice`, price);
            }}
            required={false}
          />
        )}
        {selectedPurchaseLineLabel && (
          <Typography
            variant="caption"
            sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
          >
            {selectedPurchaseLineLabel}
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ pt: 0.8, pb: 0, px: 1 }}>
        {selectedPurchaseLineId && (
          <RHFCellTextField
            name={`giftInventoryLines.${index}.quantity`}
            label="领用数量"
            type="number"
            rules={{
              required: "请输入领用数量",
              min: { value: 1, message: "数量至少为 1" },
              validate: (value) => {
                const quantity = Number(value);
                if (!Number.isFinite(quantity)) return "请输入有效数量";
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
            helperText={`可领用上限：${maxAllowedQuantity}`}
          />
        )}
      </TableCell>

      <TableCell
        align="center"
        sx={{ width: "64px", pt: 0.8, pb: 0, pl: 1, pr: 0 }}
      >
        <IconButton
          color="error"
          onClick={() => onRemove(index)}
          aria-label="删除领用物品"
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default function UsageItemLinesFieldArray({
  control,
  errors,
  clearErrors,
  initialUsedByPurchaseLineId = {},
  allowedCategories,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "giftInventoryLines",
  });
  const [purchaseLinesByCategory, setPurchaseLinesByCategory] = useState({});
  const [loadingByCategory, setLoadingByCategory] = useState({});
  const giftInventoryLines = useWatch({
    control,
    name: "giftInventoryLines",
  });

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
    });
    clearErrors("giftInventoryLines");
  };

  const handleRemove = (index) => {
    remove(index);
    clearErrors("giftInventoryLines");
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
      <TableContainer sx={{ mt: 0.5 }}>
        <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
          <TableBody>
            {fields.map((field, index) => (
              <GiftInventoryLineRow
                key={field.id}
                fieldId={field.id}
                index={index}
                onRemove={handleRemove}
                purchaseLinesByCategory={purchaseLinesByCategory}
                loadCategoryLines={loadCategoryLines}
                loadingCategoryLines={loadingByCategory}
                initialUsedByPurchaseLineId={initialUsedByPurchaseLineId}
                allGiftInventoryLines={giftInventoryLines}
                categoryOptions={categoryOptions}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
      {errors?.giftInventoryLines?.message && (
        <Alert sx={{ mt: 1 }} severity="error">
          {errors.giftInventoryLines.message}
        </Alert>
      )}
    </>
  );
}
