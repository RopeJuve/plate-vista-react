import api from "./api";

export const fetchTables = () => api.get("/table");
