import api from "./api";

const invoiceRunsApi = {
  list: (page = 0, size = 10) =>
    api.get("/api/invoice-runs", { params: { page, size } }),
};

export default invoiceRunsApi;
