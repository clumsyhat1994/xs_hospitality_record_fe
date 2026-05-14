import { Collapse, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import menuLables from "../../constants/moduleLables";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { GuardedListItemButton } from "../common/GuardedListItemButton";
import moduleTabKeys from "../../constants/moduleKeys";
import { APP_FOOTER_HEIGHT_PX } from "./AppFooter";

/** Fixed sidebar width — keep in sync with main content `marginLeft` in `MainPage`. */
export const APP_SIDEBAR_WIDTH_PX = 200;

export default function Sidebar({ onOpenModule }) {
  const [masterOpen, setMasterOpen] = useState(true);
  const { logout, user } = useAuth();
  const isAdmin = user?.isAdmin ?? false;

  const toggleMaster = () => {
    setMasterOpen((prev) => !prev);
  };
  const navigate = useNavigate();
  const handleLogout = async () => {
    //localStorage.removeItem("token");
    logout();
    navigate("/login");
  };

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: APP_FOOTER_HEIGHT_PX,
        width: APP_SIDEBAR_WIDTH_PX,
        zIndex: (theme) => theme.zIndex.appBar,
        borderRight: "1px solid #ddd",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <List>
          <ListItemButton
            onClick={() =>
              onOpenModule({
                key: moduleTabKeys.HOSPITALITY_RECORDS,
                label: menuLables.HOSPITALITY_RECORDS,
              })
            }
          >
            <ListItemText primary={menuLables.HOSPITALITY_RECORDS} />
          </ListItemButton>
          <GuardedListItemButton
            allowed={isAdmin}
            onClick={() =>
              onOpenModule({
                key: moduleTabKeys.PURCHASE_RECORDS,
                label: menuLables.PURCHASE_RECORDS,
              })
            }
          >
            <ListItemText primary={menuLables.PURCHASE_RECORDS} />
          </GuardedListItemButton>
          <GuardedListItemButton
            allowed={isAdmin}
            onClick={() =>
              onOpenModule({
                key: moduleTabKeys.USAGE_RECORDS,
                label: menuLables.USAGE_RECORDS,
              })
            }
          >
            <ListItemText primary={menuLables.USAGE_RECORDS} />
          </GuardedListItemButton>

          <GuardedListItemButton
            allowed={isAdmin}
            onClick={() =>
              onOpenModule({
                key: moduleTabKeys.INVOICE_CONFLICT,
                label: menuLables.INVOICE_CONFLICT,
              })
            }
          >
            <ListItemText primary={menuLables.INVOICE_CONFLICT} />
          </GuardedListItemButton>
          <GuardedListItemButton onClick={toggleMaster} allowed={isAdmin}>
            <ListItemText primary={menuLables.MASTER_DATA} />
            {masterOpen ? <ExpandLess /> : <ExpandMore />}
          </GuardedListItemButton>

          <Collapse in={masterOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <GuardedListItemButton
                allowed={isAdmin}
                onClick={() =>
                  onOpenModule({
                    key: moduleTabKeys.COUNTERPARTY,
                    label: menuLables.COUNTERPARTY,
                  })
                }
              >
                <ListItemText
                  primary={menuLables.COUNTERPARTY}
                  sx={{ pl: 2 }}
                />
              </GuardedListItemButton>
            </List>
          </Collapse>
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} color="error" />
          <ListItemText
            primary="退出登录"
            slotProps={{ primary: { sx: { color: "error.main" } } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
