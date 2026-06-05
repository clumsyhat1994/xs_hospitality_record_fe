// src/components/master-data/MasterDataToolbar.jsx
import {
  Toolbar,
  Typography,
  Stack,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { masterDataButtonLabels as buttonLabels } from "../../constants/buttonLabels";

export default function MasterDataToolbar({
  title,
  searchPlaceholder = "按名称搜索",
  searchLabel = "名称",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onCreate,
  onExport,
  extraActions,
  extraFilters,
  searchSx,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit?.();
    }
  };

  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        {extraFilters}
        <TextField
          sx={{ padding: 0, flexShrink: 0, ...searchSx }}
          size="small"
          label={searchLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          {buttonLabels.create}
        </Button>
        {extraActions}
        <Tooltip
          title={`导出所有${title}为Excel`}
          slotProps={{
            tooltip: {
              sx: {
                maxWidth: "200px",
                width: "auto",
                fontSize: "0.8rem",
                padding: "12px 16px",
              },
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
          >
            {buttonLabels.exportExcel}
          </Button>
        </Tooltip>
      </Stack>
    </Toolbar>
  );
}
