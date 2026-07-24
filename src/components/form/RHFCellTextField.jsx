import { Controller, useFormContext } from "react-hook-form";
import { TextField, Tooltip } from "@mui/material";

export default function RHFCellTextField({
  name,
  label,
  type = "text",
  rules = {},
  readOnly = false,
  required = true,
  maxLength,
  helperText: helperTextProp,
  ...rest
}) {
  const { clearErrors, control, getFieldState } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: "不能为空", ...rules } : rules}
      render={({ field, fieldState: { error } }) => {
        const textField = (
          <TextField
            {...field}
            onChange={(e) => {
              field.onChange(e);
              if (getFieldState(name).error?.type === "server") clearErrors(name);
            }}
            fullWidth
            size="small"
            variant="outlined"
            label={label}
            type={type}
            error={!!error}
            helperText={error?.message ?? helperTextProp}
            slotProps={{
              input: { readOnly },
              inputLabel: {
                shrink: type === "date" ? { shrink: true } : {},
              },
            }}
            {...rest}
          />
        );
        if (!readOnly) return textField;
        return (
          <Tooltip title="自动计算，不可录入。" placement="top" arrow>
            <span style={{ display: "block" }}>{textField}</span>
          </Tooltip>
        );
      }}
    />
  );
}
