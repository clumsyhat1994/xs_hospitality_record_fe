import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TabArea from "../components/layout/TabArea";
import Box from "@mui/material/Box";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import menuLables from "../constants/moduleLables";
import moduleRoutes from "../constants/moduleRoutes";
import routeToModule from "../constants/routeToModule";

export default function MainLayout() {
  const location = useLocation();
  const initialModule = routeToModule[location.pathname] ?? null;
  const [tabs, setTabs] = useState(() =>
    initialModule ? [initialModule] : []
  );
  const [activeTab, setActiveTab] = useState(() => initialModule?.key ?? null);

  const currentPath = location.pathname;

  const navigate = useNavigate();

  const handleOpenModule = (module) => {
    const path = moduleRoutes[module.key];

    if (path) navigate(path);
  };

  // useEffect(() => {
  //   const module = routeToModule[location.pathname];
  //   if (module) {
  //     setTabs((prev) => {
  //       const exists = prev.some((t) => t.key === module.key);

  //       return exists ? prev : [...prev, module];
  //     });
  //     setActiveTab(module.key);
  //   }
  // }, [location.pathname]);

  useEffect(() => {
    const module = routeToModule[location.pathname];
    if (!module) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTabs((prev) => {
      const exists = prev.some((t) => t.key === module.key);
      return exists ? prev : [...prev, module];
    });

    setActiveTab((prev) => (prev === module.key ? prev : module.key));
  }, [location.pathname]);

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
