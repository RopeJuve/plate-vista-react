import api from "../../services/api";
import { toEmployeeList } from "./employees";

export const fetchEmployeeList = async () => toEmployeeList((await api.get("/employee")).data);
