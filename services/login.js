import { postData, fetchData } from "./fetchData";

export const userLogin = async (formData, login, navigate) => {
  try {
    const response = await postData(
      `${import.meta.env.VERCEL_API_URL}/auth/login`,
      formData
    );
    const authHeader = response.headers.get("authorization");
    const token = authHeader.split(" ")[1];
    if (!token) {
      navigate("/login");
    }
    login(token);
    navigate("/");
  } catch (err) {
    console.log(err);
  }
};

export const employeeLogin = async (formData, login, navigate) => {
  try {
    const response = await postData(
      `${import.meta.env.VERCEL_API_URL}/auth/employee/login`,
      formData
    );
    const authHeader = response.headers.get("authorization");
    const token = authHeader.split(" ")[1];
    if (!token) {
      navigate("/login");
    }
    login(token);
    navigate("/");
  } catch (err) {
    console.log(err);
  }
};

export const authUser = async (token, setAuth) => {
  try {
    const response = await fetchData(
      `${import.meta.env.VERCEL_API_URL}/auth/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    setAuth(data);
  } catch (err) {
    console.log(err);
  }
};
