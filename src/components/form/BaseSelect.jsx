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
  const { isAdmin } = useAuth();

  return (
    <TextField
      {...field}
      disabled={isAdmin === false}
      value={field?.value ?? fieldValue ?? ""}
      //   onChange={(e) => {
      //     field.onChange(e.target.value);
      //     if (error?.type === "server") clearErrors();
      //   }}
      onChange={onChange}
      select
      fullWidth
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
