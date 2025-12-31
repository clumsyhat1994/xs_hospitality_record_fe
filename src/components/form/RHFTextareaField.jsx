import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";

export default function RHFTextareaField({
  name,
  label,
  xs = 12,
  sm = 12,
  rules = {},
  required = false,
  minRows = 3,
  maxRows = 6,
  ...rest
}) {
  const { control, clearErrors } = useFormContext();
  const { isEditMode } = useFormMode();

  return (
    <Grid size={{ xs, sm }}>
      <Controller
        name={name}
        control={control}
        rules={
          required && !isEditMode ? { required: "不能为空", ...rules } : rules
        }
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            onChange={(e) => {
              field.onChange(e.target.value);
              if (error?.type === "server") clearErrors(name);
            }}
            fullWidth
            size="small"
            label={label}
            multiline
            minRows={minRows}
            maxRows={maxRows}
            error={!!error}
            helperText={error?.message}
            {...rest}
          />
        )}
      />
    </Grid>
  );
}
