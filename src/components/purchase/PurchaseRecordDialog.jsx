import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import RHFTextField from "../form/RHFTextField";
import RHFSelect from "../form/RHFSelect";
import { FormModeProvider } from "../../context/FormModeContext";
import purchaseRecordApi from "../../api/purchaseRecordApi";
import { toNullableNumber } from "../../utils/numberUtils";
import { purchaseRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";

const categoryOptions = [
  { value: "", label: "请选择类别" },
  { value: "BEVERAGE", label: "酒水" },
  { value: "BUSINESS_GIFT", label: "商务礼品" },
  { value: "TEA", label: "茶叶" },
  { value: "FRUIT", label: "水果" },
];

function cleanPayload(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "")
  );
}

export default function PurchaseRecordDialog({
  open,
  initialValues,
  isEditMode,
  onClose,
  onSave,
}) {
  const methods = useForm({
    defaultValues: initialValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!open) return;
    reset(initialValues);
  }, [open, initialValues, reset]);

  const submit = async (data) => {
    const normalized = {
      ...data,
      unitPrice: toNullableNumber(data.unitPrice),
      purchasedQuantity: toNullableNumber(data.purchasedQuantity, { integer: true }),
    };
    const payload = cleanPayload(normalized);
    if (isEditMode) {
      await purchaseRecordApi.update(initialValues.id, payload);
    } else {
      await purchaseRecordApi.create(payload);
    }
    onSave();
  };

  return (
    <FormModeProvider isEditMode={isEditMode}>
      <FormProvider {...methods}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle>{isEditMode ? "修改采购记录" : "新建采购记录"}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <RHFSelect
                name="category"
                label={fieldLabels.purchaseCategory}
                options={categoryOptions}
                getOptionLabel={(opt) => opt.label}
                getOptionValue={(opt) => opt.value}
              />
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
                <RHFTextField name="supplier" label={fieldLabels.supplier} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="productName" label={fieldLabels.productName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="specification" label={fieldLabels.specification} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="unitPrice" label={fieldLabels.unitPrice} type="number" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="purchasedQuantity"
                  label={fieldLabels.purchasedQuantity}
                  type="number"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>取消</Button>
            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit(submit)}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    </FormModeProvider>
  );
}
