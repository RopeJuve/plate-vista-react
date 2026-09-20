import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { consumeSessionMessage } from "../../../utils/notify";

const Login = () => {
  const { restaurantId } = useParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState(() => consumeSessionMessage());
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setPending(true);
    setAuthMessage("");

    try {
      const response = await api.post(
        "/auth/employee/login",
        {
          employee: username,
          password: password,
        },
        restaurantId
          ? { headers: { "x-restaurant-id": restaurantId } }
          : undefined
      );

      if (response.status !== 200) {
        setAuthMessage("Login failed. Please try again.");
        return;
      }

      const token = getAuthTokenFromHeaders(response.headers);
      const position = response.data.position;
      login(token, { position, employee: username }, restaurantId);

      if (position === "admin") {
        navigate(`/admin`);
        return;
      }
      if (position === "bar" || position === "kitchen") {
        navigate(`/bar`);
        return;
      }

      logout();
      setAuthMessage("This account does not have access to the staff apps.");
    } catch (error) {
      setAuthMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center max-w-screen-lg mx-auto min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-secondary-dark-bg p-8 rounded-2xl shadow-md w-96 mx-auto md:w-[50%]"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Login
        </h2>
        {authMessage && (
          <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-center text-sm text-red-700" role="alert">
            {authMessage}
          </p>
        )}

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300" htmlFor="employee">
            Username
          </label>
          <input
            id="employee"
            type="text"
            name="employee"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-dark-yellow-bg hover:bg-yellow-600 text-white py-3 px-6 rounded-md w-full disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
