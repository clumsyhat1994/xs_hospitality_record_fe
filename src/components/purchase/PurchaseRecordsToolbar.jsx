import {
  Toolbar,
  Grid,
  Stack,
  TextField,
  Button,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BaseSelect from "../form/BaseSelect";
import { useState } from "react";
import { purchaseButtonLabels as buttonLabels } from "../../constants/buttonLabels";

const categoryOptions = [
  { value: "", label: "全部类别" },
  { value: "BEVERAGE", label: "酒水" },
  { value: "BUSINESS_GIFT", label: "商务礼品" },
  { value: "TEA", label: "茶叶" },
  { value: "FRUIT", label: "水果" },
];

export default function PurchaseRecordsToolbar({
  draftFilters,
  onDraftFilterChange,
  onSearch,
  onClear,
  onCreatePurchase,
  onCreateUsage,
}) {
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

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
          <BaseSelect
            label="采购类别"
            options={categoryOptions}
            fieldValue={draftFilters.category}
            onChange={(e) => onDraftFilterChange("category", e.target.value)}
            getOptionLabel={(opt) => opt.label}
            getOptionValue={(opt) => opt.value}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            label="采购日期自"
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={draftFilters.purchaseDateFrom}
            onChange={(e) =>
              onDraftFilterChange("purchaseDateFrom", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            label="采购日期至"
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={draftFilters.purchaseDateTo}
            onChange={(e) =>
              onDraftFilterChange("purchaseDateTo", e.target.value)
            }
          />
        </Grid>
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
            {buttonLabels.advancedSearch}
          </Button>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack spacing={advancedSearchOpen ? 2 : 0}>
            <Collapse in={advancedSearchOpen} timeout={60} collapsedSize={0}>
              <Grid container spacing={2} sx={{ pt: 0 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    label="供应商（模糊）"
                    fullWidth
                    size="small"
                    value={draftFilters.supplierContains}
                    onChange={(e) =>
                      onDraftFilterChange("supplierContains", e.target.value)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    label="品名（模糊）"
                    fullWidth
                    size="small"
                    value={draftFilters.productNameContains}
                    onChange={(e) =>
                      onDraftFilterChange("productNameContains", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Collapse>
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
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onCreateUsage}
        >
          {buttonLabels.createUsageRecord}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreatePurchase}
        >
          {buttonLabels.createPurchaseRecord}
        </Button>
      </Stack>
    </Toolbar>
  );
}
