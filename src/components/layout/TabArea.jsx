import { Tabs, Tab, Box } from "@mui/material";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";
import { MasterDataProvider } from "../../context/MasterDataContext";
import AppFooter from "./AppFooter";
import { useEffect, useRef } from "react";
import routeToModule from "../../constants/routeToModule";

export default function TabArea({ tabs, activeTab, setActiveTab }) {
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

  return (
    <>
      <Tabs
        value={activeTab} //which tab is currently selected
        onChange={handleTabChange}
        aria-label="module tabs" //for accessibility
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} value={tab.key} />
        ))}
      </Tabs>
      <MasterDataProvider>
        <Outlet />
      </MasterDataProvider>
    </>
  );
}
