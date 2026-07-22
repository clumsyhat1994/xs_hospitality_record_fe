import { useEffect, useState } from "react";
import Sidebar, { APP_SIDEBAR_WIDTH_PX } from "../components/layout/Sidebar";
import TabArea from "../components/layout/TabArea";
import Box from "@mui/material/Box";
import { useLocation, useNavigate } from "react-router-dom";
import moduleRoutes from "../constants/moduleRoutes";
import routeToModule from "../constants/routeToModule";
import { isAdminOnlyModule } from "../constants/adminOnlyModuleKeys";
import { useAuth } from "../context/AuthProvider";

function resolveAccessibleModule(pathname, isAdmin) {
  const module = routeToModule[pathname] ?? null;
  if (!module) return null;
  if (isAdminOnlyModule(module.key) && !isAdmin) return null;
  return module;
}

export default function MainLayout() {
  const location = useLocation();
  const { isAdmin, loading: authLoading } = useAuth();
  const initialModule = resolveAccessibleModule(location.pathname, isAdmin);
  const [tabs, setTabs] = useState(() =>
    initialModule ? [initialModule] : [],
  );
  const [activeTab, setActiveTab] = useState(() => initialModule?.key ?? null);

  const navigate = useNavigate();

  const handleOpenModule = (module) => {
    if (isAdminOnlyModule(module.key) && !isAdmin) return;

    setTabs((prev) => {
      const exists = prev.some((t) => t.key === module.key);
      return exists ? prev : [...prev, module];
    });
    setActiveTab(module.key);
    const path = moduleRoutes[module.key];
    if (path) navigate(path);
  };

  const handleCloseTab = (tabKey) => {
    const index = tabs.findIndex((t) => t.key === tabKey);
    if (index === -1) return;

    const nextTabs = tabs.filter((t) => t.key !== tabKey);
    setTabs(nextTabs);

    if (activeTab !== tabKey) return;

    if (nextTabs.length === 0) {
      setActiveTab(null);
      return;
    }

    const nextTab = nextTabs[Math.min(index, nextTabs.length - 1)];
    setActiveTab(nextTab.key);
    navigate(moduleRoutes[nextTab.key]);
  };

  useEffect(() => {
    if (authLoading) return;

    const module = resolveAccessibleModule(location.pathname, isAdmin);
    if (!module) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTabs((prev) => {
      const exists = prev.some((t) => t.key === module.key);
      return exists ? prev : [...prev, module];
    });

    setActiveTab((prev) => (prev === module.key ? prev : module.key));
  }, [location.pathname, isAdmin, authLoading]);

  return (
    <Box sx={{ display: "flex", flex: 1 }}>
      <Sidebar onOpenModule={handleOpenModule} />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 2,
          ml: `${APP_SIDEBAR_WIDTH_PX}px`,
        }}
      >
        <TabArea
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCloseTab={handleCloseTab}
        />
      </Box>
    </Box>
  );
}
