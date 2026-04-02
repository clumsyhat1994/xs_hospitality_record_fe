import { Box, Typography } from "@mui/material";

/** Fixed footer height — keep in sync with `AppShell` bottom padding. */
export const APP_FOOTER_HEIGHT_PX = 36;

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        height: APP_FOOTER_HEIGHT_PX,
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "text.secondary",
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="caption">
        © {new Date().getFullYear()} - 工程技术部 - 曾轩
      </Typography>
    </Box>
  );
}
