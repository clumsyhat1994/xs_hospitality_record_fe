import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AppFooter, { APP_FOOTER_HEIGHT_PX } from "./components/layout/AppFooter";

export default function AppShell() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          pb: `${APP_FOOTER_HEIGHT_PX}px`,
        }}
      >
        <Outlet />
      </Box>

      <AppFooter />
    </Box>
  );
}
