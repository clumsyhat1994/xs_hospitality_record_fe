import {
  Toolbar,
  Typography,
  Stack,
  Button,
  TextField,
  Grid,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import BaseComboBox from "../form/BaseComboBox";
import { useMasterData } from "../../context/MasterDataContext";
import masterDataApi from "../../api/masterDataApi";
import { useCallback } from "react";
import { useAuth } from "../../context/AuthProvider";
import fieldLabels from "../../constants/recordFieldLabels";
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
  const { counterparties, setCounterparties } = useMasterData();
  const fetchCounterparties = useCallback(
    (keyword) => masterDataApi.searchCounterParties(keyword),
    []
  );
  const { isAdmin } = useAuth();

  const { departments, setDepartments } = useMasterData();
  const fetchDepartments = useCallback(
    (keyword) => masterDataApi.searchDepartments(keyword),
    []
  );
  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        //gap: 2,
      }}
    >
      <Grid container spacing={2} pt={3}>
        <Grid>
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

        <Grid>
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
        <Grid size={{ xs: 6, sm: 3 }}>
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

        <Grid size={{ xs: 6, sm: 3 }}>
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
          label={fieldLabels.counterparty}
          xs={8}
          sm={4}
          fieldValue={draftFilters.counterpartyId}
          onChange={(v) => {
            onDraftFilterChange("counterpartyId", v);
          }}
          options={counterparties}
          setOptions={setCounterparties}
          fetchOptions={fetchCounterparties}
        />
        {/* 
        <BaseComboBox
          label={fieldLabels.handlerName}
          xs={8}
          sm={4}
          fieldValue={draftFilters.handlerName}
          onChange={(v) => {
            onDraftFilterChange("handlerName", v);
          }}
          options={}
          setOptions={}
          fetchOptions={}
        /> */}

        {isAdmin && (
          <BaseComboBox
            label={fieldLabels.department}
            xs={6}
            sm={3}
            getOptionValue={(opt) => opt.code ?? opt}
            fieldValue={draftFilters.departmentCode}
            onChange={(v) => {
              onDraftFilterChange("departmentCode", v);
            }}
            options={departments}
            setOptions={setDepartments}
            fetchOptions={fetchDepartments}
          />
        )}

        <Grid sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          新建记录
        </Button>
        <Tooltip
          title="导出当前筛选结果(不考虑勾选框)为Excel文件"
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
        {/* DO NOT DELETE!!!
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={selectedCount === 0}
          onClick={onBatchDelete}
        >
          Batch Delete
        </Button> */}
      </Stack>
    </Toolbar>
  );
}
