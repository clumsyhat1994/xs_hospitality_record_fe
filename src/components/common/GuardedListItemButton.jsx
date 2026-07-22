import { Tooltip, ListItemButton, ListItemText, Snackbar } from "@mui/material";
import { useState } from "react";

export function GuardedListItemButton({
  allowed,
  tooltip = "办公室说不给你看这个模块 : (",
  onClick,
  children,
  ...props
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip
        arrow
        placement="right"
        title={allowed ? "" : tooltip}
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: "200px",
              width: "auto",
              fontSize: "0.8rem",
              padding: "8px 6px",
            },
          },
        }}
        disableHoverListener={allowed}
      >
        <span style={{ display: "block", width: "100%" }}>
          <ListItemButton
            {...props}
            disabled={!allowed}
            onClick={(e) => {
              if (!allowed) {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
                return;
              }
              onClick?.(e);
            }}
          >
            {children}
          </ListItemButton>
        </span>
      </Tooltip>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        message={tooltip}
      />
    </>
  );
}
