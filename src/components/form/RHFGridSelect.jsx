// src/components/form/RHFSelect.jsx
import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField, MenuItem, Tooltip, Box } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useFormMode } from "../../context/FormModeContext";

export default function RHFSelect({
  name,
  label,
  options,
  getOptionLabel = (opt) => opt.name ?? String(opt),
  getOptionValue = (opt) => opt.id ?? opt,
  xs = 12,
  sm = 6,
  isAdmin,
  rules = {},
  required = true,
  ...rest
}) {
  const { clearErrors, control } = useFormContext();
  const { isEditMode } = useFormMode();
  return (
    <Grid size={{ xs: xs, sm: sm }}>
      <Controller
        name={name}
        control={control}
        rules={
          required && !isEditMode ? { required: "不能为空", ...rules } : rules
        }
        render={({ field, fieldState: { error } }) => {
          return (
            <TextField
              {...field}
              disabled={isAdmin === false}
              value={field.value ?? ""}
              onChange={(e) => {
                field.onChange(e.target.value);
                if (error?.type === "server") clearErrors(name);
              }}
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
        }}
      />
    </Grid>
  );
}
