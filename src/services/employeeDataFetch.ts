import api from "./api";

export const fetchEmployees = () => api.get("/employee");
