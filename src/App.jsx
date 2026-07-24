import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AuthenticationPage from "./pages/Authentication";
import RequireAuth from "./routes/RequireAuth";
import RequireAdmin from "./routes/RequireAdmin";
import "./App.css";
import HospitalityRecords from "./components/hospitality/HospitalityRecords";
import PurchaseRecords from "./components/purchase/PurchaseRecords";
import UsageRecords from "./components/usage/UsageRecords";
import SequentialInvoiceNumber from "./components/invoice-conflict/SequentialInvoiceNumber";
import CounterpartyPage from "./components/master-data/counterparty/CounterpartyPage";
import UsersPage from "./components/master-data/users/UsersPage";
import moduleRoutes from "./constants/moduleRoutes";
import AppShell from "./AppShell";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthenticationPage />} />
        <Route element={<AppShell />}>
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
              path={moduleRoutes.PURCHASE_RECORDS}
              element={
                <RequireAdmin>
                  <PurchaseRecords />
                </RequireAdmin>
              }
            />
            <Route
              path={moduleRoutes.USAGE_RECORDS}
              element={
                <RequireAdmin>
                  <UsageRecords />
                </RequireAdmin>
              }
            />
            <Route
              path={moduleRoutes.INVOICE_CONFLICT}
              element={
                <RequireAdmin>
                  <SequentialInvoiceNumber />
                </RequireAdmin>
              }
            />
            <Route
              path={moduleRoutes.COUNTERPARTY}
              element={
                <RequireAdmin>
                  <CounterpartyPage />
                </RequireAdmin>
              }
            />
            <Route
              path={moduleRoutes.USERS}
              element={
                <RequireAdmin>
                  <UsersPage />
                </RequireAdmin>
              }
            />
            {/* <Route path={moduleRoutes.DEPARTMENT} element={<Department />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
