import { Autocomplete, TextField, Grid, Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState, useEffect, useRef } from "react";

export default function BaseComboBox({
  label,
  fieldValue,
  onChange,
  xs = 12,
  sm = 6,
  options,
  setOptions,
  fetchOptions,
  isAdmin,
  error,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  ...rest
}) {
  const [keyword, setKeyword] = useState("");
  const isFirstRender = useRef(true);
  useEffect(() => {
    const delay = isFirstRender.current ? 0 : 200;

    isFirstRender.current = false;

    const handle = setTimeout(() => {
      fetchOptions(keyword, fieldValue).then((res) => {
        setOptions(res.data ?? []);
      });
    }, delay);

    return () => clearTimeout(handle);
  }, [keyword, fetchOptions, setOptions, fieldValue]);

  return (
    <Grid size={{ xs: xs, sm: sm }}>
      <Autocomplete
        disabled={isAdmin === false}
        options={options ?? []}
        filterOptions={(x) => x} // no local filter, backend does it
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(opt, val) =>
          getOptionValue(opt) === getOptionValue(val)
        }
        value={
          options.find((o) => {
            return getOptionValue(o) === fieldValue;
          }) || null
        }
        onInputChange={(_, newInputValue, reason) => {
          if (reason === "input" || reason === "clear")
            setKeyword(newInputValue);
        }}
        onChange={(_, newVal) => {
          onChange?.(newVal ? getOptionValue(newVal) : null);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {label}
                {isAdmin === false && (
                  <Tooltip title="非管理员用户不能修改该字段">
                    <InfoOutlinedIcon
                      fontSize="small"
                      color="action"
                      sx={{ ml: 0.5 }}
                    />
                  </Tooltip>
                )}
              </Box>
            }
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
