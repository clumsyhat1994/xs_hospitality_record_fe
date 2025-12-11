import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AuthenticationPage from "./pages/Authentication";
import RequireAuth from "./routes/RequireAuth";
import "./App.css";
import HospitalityRecords from "./components/hospitality/HospitalityRecords";
import SequentialInvoiceNumber from "./components/invoice-conflict/SequentialInvoiceNumber";
import Counterparty from "./components/master_data/Counterparty";
import moduleRoutes from "./constants/moduleRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authentication" element={<AuthenticationPage />} />
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
          <Route path={moduleRoutes.COUNTERPARTY} element={<Counterparty />} />
          <Route path={moduleRoutes.DEPARTMENT} element={<Counterparty />} />
          <Route path={moduleRoutes.POSITION} element={<Counterparty />} />
          <Route path={moduleRoutes.GRADE} element={<Counterparty />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
