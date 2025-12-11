import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TabArea from "../components/layout/TabArea";
import Box from "@mui/material/Box";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import menuLables from "../constants/moduleLables";
import moduleRoutes from "../constants/moduleRoutes";

export default function MainLayout() {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;

  const navigate = useNavigate();

  const handleOpenModule = (module) => {
    const path = moduleRoutes[module.key];
    if (!tabs.find((t) => t.key === module.key)) {
      setTabs([...tabs, module]);
    }
    setActiveTab(module.key);
    if (path) navigate(path);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar onOpenModule={handleOpenModule} />
      <Box sx={{ flexGrow: 1, p: 2, width: "80%" }}>
        <TabArea
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </Box>
    </Box>
  );
}
