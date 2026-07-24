// src/components/master-data/CounterpartyDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import RHFTextField from "../form/RHFTextField";
import RHFMultiAutocomplete from "../form/RHFMultiAutocomplete";

export default function MasterDataDialog({
  open,
  initialValues,
  onClose,
  save,
  onSaveSuccess,
  width = 720,
  createTitle = "新建",
  editTitle = "编辑",
  textFields = [],
  multiAutoCompleteFields = [],
}) {
  const form = useForm({
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  const isEditMode = initialValues?.id != null;

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

  const onSubmit = async (data) => {
    try {
      await save(data);
      await onSaveSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        setError(data?.field, { type: "server", message: data?.detail });
      }
    }
  };

  return (
    <FormProvider {...form}>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width },
          },
        }}
        maxWidth="sm"
      >
        <DialogTitle>{isEditMode ? editTitle : createTitle}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2} pt={1}>
            {textFields.map((field) => (
              <Grid key={field.fieldName} size={{ xs: 12, sm: field.sm ?? 6 }}>
                <RHFTextField
                  name={field.fieldName}
                  control={control}
                  label={field.label}
                  chineseOnly={field.chineseOnly}
                  required={field.required !== false}
                />
              </Grid>
            ))}
            {multiAutoCompleteFields.map((field) => (
              <Grid key={field.fieldName} size={{ sm: field.sm ?? 6 }}>
                <RHFMultiAutocomplete
                  name={field.fieldName}
                  control={control}
                  label={field.label}
                  options={field.options}
                  getOptionLabel={field.getOptionLabel}
                  required={field.required !== false}
                  rules={field.rules}
                  sm={field.sm ?? 6}
                />
              </Grid>
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
