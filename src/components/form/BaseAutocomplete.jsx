import { Autocomplete, Box, TextField, Tooltip } from "@mui/material";
import { useAuth } from "../../context/AuthProvider";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
export default function BaseAutocomplete({
  onChange,
  fieldStateError,
  label,
  options = [],

  fieldValue,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
}) {
  const { isAdmin } = useAuth();
  return (
    <Autocomplete
      options={options ?? []}
      value={
        options.find((o) => {
          return getOptionValue(o) === fieldValue;
        }) || null
      }
      isOptionEqualToValue={(opt, val) =>
        getOptionValue(opt) === getOptionValue(val)
      }
      getOptionLabel={(o) => getOptionLabel(o)}
      onChange={(_, newVal) => {
        onChange?.(newVal ? getOptionValue(newVal) : null);
      }}
      disabled={isAdmin === false}
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
          error={!!fieldStateError}
          helperText={fieldStateError?.message}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      )}
    />
  );
}
