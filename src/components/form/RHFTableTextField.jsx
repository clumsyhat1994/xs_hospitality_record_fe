import { Controller, useFormContext } from "react-hook-form";
import { TableCell, TextField } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";
export default function RHFTableTextField({
  name,
  label,
  type = "text",
  rules = {},
  readOnly = false,
  required = true,
  ...rest
}) {
  const { clearErrors, control, getFieldState } = useFormContext();
  const { isEditMode } = useFormMode();
  return (
    <TableCell sx={{ pt: 2, pb: 1 }}>
      <Controller
        name={name}
        control={control}
        rules={
          required && !isEditMode ? { required: "不能为空", ...rules } : rules
        }
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            onChange={(e) => {
              field.onChange(e);
              if (getFieldState(name).error?.type === "server")
                clearErrors(name);
            }}
            fullWidth
            size="small"
            variant="outlined"
            label={label}
            type={type}
            error={!!error}
            helperText={error?.message}
            slotProps={{
              input: { readOnly },
              inputLabel: {
                shrink: type === "date" ? { shrink: true } : {},
              },
            }}
            {...rest}
          />
        )}
      />
    </TableCell>
  );
}
