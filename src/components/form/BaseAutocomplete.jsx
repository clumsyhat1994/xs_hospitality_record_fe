import { Autocomplete, Box, TextField, Tooltip } from "@mui/material";
import { useAuth } from "../../context/AuthProvider";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
export default function BaseAutocomplete({
  onChange,
  error: fieldStateError,
  label,
  options = [],
  requireAdmin = false,
  fieldValue,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  loading = false,
  afterFieldValueChange,
  isOptionEqualToValue,
  textFieldProps = {},
  autocompleteProps = {},
}) {
  const { isAdmin } = useAuth();

  return (
    <Autocomplete
      options={options ?? []}
      loading={loading}
      value={
        options.find((o) => {
          return String(getOptionValue(o)) === String(fieldValue ?? "");
        }) || null
      }
      isOptionEqualToValue={
        isOptionEqualToValue ??
        ((opt, val) => String(getOptionValue(opt)) === String(getOptionValue(val)))
      }
      getOptionLabel={(o) => getOptionLabel(o)}
      onChange={(_, newVal) => {
        const nextValue = newVal ? getOptionValue(newVal) : "";
        onChange?.(nextValue);
        afterFieldValueChange?.(newVal, nextValue);
      }}
      disabled={requireAdmin === true && isAdmin === false}
      {...autocompleteProps}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {label}
              {requireAdmin === true && isAdmin === false && (
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
          error={!!fieldStateError}
          helperText={fieldStateError?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          {...textFieldProps}
        />
      )}
    />
  );
}
