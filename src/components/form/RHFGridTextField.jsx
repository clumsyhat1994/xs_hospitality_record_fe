import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";
export default function RHFTextField({
  name,
  label,
  type = "text",
  xs = 12,
  sm = 6,
  rules = {},
  ...rest
}) {
  const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const { clearErrors, control } = useFormContext();
  const { isEditMode } = useFormMode();

  return (
    <Grid size={{ xs: xs, sm: sm }}>
      <Controller
        name={name}
        control={control}
        rules={
          isEditMode === false ? { required: "不能为空", ...rules } : rules
        }
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              console.log(v);
              if (type === "date" && !ISO_DATE_REGEX.test(v)) {
                return;
              }
              field.onChange(v);
              if (error?.type === "server") clearErrors(name);
            }}
            fullWidth
            size="small"
            label={label}
            type={type}
            error={!!error}
            helperText={error?.message}
            slotProps={{
              inputLabel: {
                shrink: type === "date" ? { shrink: true } : {},
              },
            }}
            {...rest}
          />
        )}
      />
    </Grid>
  );
}
