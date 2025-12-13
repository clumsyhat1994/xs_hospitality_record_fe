import moduleRoutes from "./moduleRoutes";
import menuLables from "./moduleLables";

const routeToModule = {
  [moduleRoutes.HOSPITALITY_RECORDS]: {
    key: "HOSPITALITY_RECORDS",
    label: menuLables.HOSPITALITY_RECORDS,
  },
  [moduleRoutes.INVOICE_CONFLICT]: {
    key: "INVOICE_CONFLICT",
    label: menuLables.INVOICE_CONFLICT,
  },
  [moduleRoutes.DEPARTMENT]: {
    key: "DEPARTMENT",
    label: menuLables.DEPARTMENT,
  },
  [moduleRoutes.COUNTERPARTY]: {
    key: "COUNTERPARTY",
    label: menuLables.COUNTERPARTY,
  },
  [moduleRoutes.POSITION]: {
    key: "POSITION",
    label: menuLables.POSITION,
  },
  [moduleRoutes.GRADE]: {
    key: "GRADE",
    label: menuLables.GRADE,
  },
};

export default routeToModule;
