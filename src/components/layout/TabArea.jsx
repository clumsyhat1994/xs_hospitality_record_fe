import { Tabs, Tab, Box } from "@mui/material";
import HospitalityRecords from "../hospitality/HospitalityRecords";
import Department from "../master_data/Department";
import Counterparty from "../master_data/Counterparty";
import Position from "../master_data/Position";
import Grade from "../master_data/Grade";
import { MasterDataProvider } from "../../context/MasterDataContext";
import SequentialInvoiceNumber from "../invoice-conflict/SequentialInvoiceNumber";
import { Outlet, useNavigate } from "react-router-dom";
import moduleRoutes from "../../constants/moduleRoutes";

// const componentMap = {
//   records: <HospitalityRecords />,
//   department: <Department />,
//   counterparty: <Counterparty />,
//   position: <Position />,
//   grade: <Grade />,
//   invoice_conflicts: <SequentialInvoiceNumber />,
// };

export default function TabArea({ tabs, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  return (
    <Box>
      <Tabs
        value={activeTab} //which tab is currently selected
        onChange={(e, v) => {
          console.log(v);
          console.log(moduleRoutes[v.key]);
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
