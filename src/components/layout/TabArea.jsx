import { Tabs, Tab, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";
import { MasterDataProvider } from "../../context/MasterDataContext";
import { useEffect, useRef } from "react";
import routeToModule from "../../constants/routeToModule";

export default function TabArea({ tabs, activeTab, setActiveTab, onCloseTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastUrlByTab = useRef({});

  useEffect(() => {
    const activeTabKey = routeToModule[location.pathname]?.key;
    if (!activeTabKey) return;
    lastUrlByTab.current[activeTabKey] = location.pathname + location.search;
  }, [location.pathname, location.search]);

  // 2) When user clicks a tab, navigate to its last remembered URL (or base)
  const handleTabChange = (e, tabKey) => {
    setActiveTab(tabKey);
    navigate(lastUrlByTab.current[tabKey] ?? moduleRoutes[tabKey]);
  };

  const handleCloseTab = (e, tabKey) => {
    e.stopPropagation();
    delete lastUrlByTab.current[tabKey];
    onCloseTab(tabKey);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <Tabs
        value={activeTab} //which tab is currently selected
        onChange={handleTabChange}
        aria-label="module tabs" //for accessibility
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {tab.label}
                <IconButton
                  component="span"
                  size="small"
                  aria-label={`关闭 ${tab.label}`}
                  onClick={(e) => handleCloseTab(e, tab.key)}
                  sx={{ p: 0.25, ml: 0.5 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>
      <MasterDataProvider>
        <Outlet />
      </MasterDataProvider>
    </>
  );
}
