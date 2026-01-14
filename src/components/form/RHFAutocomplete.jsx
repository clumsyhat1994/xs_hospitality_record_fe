import { Controller, useFormContext } from "react-hook-form";
import BaseComboBox from "./BaseComboBox";
import BaseAutocomplete from "./BaseAutocomplete";
import { Grid } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";

export default function RHFAutocomplete({
  name,
  label,
  required = true,
  options,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  xs,
  sm,
  rules = {},
  ...rest
}) {
  const { control } = useFormContext();
  const { isEditMode } = useFormMode();
  return (
    <Controller
      name={name}
      control={control}
      rules={
        required && !isEditMode ? { required: "不能为空", ...rules } : rules
      }
      render={({ field, fieldState: { error } }) => {
        return (
          <Grid size={{ xs: xs, sm: sm }}>
            <BaseAutocomplete
              {...rest}
              label={label}
              xs={xs}
              sm={sm}
              fieldValue={field.value}
              onChange={field.onChange}
              error={error}
              getOptionLabel={getOptionLabel}
              getOptionValue={getOptionValue}
              options={options}
            />
          </Grid>
        );
      }}
    />
  );
}
