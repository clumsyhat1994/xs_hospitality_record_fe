import { Collapse } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { useState } from "react";
import menuLables from "../../constants/moduleLables";

export default function Sidebar({ onOpenModule }) {
  const [masterOpen, setMasterOpen] = useState(true);
  const toggleMaster = () => {
    setMasterOpen((prev) => !prev);
  };
  return (
    <Box sx={{ width: 250, borderRight: "1px solid #ddd" }}>
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
              <ListItemText primary={menuLables.COUNTERPARTY} sx={{ pl: 2 }} />
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
                onOpenModule({ key: "grade", label: menuLables.GRADE })
              }
            >
              <ListItemText primary={menuLables.GRADE} sx={{ pl: 2 }} />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );
}
