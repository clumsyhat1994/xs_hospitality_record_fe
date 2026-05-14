import { Toolbar, Grid, Stack, TextField, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import BaseSelect from "../form/BaseSelect";
import { useMasterData } from "../../context/MasterDataContext";
import BaseAutocomplete from "../form/BaseAutocomplete";
import { hospitalityRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";
import { usageButtonLabels as buttonLabels } from "../../constants/buttonLabels";

const standaloneOptions = [
  { value: "", label: "全部记录" },
  { value: "true", label: "仅独立领用" },
];

export default function UsageRecordsToolbar({
  draftFilters,
  onDraftFilterChange,
  onSearch,
  onClear,
  onCreateUsage,
}) {
  const { departments } = useMasterData();

  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <Grid container spacing={2} pt={3} sx={{ flex: 1, minWidth: 0 }}>
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            label="领用日期自"
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={draftFilters.usageDateFrom}
            onChange={(e) =>
              onDraftFilterChange("usageDateFrom", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            label="领用日期至"
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={draftFilters.usageDateTo}
            onChange={(e) => onDraftFilterChange("usageDateTo", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <BaseAutocomplete
            label={fieldLabels.department}
            getOptionValue={(opt) => opt.code ?? opt}
            fieldValue={draftFilters.departmentCode}
            onChange={(v) => {
              onDraftFilterChange("departmentCode", v);
            }}
            options={departments}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <BaseSelect
            label="记录类型"
            options={standaloneOptions}
            fieldValue={draftFilters.standaloneOnly}
            onChange={(e) =>
              onDraftFilterChange("standaloneOnly", e.target.value)
            }
            getOptionLabel={(opt) => opt.label}
            getOptionValue={(opt) => opt.value}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onSearch}
            >
              {buttonLabels.search}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onClear}
            >
              {buttonLabels.reset}
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          alignSelf: "flex-start",
          pt: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateUsage}
        >
          {buttonLabels.createUsageRecord}
        </Button>
      </Stack>
    </Toolbar>
  );
}
