import TablePagination from "@mui/material/TablePagination";
import { NumberedPaginationActions } from "./NumberedTablePaginationActions";
import { tablePaginationToolbarSx } from "./tablePaginationToolbarSx";

/**
 * TablePagination with app-standard numbered pages + 前往 jump field and toolbar layout.
 * Forwards all other props to MUI TablePagination.
 */
export function NumberedTablePagination({ sx, ...props }) {
  const mergedSx =
    sx == null
      ? tablePaginationToolbarSx
      : Array.isArray(sx)
        ? [tablePaginationToolbarSx, ...sx]
        : [tablePaginationToolbarSx, sx];

  return (
    <TablePagination
      component="div"
      ActionsComponent={NumberedPaginationActions}
      sx={mergedSx}
      {...props}
    />
  );
}
