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
import { FormProvider, useForm } from "react-hook-form";
import RHFTextField from "../form/RHFTextField";
import RHFComboBox from "../form/RHFComboBox";
import RHFAutocomplete from "../form/RHFAutocomplete";
import RHFTextareaField from "../form/RHFTextareaField";
import { FormModeProvider } from "../../context/FormModeContext";
import { useMasterData } from "../../context/MasterDataContext";
import masterDataApi from "../../api/masterDataApi";
import usageRecordApi from "../../api/usageRecordApi";
import { toNullableNumber } from "../../utils/numberUtils";
import { UsageRecordBEErrorFieldToFEFormFieldMap } from "../../constants/BEErrorFieldToFEFormFieldMap";
import { validationMessages } from "../../constants/validationMessages";
import { initialUsedByPurchaseLineIdFromUsageLines } from "../../utils/giftUsageLineFormUtils";
import UsageItemLinesFieldArray from "./UsageItemLinesFieldArray";

function toDialogDefaultValues(record) {
  if (!record) {
    return {
      usageDate: "",
      departmentId: null,
      counterpartyId: null,
      recipientId: null,
      remark: "",
      giftInventoryLines: [],
    };
  }
  return {
    usageDate: record.usageDate ?? "",
    departmentId: record.departmentId ?? null,
    counterpartyId: record.counterpartyId ?? null,
    recipientId: record.recipientId ?? null,
    remark: record.remark ?? "",
    giftInventoryLines: (record.usageLines ?? [])
      .filter(Boolean)
      .map((a) => ({
        category: a.category ?? "",
        purchaseLineId: a.purchaseLineId,
        quantity: a.quantity,
        unitPrice: a.unitPrice != null && a.unitPrice !== "" ? a.unitPrice : "",
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
      initialUsedByPurchaseLineIdFromUsageLines(
        editingRecord?.usageLines,
      ),
    [editingRecord],
  );
  const [submitError, setSubmitError] = useState("");
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
    formState: { isSubmitting, errors },
  } = methods;

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
    reset(toDialogDefaultValues(editingRecord));
  }, [open, reset, editingRecord]);

  const submit = async (data) => {
    setSubmitError("");

    const payload = {
      ...data,
      giftInventoryLines: data.giftInventoryLines.map((line) => ({
        purchaseLineId: toNullableNumber(line?.purchaseLineId, { integer: true }),
        quantity: toNullableNumber(line?.quantity, { integer: true }),
      })),
    };

    try {
      if (isEditMode) {
        await usageRecordApi.update(editingRecord.id, payload);
      } else {
        if (!payload.giftInventoryLines?.length) {
          setError("giftInventoryLines", {
            type: "manual",
            message: "至少添加一条领用物品",
          });
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

      setSubmitError(err?.response?.data?.message ?? "保存失败，请稍后重试");
    }
  };

  return (
    <FormModeProvider isEditMode={isEditMode}>
      <FormProvider {...methods}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle>
            {isEditMode ? "编辑领用记录" : "新建领用记录"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="usageDate" label="领用日期" type="date" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFAutocomplete
                  name="departmentId"
                  label="领用部门"
                  options={departments ?? []}
                  getOptionLabel={(opt) => opt?.name ?? ""}
                />
              </Grid>
              <RHFComboBox
                name="counterpartyId"
                label="招待对象"
                options={customers ?? []}
                setOptions={setCustomers}
                fetchOptions={masterDataApi.searchCustomers}
              />
              <RHFComboBox
                name="recipientId"
                label="领用人"
                options={handlers ?? []}
                setOptions={setHandlers}
                fetchOptions={masterDataApi.searchHandlers}
              />
              <RHFTextareaField
                name="remark"
                label="备注"
                required={false}
                rules={{
                  maxLength: { value: 2000, message: "备注最多 2000 字" },
                }}
              />
            </Grid>
            <UsageItemLinesFieldArray
              control={control}
              errors={errors}
              clearErrors={clearErrors}
              initialUsedByPurchaseLineId={initialUsedByPurchaseLineId}
            />
          </DialogContent>
          <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", px: 3, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
              <Button onClick={onClose}>取消</Button>
              <Button
                variant="contained"
                disabled={isSubmitting}
                onClick={handleSubmit(submit)}
              >
                {isSubmitting ? "保存中..." : isEditMode ? "更新" : "保存"}
              </Button>
            </Box>
            {submitError ? (
              <Alert severity="error" sx={{ width: "100%" }}>
                {submitError}
              </Alert>
            ) : null}
          </DialogActions>
        </Dialog>
      </FormProvider>
    </FormModeProvider>
  );
}
