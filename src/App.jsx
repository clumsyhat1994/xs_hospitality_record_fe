import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AuthenticationPage from "./pages/Authentication";
import RequireAuth from "./routes/RequireAuth";
import "./App.css";
import HospitalityRecords from "./components/hospitality/HospitalityRecords";
import SequentialInvoiceNumber from "./components/invoice-conflict/SequentialInvoiceNumber";
import CounterpartyPage from "./components/master-data/CounterpartyPage";
import moduleRoutes from "./constants/moduleRoutes";
//import Department from "./components/master_data/Department";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthenticationPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainPage />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="records" replace />} />

          <Route
            path={moduleRoutes.HOSPITALITY_RECORDS}
            element={<HospitalityRecords />}
          />
          <Route
            path={moduleRoutes.INVOICE_CONFLICT}
            element={<SequentialInvoiceNumber />}
          />
          <Route
            path={moduleRoutes.COUNTERPARTY}
            element={<CounterpartyPage />}
          />
          {/* <Route path={moduleRoutes.DEPARTMENT} element={<Department />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
