import api from "./api";
import endpoints from "../constants/Endpoints";

const ocrEndpoint = `${endpoints.OCR}/vat-invoice`;

const ocrApi = {
  scanVatInvoice: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(ocrEndpoint, formData);
  },
};

export default ocrApi;
