import { Controller } from "react-hook-form";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";

export default function RHFMultiAutocomplete({
  name,
  control,
  label,
  options,
  disabled,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  rules = {},
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: "不能为空", ...rules }}
      defaultValue={[]}
      render={({ field, fieldState }) => {
        const selectedObjects = options.filter((o) =>
          field.value?.includes(getOptionValue(o))
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
