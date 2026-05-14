import { Box, MenuItem, TextField, Tooltip } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useFormMode } from "../../context/FormModeContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAuth } from "../../context/AuthProvider";
export default function BaseSelect({
  label,
  onChange,
  field,
  fieldValue,
  error,
  options,
  getOptionLabel = (opt) => opt.name ?? String(opt),
  getOptionValue = (opt) => opt.id ?? opt,
  ...rest
}) {

  return (
    <TextField
      {...field}
      value={field?.value ?? fieldValue ?? ""}
      onChange={onChange}
      select
      fullWidth
      size="small"
      label={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {label}
        </Box>
      }
      error={!!error}
      helperText={error?.message}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        select: {
          sx: { width: "100%" },
        },
      }}
      {...rest}
    >
      {options.map((opt) => {
        const value = getOptionValue(opt);
        const text = getOptionLabel(opt);

        return (
          <MenuItem key={value} value={value}>
            {text}
          </MenuItem>
        );
      })}
    </TextField>
  );
}
