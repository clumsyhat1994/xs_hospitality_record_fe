import { useEffect, useState } from "react";
import masterDataApi from "../../api/masterDataApi";
import { useMasterData } from "../../context/MasterDataContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import RHFTextField from "../form/RHFTextField";
import RHFSelect from "../form/RHFSelect";
import RHFAsyncAutocomplete from "../form/RHFAsyncAutocomplete";
import purchaseRecordApi from "../../api/purchaseRecordApi";
import { toNullableNumber } from "../../utils/numberUtils";
import { purchaseRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";
import { GIFT_PURCHASE_CATEGORY_OPTIONS } from "../../constants/giftPurchaseCategories";
import { validationMessages } from "../../constants/validationMessages";
import { getBackendErrorMessage } from "../../utils/errorUtils";
import PurchaseLinesFieldArray from "./PurchaseLinesFieldArray";

const categoryOptions = [
  { value: "", label: "请选择类别" },
  ...GIFT_PURCHASE_CATEGORY_OPTIONS,
];

function cleanPayload(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "")
  );
}

function normalizeLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return [
      {
        id: null,
        productName: "",
        specification: "",
        unitPrice: null,
        purchasedQuantity: null,
      },
    ];
  }
  return lines.map((line) => ({
    id: line?.id ?? null,
    productName: line?.productName ?? "",
    specification: line?.specification ?? "",
    unitPrice: line?.unitPrice ?? null,
    purchasedQuantity: line?.purchasedQuantity ?? null,
  }));
}

export default function PurchaseRecordDialog({
  open,
  initialValues,
  isEditMode,
  onClose,
  onSave,
}) {
  const methods = useForm({
    defaultValues: {
      ...initialValues,
      lines: normalizeLines(initialValues?.lines),
    },
  });

  const {
    reset,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const [submitError, setSubmitError] = useState("");
  const { suppliers, setSuppliers } = useMasterData();

  useEffect(() => {
    if (!open) return;
    setSubmitError("");
    reset({
      ...initialValues,
      lines: normalizeLines(initialValues?.lines),
    });
  }, [open, initialValues, reset]);

  const submit = async (data) => {
    setSubmitError("");
    clearErrors();

    const lines = (data.lines ?? []).map((line) => {
      const normalized = {
        productName: line.productName?.trim(),
        specification: line.specification?.trim(),
        unitPrice: toNullableNumber(line.unitPrice),
        purchasedQuantity: toNullableNumber(line.purchasedQuantity, { integer: true }),
      };
      if (line.id) {
        return { id: line.id, ...normalized };
      }
      return normalized;
    });

    const payload = cleanPayload({
      ...data,
      lines,
    });

    try {
      if (isEditMode) {
        await purchaseRecordApi.update(initialValues.id, payload);
      } else {
        await purchaseRecordApi.create(payload);
      }
      onSave();
    } catch (err) {
      const serverErrors = err?.response?.data;

      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const globalMessages = [];

        serverErrors.forEach((e) => {
          const fieldName = typeof e?.field === "string" ? e.field : "";
          const message = validationMessages[e?.code] ?? e?.message ?? "提交失败";

          if (fieldName) {
            setError(fieldName, { type: "server", message });
          } else {
            globalMessages.push(message);
          }
        });

        if (globalMessages.length > 0) {
          setSubmitError(globalMessages.join("；"));
        }
        return;
      }

      setSubmitError(getBackendErrorMessage(err, "保存失败，请稍后重试"));
    }
  };

  return (
    <FormProvider {...methods}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{isEditMode ? "修改采购记录" : "新建采购记录"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFSelect
                name="category"
                label={fieldLabels.purchaseCategory}
                options={categoryOptions}
                getOptionLabel={(opt) => opt.label}
                getOptionValue={(opt) => opt.value}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField
                name="applicationDate"
                label={fieldLabels.applicationDate}
                type="date"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="purchaseDate" label={fieldLabels.purchaseDate} type="date" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="invoiceDate" label={fieldLabels.invoiceDate} type="date" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="invoiceNumber" label={fieldLabels.invoiceNumberString} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFAsyncAutocomplete
                name="supplierId"
                label={fieldLabels.supplier}
                options={suppliers}
                setOptions={setSuppliers}
                fetchOptions={masterDataApi.searchSuppliers}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                采购明细
              </Typography>
              <PurchaseLinesFieldArray />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", px: 3, pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
            <Button onClick={onClose}>取消</Button>
            <Button variant="contained" disabled={isSubmitting} onClick={handleSubmit(submit)}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </Box>
          {submitError ? (
            <Alert severity="error" sx={{ width: "100%", whiteSpace: "pre-line" }}>
              {submitError}
            </Alert>
          ) : null}
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
