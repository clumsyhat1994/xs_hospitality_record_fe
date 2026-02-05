import moduleRoutes from "./moduleRoutes";
import menuLables from "./moduleLables";
import moduleKeys from "./moduleKeys";

const routeToModule = {
  [moduleRoutes.HOSPITALITY_RECORDS]: {
    key: moduleKeys.HOSPITALITY_RECORDS,
    label: menuLables.HOSPITALITY_RECORDS,
  },
  [moduleRoutes.INVOICE_CONFLICT]: {
    key: moduleKeys.INVOICE_CONFLICT,
    label: menuLables.INVOICE_CONFLICT,
  },
  [moduleRoutes.DEPARTMENT]: {
    key: moduleKeys.DEPARTMENT,
    label: menuLables.DEPARTMENT,
  },
  [moduleRoutes.COUNTERPARTY]: {
    key: moduleKeys.COUNTERPARTY,
    label: menuLables.COUNTERPARTY,
  },
  [moduleRoutes.POSITION]: {
    key: moduleKeys.POSITION,
    label: menuLables.POSITION,
  },
  [moduleRoutes.GRADE]: {
    key: moduleKeys.GRADE,
    label: menuLables.GRADE,
  },
};

export default routeToModule;
