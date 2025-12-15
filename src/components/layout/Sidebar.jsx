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

export default function Sidebar({ onOpenModule }) {
  const [masterOpen, setMasterOpen] = useState(true);
  const toggleMaster = () => {
    setMasterOpen((prev) => !prev);
  };
  const navigate = useNavigate();
  const handleLogout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 200,
        borderRight: "1px solid #ddd",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List>
          <ListItemButton
            onClick={() =>
              onOpenModule({
                key: "HOSPITALITY_RECORDS",
                label: menuLables.HOSPITALITY_RECORDS,
              })
            }
          >
            <ListItemText primary={menuLables.HOSPITALITY_RECORDS} />
          </ListItemButton>

          <ListItemButton
            onClick={() =>
              onOpenModule({
                key: "INVOICE_CONFLICT",
                label: menuLables.INVOICE_CONFLICT,
              })
            }
          >
            <ListItemText primary={menuLables.INVOICE_CONFLICT} />
          </ListItemButton>

          <ListItemButton onClick={toggleMaster}>
            <ListItemText primary={menuLables.MASTER_DATA} />
            {masterOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={masterOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                onClick={() =>
                  onOpenModule({
                    key: "DEPARTMENT",
                    label: menuLables.DEPARTMENT,
                  })
                }
              >
                <ListItemText primary={menuLables.DEPARTMENT} sx={{ pl: 2 }} />
              </ListItemButton>

              <ListItemButton
                onClick={() =>
                  onOpenModule({
                    key: "COUNTERPARTY",
                    label: menuLables.COUNTERPARTY,
                  })
                }
              >
                <ListItemText
                  primary={menuLables.COUNTERPARTY}
                  sx={{ pl: 2 }}
                />
              </ListItemButton>

              <ListItemButton
                onClick={() =>
                  onOpenModule({ key: "POSITION", label: menuLables.POSITION })
                }
              >
                <ListItemText primary={menuLables.POSITION} sx={{ pl: 2 }} />
              </ListItemButton>

              <ListItemButton
                onClick={() =>
                  onOpenModule({ key: "GRADE", label: menuLables.GRADE })
                }
              >
                <ListItemText primary={menuLables.GRADE} sx={{ pl: 2 }} />
              </ListItemButton>
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
