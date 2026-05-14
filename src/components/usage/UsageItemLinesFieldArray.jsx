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
import RHFCellTextField from "../form/RHFCellTextField";
import RHFAutocomplete from "../form/RHFAutocomplete";

const categoryOptions = [
  { value: "BEVERAGE", label: "酒水" },
  { value: "BUSINESS_GIFT", label: "商务礼品" },
  { value: "TEA", label: "茶叶" },
  { value: "FRUIT", label: "水果" },
];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateYearsAgo(baseDate, years) {
  const date = new Date(baseDate);
  date.setFullYear(date.getFullYear() - years);
  return date;
}

function getPurchaseRecordLabel(option) {
  return `${option?.productName ?? "-"} | 规格: ${
    option?.specification ?? "-"
  } | 采购日期: ${option?.purchaseDate ?? "-"} | 剩余: ${Math.max(
    0,
    Number(option?.effectiveRemainingQuantity ?? 0),
  )}`;
}

/**
 * API `remainingQuantity` is net of persisted usage; add back this usage's baseline so form totals don't double-count.
 */
function purchaseRemainingCeiling(record, initialAllocatedByPurchaseId) {
  if (!record?.id) return 0;
  const baseline =
    Number(initialAllocatedByPurchaseId[String(record.id)] ?? 0) || 0;
  return Number(record.remainingQuantity ?? 0) + baseline;
}

/** Purchases already saved on this usage (edit); backend inStockOnly omits remaining 0 unless these ids are passed. */
function buildIncludePurchaseIdsForUsage(initialAllocatedByPurchaseId) {
  return Object.keys(initialAllocatedByPurchaseId ?? {})
    .map((idStr) => Number(idStr))
    .filter((n) => Number.isFinite(n) && n > 0);
}

async function fetchEligiblePurchaseRecordsByCategory(
  category,
  includeIds = [],
) {
  const today = new Date();
  const twoYearsAgo = getDateYearsAgo(today, 2);

  const pageSize = 200;
  let page = 0;
  let categoryRecords = [];
  let totalElements = Infinity;

  const filters = {
    category,
    purchaseDateFrom: formatDate(twoYearsAgo),
    purchaseDateTo: formatDate(today),
    inStockOnly: true,
  };
  const listOptions =
    includeIds.length > 0 ? { includeIds } : {};

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

  return categoryRecords;
}

