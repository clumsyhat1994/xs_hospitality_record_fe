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
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

export default function MasterDataToolbar({
  title,
  searchPlaceholder = "按名称搜索",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onCreate,
  onExport,
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
        <TextField
          sx={{ padding: 0 }}
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={onSearchSubmit}
        >
          搜索
        </Button> */}

        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          新建
        </Button>

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
            导出 Excel
          </Button>
        </Tooltip>
      </Stack>
    </Toolbar>
  );
}
