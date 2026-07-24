import { Controller } from "react-hook-form";
import { Autocomplete, TextField } from "@mui/material";

export default function RHFMultiAutocomplete({
  name,
  control,
  label,
  options,
  disabled,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  rules = {},
  required = true,
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: "不能为空", ...rules } : rules}
      defaultValue={[]}
      render={({ field, fieldState }) => {
        const selectedObjects = options.filter((o) =>
          field.value?.includes(getOptionValue(o)),
        );

        return (
          <Autocomplete
            multiple
            options={options}
            value={selectedObjects}
            isOptionEqualToValue={(opt, val) =>
              getOptionValue(opt) === getOptionValue(val)
            }
            getOptionLabel={(o) => getOptionLabel(o)}
            onChange={(_, newSelectedObjects) => {
              field.onChange(newSelectedObjects.map((o) => getOptionValue(o)));
            }}
            disabled={disabled}
            slotProps={{
              chip: {
                size: "small",
                color: "primary",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={label}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        );
      }}
    />
  );
}
