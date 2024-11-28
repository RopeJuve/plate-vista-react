import axios from "axios";

export const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const postData = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const fetchUserData = async (url, token, logout, restaurantId) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-restaurant-id": restaurantId,
      },
    });
    return response;
  } catch (err) {
    console.log(err);
    logout();
  }
};
