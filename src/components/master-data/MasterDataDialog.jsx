// src/components/master-data/CounterpartyDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import RHFTextField from "../form/RHFGridTextField";

export default function MasterDataDialog({
  open,
  initialValues,
  onClose,
  onSave,
  textFields,
}) {
  const form = useForm({
    defaultValues: initialValues,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

  const onSubmit = async (data) => {
    await onSave(data);
  };

  return (
    <FormProvider {...form}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {initialValues?.id == null ? "新建往来单位" : "编辑往来单位"}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2} pt={1}>
            {textFields.map((field) => (
              <RHFTextField
                key={field.fieldName}
                name={field.fieldName}
                control={control}
                label={field.label}
                sm={6}
              />
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isSubmitting}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
