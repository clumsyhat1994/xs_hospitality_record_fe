import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Alert,
} from "@mui/material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import RHFTextField from "../form/RHFTextField";
import RHFAsyncAutocomplete from "../form/RHFAsyncAutocomplete";
import RHFAutocomplete from "../form/RHFAutocomplete";
import RHFTextareaField from "../form/RHFTextareaField";
import { useMasterData } from "../../context/MasterDataContext";
import masterDataApi from "../../api/masterDataApi";
import usageRecordApi from "../../api/usageRecordApi";
import { toNullableNumber } from "../../utils/numberUtils";
import { UsageRecordBEErrorFieldToFEFormFieldMap } from "../../constants/BEErrorFieldToFEFormFieldMap";
import { validationMessages } from "../../constants/validationMessages";
import { usageRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";
import { GIFT_PURCHASE_CATEGORIES } from "../../constants/giftPurchaseCategories";
import { initialUsedByPurchaseLineIdFromReceiptLines } from "../../utils/giftReceiptLineFormUtils";
import { notifyFormValidationBlocked } from "../../utils/formValidationUtils";
import UsageItemLinesFieldArray from "./UsageItemLinesFieldArray";

const usageRecordCategoryOptions = [
  //GIFT_PURCHASE_CATEGORIES.BEVERAGE,
  GIFT_PURCHASE_CATEGORIES.BUSINESS_GIFT,
  GIFT_PURCHASE_CATEGORIES.TEA,
  GIFT_PURCHASE_CATEGORIES.FRUIT,
];

function toDialogDefaultValues(record) {
  if (!record) {
    return {
      usageDate: "",
      departmentId: null,
      counterpartyId: null,
      remark: "",
      giftReceiptLines: [],
    };
  }
  return {
    usageDate: record.usageDate ?? "",
    departmentId: record.departmentId ?? null,
    counterpartyId: record.counterpartyId ?? null,
    remark: record.remark ?? "",
    giftReceiptLines: (record.receiptLines ?? [])
      .filter(Boolean)
      .map((a) => ({
        category: a.category ?? "",
        purchaseLineId: a.purchaseLineId,
        quantity: a.quantity,
        unitPrice: a.unitPrice != null && a.unitPrice !== "" ? a.unitPrice : "",
        recipientId: a.recipientId ?? null,
        receiptDate: a.receiptDate ?? "",
      })),
  };
}

export default function UsageRecordDialog({
  open,
  onClose,
  onSave,
  editingRecord = null,
}) {
  const isEditMode = !!editingRecord?.id;
  const initialUsedByPurchaseLineId = useMemo(
    () =>
      initialUsedByPurchaseLineIdFromReceiptLines(
        editingRecord?.receiptLines,
      ),
    [editingRecord],
  );
  const [submitError, setSubmitError] = useState("");
  const [validationHint, setValidationHint] = useState("");
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: toDialogDefaultValues(editingRecord),
  });
  const {
    reset,
    control,
    handleSubmit,
    setError,
    clearErrors,
    getFieldState,
    formState: { isSubmitting, errors },
  } = methods;
  const usageDate = useWatch({ control, name: "usageDate" });

  const {
    departments,
    customers,
    setCustomers,
    handlers,
    setHandlers,
  } = useMasterData();

  useEffect(() => {
    if (!open) return;
    setSubmitError("");
    setValidationHint("");
    reset(toDialogDefaultValues(editingRecord));
  }, [open, reset, editingRecord]);

  const onValidationFailed = (formErrors) => {
    notifyFormValidationBlocked(formErrors, setValidationHint);
  };

  const submit = async (data) => {
    setSubmitError("");
    setValidationHint("");

    const payload = {
      ...data,
      giftReceiptLines: data.giftReceiptLines.map((line) => ({
        purchaseLineId: toNullableNumber(line?.purchaseLineId, { integer: true }),
        quantity: toNullableNumber(line?.quantity, { integer: true }),
        recipientId: toNullableNumber(line?.recipientId, { integer: true }),
        receiptDate: line?.receiptDate || null,
      })),
    };

    try {
      if (isEditMode) {
        await usageRecordApi.update(editingRecord.id, payload);
      } else {
        if (!payload.giftReceiptLines?.length) {
          const message = "至少添加一条领用物品";
          setError("giftReceiptLines", {
            type: "manual",
            message,
          });
          notifyFormValidationBlocked(
            { giftReceiptLines: { message } },
            setValidationHint,
          );
          return;
        }
        await usageRecordApi.create(payload);
      }
      onSave();
    } catch (err) {
      const serverErrors = err?.response?.data;

      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const globalMessages = [];

        serverErrors.forEach((e) => {
          const rawField = typeof e?.field === "string" ? e.field : "";
          // Backend may return array paths like giftInventoryLines[0].quantity,
          // while react-hook-form setError expects dot paths (giftInventoryLines.0.quantity).
          const normalizedPath = rawField.replace(/\[(\d+)\]/g, ".$1");
          const mappedField = UsageRecordBEErrorFieldToFEFormFieldMap[normalizedPath];
          const fieldName =
            mappedField ?? (normalizedPath && !normalizedPath.includes(".") ? normalizedPath : "");
          const message = validationMessages[e?.code] ?? e?.message ?? "提交失败";

          if (fieldName) {
            const fieldState = getFieldState(fieldName);
            const existingErrorMessage = fieldState.error
              ? `${fieldState.error.message}\n`
              : "";
            setError(fieldName, {
              type: "server",
              message: existingErrorMessage + message,
            });
          } else {
            globalMessages.push(message);
          }
        });

        if (globalMessages.length > 0) {
          setSubmitError(globalMessages.join("；"));
        }
        notifyFormValidationBlocked(methods.formState.errors, setValidationHint);
        return;
      }

      setSubmitError(err?.response?.data?.message ?? "保存失败，请稍后重试");
    }
  };

  return (
    <FormProvider {...methods}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {isEditMode ? "编辑领用记录" : "新建领用记录"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="usageDate" label={fieldLabels.usageDate} type="date" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFAutocomplete
                name="departmentId"
                label="领用部门"
                options={departments ?? []}
                getOptionLabel={(opt) => opt?.name ?? ""}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFAsyncAutocomplete
                name="counterpartyId"
                label="招待对象"
                options={customers ?? []}
                setOptions={setCustomers}
                fetchOptions={masterDataApi.searchCustomers}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <RHFTextareaField
                name="remark"
                label="备注"
                required={false}
                rules={{
                  maxLength: { value: 2000, message: "备注最多 2000 字" },
                }}
              />
            </Grid>
          </Grid>
          <UsageItemLinesFieldArray
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            initialUsedByPurchaseLineId={initialUsedByPurchaseLineId}
            allowedCategories={usageRecordCategoryOptions}
            handlers={handlers}
            setHandlers={setHandlers}
            defaultReceiptDate={usageDate ?? ""}
          />
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", px: 3, pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
            <Button onClick={onClose}>取消</Button>
            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit(submit, onValidationFailed)}
            >
              {isSubmitting ? "保存中..." : isEditMode ? "更新" : "保存"}
            </Button>
          </Box>
          {validationHint ? (
            <Alert severity="warning" sx={{ width: "100%" }}>
              {validationHint}
            </Alert>
          ) : null}
          {submitError ? (
            <Alert severity="error" sx={{ width: "100%" }}>
              {submitError}
            </Alert>
          ) : null}
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
