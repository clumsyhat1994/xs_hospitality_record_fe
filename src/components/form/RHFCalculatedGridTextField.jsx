import { useEffect } from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Grid, TextField, Tooltip } from "@mui/material";

export default function RHFCalculatedField({
  name,
  label,
  xs = 12,
  sm = 6,
  computeValue,
}) {
  const { control, setValue } = useFormContext();
  const allValues = useWatch({ control });
  const value = computeValue(allValues);

  useEffect(() => {
    if (!name) return;
    setValue(name, value, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [name, value, setValue]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState: { error } }) => (
        <Grid size={{ xs: xs, sm: sm }}>
          <Tooltip title="自动计算，不可录入。" placement="top" arrow>
            <TextField
              label={label}
              size="small"
              value={value ?? ""}
              fullWidth
              error={!!error}
              helperText={error?.message}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </Tooltip>
        </Grid>
      )}
    />
  );
}
