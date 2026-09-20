import api from "./api";

const getAuthTokenFromHeaders = (headers) => {
  const authHeader =
    headers.authorization ||
    headers.Authorization ||
    (typeof headers.get === "function" ? headers.get("authorization") : "");
  if (!authHeader) {
    return null;
  }
  return authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader.split(" ")[1];
};

export const userLogin = async (formData, login, navigate) => {
  const response = await api.post("/auth/login", formData);
  const token = getAuthTokenFromHeaders(response.headers);
  if (!token) {
    navigate("/login");
    return;
  }
  login(token);
  navigate("/");
};

export const employeeLogin = async (formData, login, navigate) => {
  const response = await api.post("/auth/employee/login", formData);
  const token = getAuthTokenFromHeaders(response.headers);
  if (!token) {
    navigate("/login");
    return;
  }
  login(token);
  navigate("/");
};

export const authUser = async () => {
  const { data } = await api.get("/auth/user");
  return data;
};
