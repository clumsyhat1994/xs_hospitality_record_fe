import { Controller, useFormContext } from "react-hook-form";
import BaseAutocomplete from "./BaseAutocomplete";
import { useFormMode } from "../../context/FormModeContext";

export default function RHFAutocomplete({
  name,
  label,
  required = true,
  requireAdmin = false,
  options,
  loading = false,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  afterFieldValueChange,
  isOptionEqualToValue,
  textFieldProps,
  autocompleteProps,
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
          <BaseAutocomplete
            {...rest}
            label={label}
            requireAdmin={requireAdmin}
            fieldValue={field.value}
            onChange={field.onChange}
            afterFieldValueChange={afterFieldValueChange}
            error={error}
            loading={loading}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            options={options}
            textFieldProps={textFieldProps}
            autocompleteProps={autocompleteProps}
          />
        );
      }}
    />
  );
}
