import { createContext, useContext, useState, useEffect } from "react";
import masterDataApi from "../api/masterDataApi";

const MasterDataContext = createContext({
  counterparties: [],
  setCounterparties: () => {},
  departments: [],
  //setDepartments: () => {},
  hospitalityTypes: [],
  //setHospitalityTypes: () => {},
  positions: [],
  //setPositions: () => {},
});

export function MasterDataProvider({ children }) {
  const [counterparties, setCounterparties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitalityTypes, setHospitalityTypes] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    Promise.all([
      masterDataApi.listDepartments(),
      masterDataApi.listHospitalityTypes(),
      masterDataApi.listCounterParties(),
      masterDataApi.listPositions(),
    ])
      .then(([dep, types, cp, pos]) => {
        setDepartments(dep.data?.content || []);
        setHospitalityTypes(types.data?.content || []);
        setCounterparties(cp.data?.content || []);
        setPositions(pos.data?.content || []);
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
        departments,
        hospitalityTypes,
        positions,
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
