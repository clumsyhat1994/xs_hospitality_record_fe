import { createContext, useContext, useState, useEffect } from "react";
import masterDataApi from "../api/masterDataApi";

const MasterDataContext = createContext({
  counterparties: [],
  setCounterparties: () => {},
  departments: [],
  setDepartments: () => {},
  hospitalityTypes: [],
  setHospitalityTypes: () => {},
  positions: [],
  setPositions: () => {},
  ourHostPositions: [],
  setOurHostPositions: () => {},
  theirHostPositions: [],
  setTheirHostPositions: () => {},
});

export function MasterDataProvider({ children }) {
  const [counterparties, setCounterparties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitalityTypes, setHospitalityTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [ourHostPositions, setOurHostPositions] = useState([]);
  const [theirHostPositions, setTheirHostPositions] = useState([]);
  const [counterpartyTypes, setCounterpartyTypes] = useState([]);
  useEffect(() => {
    Promise.all([
      masterDataApi.searchDepartments(),
      //masterDataApi.listDepartments(),
      masterDataApi.searchHospitalityTypes(),
      //masterDataApi.listHospitalityTypes(),
      masterDataApi.searchCounterParties(),
      //masterDataApi.listCounterParties(),
      masterDataApi.searchPositions(),
      //masterDataApi.listPositions(),
      masterDataApi.searchCounterpartyTypes(),
    ])
      .then(([dep, types, cp, pos, cpt]) => {
        // setDepartments(dep.data?.content || []);
        //setHospitalityTypes(types.data?.content || []);
        // setCounterparties(cp.data?.content || []);
        // setPositions(pos.data?.content || []);
        setDepartments(dep.data || []);
        setHospitalityTypes(types.data || []);
        setCounterparties(cp.data || []);
        setPositions(pos.data || []);
        setOurHostPositions(pos.data || []);
        setTheirHostPositions(pos.data || []);
        setCounterpartyTypes(cpt.data || []);
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
        setDepartments,
        hospitalityTypes,
        setHospitalityTypes,
        positions,
        setPositions,
        ourHostPositions,
        setOurHostPositions,
        theirHostPositions,
        setTheirHostPositions,
        counterpartyTypes,
        setCounterpartyTypes,
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
