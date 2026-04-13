import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";

/**
 * Select: yes | no, with a clear button that sets null.
 */
export default function ClearableBooleanSelect({
  label,
  value,
  onChange,
  yesLabel = "已上传",
  noLabel = "未上传",
}) {
  return (
    <TextField
      select
      label={label}
      fullWidth
      size="small"
      value={value == null ? "" : String(value)}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : v === "true");
      }}
      slotProps={{
        inputLabel: { shrink: true },
        input: {
          endAdornment:
            value == null ? null : (
              <InputAdornment position="end" sx={{ mr: 2 }}>
                <IconButton
                  size="small"
                  aria-label={`清除${label}筛选`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(null);
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
        },
      }}
    >
      <MenuItem value="" sx={{ display: "none" }} />
      <MenuItem value="true">{yesLabel}</MenuItem>
      <MenuItem value="false">{noLabel}</MenuItem>
    </TextField>
  );
}