function GiftInventoryLineRow({
  fieldId,
  index,
  onRemove,
  purchaseRecords,
  loadCategoryRecords,
  loadingCategoryRecords,
  initialAllocatedByPurchaseId,
  allGiftInventoryLines,
}) {
  const { setValue } = useFormContext();
  const line = allGiftInventoryLines?.[index];
  const selectedCategory = line?.category;
  const selectedPurchaseId = line?.purchaseId;
  const categoryPurchaseRecords = selectedCategory
    ? (purchaseRecords[selectedCategory] ?? [])
    : [];
  // UI keeps each purchaseId on at most one row, so no cross-row draft totals on the same purchase.
  const categoryPurchaseRecordsWithRemaining = categoryPurchaseRecords.map(
    (record) => {
      const ceiling = purchaseRemainingCeiling(
        record,
        initialAllocatedByPurchaseId,
      );
      return {
        ...record,
        effectiveRemainingQuantity: Math.max(0, ceiling),
      };
    },
  );

  const purchaseIdsTakenByOtherRows = useMemo(() => {
    const taken = new Set();
    (allGiftInventoryLines ?? []).forEach((row, i) => {
      if (i === index) return;
      const pid = row?.purchaseId;
      if (pid == null || String(pid).trim() === "") return;
      taken.add(String(pid));
    });
    return taken;
  }, [allGiftInventoryLines, index]);

  /** Hide purchases already chosen on other rows; keep this row's selection so Autocomplete can resolve. */
  const purchaseOptionsForRow = useMemo(
    () =>
      categoryPurchaseRecordsWithRemaining.filter(
        (r) =>
          !purchaseIdsTakenByOtherRows.has(String(r.id)) ||
          String(r.id) === String(selectedPurchaseId ?? ""),
      ),
    [
      categoryPurchaseRecordsWithRemaining,
      purchaseIdsTakenByOtherRows,
      selectedPurchaseId,
    ],
  );

  /** Selected row from `options` — same object Autocomplete uses for labels. */
  const selectedPurchaseOption =
    categoryPurchaseRecordsWithRemaining.find(
      (record) => String(record.id) === String(selectedPurchaseId ?? ""),
    ) ?? null;
  const selectedPurchaseLabel =
    !selectedPurchaseId || !selectedPurchaseOption
      ? ""
      : getPurchaseRecordLabel(selectedPurchaseOption);
  // Enriched list is 1:1 map of raw list — option exists iff id is in category data.
  const maxAllowedQuantity = Math.max(
    0,
    selectedPurchaseOption != null
      ? Number(selectedPurchaseOption.effectiveRemainingQuantity ?? 0)
      : initialAllocatedByPurchaseId[String(selectedPurchaseId ?? "")] || 0,
  );

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryRecords(selectedCategory);
    }
  }, [loadCategoryRecords, selectedCategory]);

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
            setValue(`giftInventoryLines.${index}.purchaseId`, "");
            setValue(`giftInventoryLines.${index}.productName`, "");
            setValue(`giftInventoryLines.${index}.specification`, "");
            setValue(`giftInventoryLines.${index}.purchaseDate`, "");
            setValue(`giftInventoryLines.${index}.remainingQuantity`, null);
            setValue(`giftInventoryLines.${index}.quantity`, "");
          }}
          required={false}
        />
      </TableCell>

      <TableCell sx={{ width: "420px", pt: 0.8, pb: 0, px: 1 }}>
        {selectedCategory && (
          <RHFAutocomplete
            name={`giftInventoryLines.${index}.purchaseId`}
            label="采购记录"
            options={purchaseOptionsForRow}
            loading={Boolean(
              selectedCategory && loadingCategoryRecords[selectedCategory],
            )}
            getOptionValue={(option) => option.id}
            getOptionLabel={getPurchaseRecordLabel}
            rules={{ required: "请选择采购记录" }}
            afterFieldValueChange={(next) => {
              // Backend expects each line to provide either purchaseId OR productName (not both).
              // Since we select by purchaseId in this UI, keep productName empty.
              setValue(`giftInventoryLines.${index}.productName`, "");
              setValue(`giftInventoryLines.${index}.specification`, "");
              setValue(`giftInventoryLines.${index}.purchaseDate`, "");
              setValue(`giftInventoryLines.${index}.remainingQuantity`, null);
              setValue(`giftInventoryLines.${index}.quantity`, "");
            }}
            required={false}
          />
        )}
        {selectedPurchaseLabel && (
          <Typography
            variant="caption"
            sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
          >
            {selectedPurchaseLabel}
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ pt: 0.8, pb: 0, px: 1 }}>
        {selectedPurchaseId && (
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
  initialAllocatedByPurchaseId = {},
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "giftInventoryLines",
  });
  const [purchaseRecordsByCategory, setPurchaseRecordsByCategory] = useState(
    {},
  );
  const [loadingByCategory, setLoadingByCategory] = useState({});
  const giftInventoryLines = useWatch({
    control,
    name: "giftInventoryLines",
  });

  const handleAdd = () => {
    append({
      category: "",
      purchaseId: "",
      productName: "",
      specification: "",
      purchaseDate: "",
      remainingQuantity: null,
      quantity: "",
    });
    clearErrors("giftInventoryLines");
  };

  const handleRemove = (index) => {
    remove(index);
    clearErrors("giftInventoryLines");
  };

  const loadCategoryRecords = async (category) => {
    if (!category) return;
    if (purchaseRecordsByCategory[category]) return;
    if (loadingByCategory[category]) return;
    setLoadingByCategory((prev) => ({ ...prev, [category]: true }));
    try {
      const includeIds = buildIncludePurchaseIdsForUsage(
        initialAllocatedByPurchaseId,
      );
      const records = await fetchEligiblePurchaseRecordsByCategory(
        category,
        includeIds,
      );
      setPurchaseRecordsByCategory((prev) => ({
        ...prev,
        [category]: records,
      }));
    } catch (err) {
      console.error("加载可领用采购记录失败", err);
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
                purchaseRecords={purchaseRecordsByCategory}
                loadCategoryRecords={loadCategoryRecords}
                loadingCategoryRecords={loadingByCategory}
                initialAllocatedByPurchaseId={initialAllocatedByPurchaseId}
                allGiftInventoryLines={giftInventoryLines}
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
