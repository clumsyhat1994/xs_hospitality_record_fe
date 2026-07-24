import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";

export default function RHFTextareaField({
  name,
  label,
  rules = {},
  required = false,
  minRows = 3,
  maxRows = 6,
  ...rest
}) {
  const { control, clearErrors } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: "不能为空", ...rules } : rules}
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
  );
}
