import { Autocomplete, TextField, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import masterDataApi from "../../api/masterDataApi";

export default function BaseComboBox({
  label,
  fieldValue,
  onChange,
  xs = 12,
  sm = 6,
  options,
  setOptions,
  fetchOptions,
  error,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  ...rest
}) {
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchOptions(keyword).then((res) => {
        setOptions(res.data ?? []);
      });
    }, 200);

    return () => clearTimeout(handle);
  }, [keyword, fetchOptions, setOptions]);

  return (
    <Grid size={{ xs: xs, sm: sm }}>
      <Autocomplete
        options={options ?? []}
        filterOptions={(x) => x} // no local filter, backend does it
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(opt, val) =>
          getOptionValue(opt) === getOptionValue(val)
        }
        value={options.find((o) => getOptionValue(o) === fieldValue) || null}
        onInputChange={(_, newInputValue) => {
          setKeyword(newInputValue);
        }}
        onChange={(_, newVal) => {
          onChange?.(newVal ? getOptionValue(newVal) : null);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label={label}
            error={!!error}
            helperText={error?.message}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        )}
        {...rest}
      />
    </Grid>
  );
}
