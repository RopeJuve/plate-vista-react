import api from "../../services/api";
import { readOrdersPayload } from "./orderRows";

export const fetchOrdersPage = async (params: { page: number; limit: number }) =>
  readOrdersPayload((await api.get("/orders", { params })).data);
