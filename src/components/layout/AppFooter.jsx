import { Box, Typography } from "@mui/material";

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        height: 36,
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
