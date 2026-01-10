import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";
export default function RHFTextField({
  name,
  label,
  type = "text",
  xs = 12,
  sm = 6,
  rules = {},
  required = true,
  numericOnly = false,
  chineseOnly = false,
  minWidth = 0,
  ...rest
}) {
  const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const DIGIT_REGEX = /^\d*$/;
  const CHINESE_REGEX = /^[\u4E00-\u9FFF·・]*$/;
  const { clearErrors, control } = useFormContext();
  const { isEditMode } = useFormMode();

  return (
    <Grid size={{ xs: xs, sm: sm }} sx={{ minWidth }}>
      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && !isEditMode ? { required: "不能为空" } : {}),
          ...(required && !isEditMode
            ? {
                validate: (v) => v?.trim() !== "" || "不能为空",
              }
            : {}),
          ...rules,
          ...(chineseOnly
            ? {
                validate: (v) => {
                  const s = (v ?? "").trim();
                  if (s === "") return true;
                  return CHINESE_REGEX.test(s) || "只能输入中文（可含·/・）";
                },
              }
            : {}),
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (type === "date" && v !== "" && !ISO_DATE_REGEX.test(v))
                return;
              if (numericOnly && !DIGIT_REGEX.test(v)) return;

              field.onChange(v);
              if (error?.type === "server") clearErrors(name);
            }}
            fullWidth
            size="small"
            label={label}
            type={type}
            error={!!error}
            helperText={error?.message}
            slotProps={{
              inputLabel: {
                shrink: type === "date" ? { shrink: true } : {},
              },
            }}
            {...rest}
          />
        )}
      />
    </Grid>
  );
}
