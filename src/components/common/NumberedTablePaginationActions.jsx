import { useEffect, useState } from "react";
import {
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/**
 * Drop-in replacement for MUI TablePaginationActions: numbered pages, first/last, and 前往 jump field.
 * Pass as TablePagination `ActionsComponent={NumberedPaginationActions}` — props are injected by TablePagination.
 */
export function NumberedPaginationActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
  disabled,
}) {
  const pageCount = Math.max(1, Math.ceil(count / rowsPerPage));
  const [pageInput, setPageInput] = useState(String(page + 1));

  useEffect(() => {
    setPageInput(String(page + 1));
  }, [page]);

  // Strip non-digits (typing/paste); cap length so the field cannot exceed digits needed for the last page.
  const handlePageInputChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const maxLen = Math.max(1, String(pageCount).length);
    setPageInput(digitsOnly.slice(0, maxLen));
  };

  const applyGoToPage = () => {
    const trimmed = pageInput.trim();
    if (trimmed === "") {
      setPageInput(String(page + 1));
      return;
    }
    const n = parseInt(trimmed, 10);
    if (Number.isNaN(n)) {
      setPageInput(String(page + 1));
      return;
    }
    const clamped = Math.min(Math.max(1, n), pageCount);
    setPageInput(String(clamped));
    if (clamped - 1 !== page) {
      onPageChange(null, clamped - 1);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        flexShrink: 0,
        minWidth: 0,
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Pagination
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => onPageChange(event, value - 1)}
        color="primary"
        size="small"
        showFirstButton
        showLastButton
        siblingCount={2}
        boundaryCount={1}
        disabled={disabled}
        sx={{
          flexShrink: 0,
          "& .MuiPagination-ul": {
            flexWrap: "nowrap",
          },
        }}
      />
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ flexShrink: 0, paddingRight: 1.5 }}
      >
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ whiteSpace: "nowrap" }}
        >
          前往
        </Typography>
        {/* type="text": avoid number input spinners / e-notation; digits-only via handlePageInputChange */}
        <TextField
          size="small"
          value={pageInput}
          onChange={handlePageInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyGoToPage();
            }
          }}
          onBlur={applyGoToPage}
          disabled={disabled}
          placeholder="页码"
          sx={{ width: 60 }}
          type="text"
          autoComplete="off"
          slotProps={{
            htmlInput: {
              "aria-label": "跳转到页码",
              inputMode: "numeric",
              pattern: "[0-9]*",
            },
          }}
        />
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ whiteSpace: "nowrap" }}
        >
          / {pageCount} 页
        </Typography>
      </Stack>
    </Stack>
  );
}
