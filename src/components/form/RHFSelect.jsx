import { Controller, useFormContext } from "react-hook-form";
import { Grid } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";
import BaseSelect from "./BaseSelect";

export default function RHFSelect({
  name,
  label,
  options,
  onChange,
  getOptionLabel = (opt) => opt.name ?? String(opt),
  getOptionValue = (opt) => opt.id ?? opt,
  xs = 12,
  sm = 6,
  rules = {},
  required = true,
  ...rest
}) {
  const { clearErrors, control } = useFormContext();
  const { isEditMode } = useFormMode();

  return (
    <Grid size={{ xs, sm }}>
      <Controller
        name={name}
        control={control}
        rules={required && !isEditMode ? { required: "不能为空", ...rules } : rules}
        render={({ field, fieldState: { error } }) => (
          <BaseSelect
            label={label}
            options={options}
            field={field}
            onChange={
              onChange ??
              ((e) => {
                field.onChange(e.target.value);
                if (error?.type === "server") clearErrors();
              })
            }
            error={error}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            {...rest}
          />
        )}
      />
    </Grid>
  );
}
