import { Controller, useFormContext } from "react-hook-form";
import BaseAsyncAutocomplete from "./BaseAsyncAutocomplete";

export default function RHFAsyncAutocomplete({
  name,
  label,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  options,
  setOptions,
  fetchOptions,
  isAdmin,
  rules = {},
  required = true,
  ...rest
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: "不能为空", ...rules } : rules}
      render={({ field, fieldState: { error } }) => {
        return (
          <BaseAsyncAutocomplete
            {...rest}
            label={label}
            fieldValue={field.value}
            onChange={field.onChange}
            error={error}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            options={options}
            setOptions={setOptions}
            fetchOptions={fetchOptions}
            isAdmin={isAdmin}
          />
        );
      }}
    />
  );
}
