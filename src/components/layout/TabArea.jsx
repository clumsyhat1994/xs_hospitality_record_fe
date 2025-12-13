import { Tabs, Tab, Box } from "@mui/material";

import { Outlet, useNavigate } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";

export default function TabArea({ tabs, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  return (
    <Box>
      <Tabs
        value={activeTab} //which tab is currently selected
        onChange={(e, v) => {
          setActiveTab(v);
          navigate(moduleRoutes[v]);
        }}
        aria-label="module tabs" //for accessibility
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} value={tab.key} />
        ))}
      </Tabs>
      <Outlet />
      {/* <Box sx={{ mt: 2 }}>{activeTab && componentMap[activeTab]}</Box> */}
    </Box>
  );
}
