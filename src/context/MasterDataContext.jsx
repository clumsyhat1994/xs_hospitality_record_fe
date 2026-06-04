import { createContext, useContext, useState, useEffect } from "react";
import masterDataApi from "../api/masterDataApi";

const MasterDataContext = createContext({
  counterparties: [],
  setCounterparties: () => {},
  customers: [],
  setCustomers: () => {},
  suppliers: [],
  setSuppliers: () => {},
  departments: [],
  setDepartments: () => {},
  hospitalityTypes: [],
  setHospitalityTypes: () => {},
  positions: [],
  setPositions: () => {},
  ourHostPositions: [],
  setOurHostPositions: () => {},
  counterpartyTypes: [],
  setCounterpartyTypes: () => {},
  counterpartyRoles: [],
  setCounterpartyRoles: () => {},
  handlers: [],
  setHandlers: () => {},
});

export function MasterDataProvider({ children }) {
  const [counterparties, setCounterparties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitalityTypes, setHospitalityTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [ourHostPositions, setOurHostPositions] = useState([]);
  const [counterpartyTypes, setCounterpartyTypes] = useState([]);
  const [counterpartyRoles, setCounterpartyRoles] = useState([]);
  const [handlers, setHandlers] = useState([]);
  useEffect(() => {
    Promise.all([
      masterDataApi.searchDepartments(),
      masterDataApi.searchHospitalityTypes(),
      masterDataApi.searchCounterParties(),
      masterDataApi.searchCustomers(),
      masterDataApi.searchSuppliers(),
      masterDataApi.searchPositions(),
      masterDataApi.searchCounterpartyTypes(),
      masterDataApi.searchCounterpartyRoles(),
      masterDataApi.searchHandlers(),
    ])
      .then(([dep, types, cp, cust, supp, pos, cpt, cpr, hdr]) => {
        setDepartments(dep.data || []);
        setHospitalityTypes(types.data || []);
        setCounterparties(cp.data || []);
        setCustomers(cust.data || []);
        setSuppliers(supp.data || []);
        setPositions(pos.data || []);
        setOurHostPositions(pos.data || []);
        setCounterpartyTypes(cpt.data || []);
        setCounterpartyRoles(cpr.data || []);
        setHandlers(hdr.data || []);
      })
      .catch((err) => {
        console.error("Failed to load master data", err);
      });
  }, []);

  return (
    <MasterDataContext.Provider
      value={{
        counterparties,
        setCounterparties,
        customers,
        setCustomers,
        suppliers,
        setSuppliers,
        departments,
        setDepartments,
        hospitalityTypes,
        setHospitalityTypes,
        positions,
        setPositions,
        ourHostPositions,
        setOurHostPositions,
        counterpartyTypes,
        setCounterpartyTypes,
        counterpartyRoles,
        setCounterpartyRoles,
        handlers,
        setHandlers,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMasterData() {
  return useContext(MasterDataContext);
}
