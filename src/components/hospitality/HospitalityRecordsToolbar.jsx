import {
  Toolbar,
  Typography,
  Stack,
  Button,
  TextField,
  Grid,
  Tooltip,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import BaseComboBox from "../form/BaseComboBox";
import { useMasterData } from "../../context/MasterDataContext";
import masterDataApi from "../../api/masterDataApi";
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import fieldLabels from "../../constants/recordFieldLabels";
import BaseSelect from "../form/BaseSelect";
import BaseAutocomplete from "../form/BaseAutocomplete";
export default function HospitalityRecordsToolbar({
  selectedCount,
  onCreate,
  onBatchDelete,
  draftFilters,
  onDraftFilterChange,
  onSearch,
  onClear,
  onExport,
}) {
  const {
    counterparties,
    setCounterparties,
    handlers,
    setHandlers,
    departments,
    hospitalityTypes,
  } = useMasterData();

  const { isAdmin } = useAuth();
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  // console.log("draftFilters", draftFilters);
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
        <Grid size={{ xs: 6, sm: 1.5 }}>
          <TextField
            label="接待日期自"
            type="date"
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={draftFilters.receptionDateFrom}
            onChange={(e) =>
              onDraftFilterChange("receptionDateFrom", e.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 1.5 }}>
          <TextField
            label="接待日期至"
            type="date"
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={draftFilters.receptionDateTo}
            onChange={(e) =>
              onDraftFilterChange("receptionDateTo", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2.5 }}>
          <TextField
            label="发票号范围起始"
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={draftFilters.invoiceNumberFrom}
            onChange={(e) =>
              onDraftFilterChange("invoiceNumberFrom", e.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2.5 }}>
          <TextField
            label="发票号范围结束"
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={draftFilters.invoiceNumberTo}
            onChange={(e) =>
              onDraftFilterChange("invoiceNumberTo", e.target.value)
            }
          />
        </Grid>

        <BaseComboBox
          label={fieldLabels.handlerName}
          xs={6}
          sm={2}
          fieldValue={draftFilters.handlerId}
          onChange={(v) => {
            onDraftFilterChange("handlerId", v);
          }}
          options={handlers}
          setOptions={setHandlers}
          fetchOptions={masterDataApi.searchHandlers}
        />

        <Grid
          size={{ xs: 6, sm: "auto" }}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Button
            variant="text"
            size="small"
            onClick={() => setAdvancedSearchOpen((v) => !v)}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: advancedSearchOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.1s ease-out",
                }}
              />
            }
          >
            高级搜索
          </Button>
        </Grid>

        {/* One grid row: advanced Collapse + search buttons — avoids double container gap when collapsed */}
        <Grid size={{ xs: 12 }}>
          <Stack spacing={advancedSearchOpen ? 2 : 0}>
            <Collapse in={advancedSearchOpen} timeout={60} collapsedSize={0}>
              <Grid container spacing={2} sx={{ pt: 0 }}>
                <BaseComboBox
                  label={fieldLabels.counterparty}
                  xs={8}
                  sm={4}
                  fieldValue={draftFilters.counterpartyId}
                  onChange={(v) => {
                    onDraftFilterChange("counterpartyId", v);
                  }}
                  options={counterparties}
                  setOptions={setCounterparties}
                  fetchOptions={masterDataApi.searchCounterParties}
                />

                {isAdmin && (
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
                )}

                <Grid size={{ xs: 6, sm: 2 }}>
                  <BaseAutocomplete
                    label={fieldLabels.hospitalityType}
                    fieldValue={draftFilters.hospitalityTypeId}
                    onChange={(v) => {
                      onDraftFilterChange("hospitalityTypeId", v);
                    }}
                    options={hospitalityTypes}
                  />
                </Grid>
              </Grid>
            </Collapse>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ alignItems: "center" }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
              >
                查询
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={onClear}
              >
                重置
              </Button>
            </Stack>
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          新建记录
        </Button>
        <Tooltip
          title="导出当前筛选结果为Excel文件"
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
