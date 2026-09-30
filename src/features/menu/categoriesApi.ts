import api from "../../services/api";

export type Station = "kitchen" | "bar";

export type Category = {
  _id: string;
  name: string;
  station: Station;
  position: number;
};

export const fetchCategoryList = async () => (await api.get<Category[]>("/categories")).data;

export const createCategory = async (body: { name: string; station: Station }) =>
  (await api.post<Category>("/categories", body, { skipErrorToast: true })).data;

export const updateCategory = async (id: string, body: Partial<Pick<Category, "name" | "station">>) =>
  (await api.put<Category>(`/categories/${id}`, body, { skipErrorToast: true })).data;

// Responds with the whole list in its new order.
export const moveCategory = async (id: string, direction: "up" | "down") =>
  (await api.post<Category[]>(`/categories/${id}/move`, { direction })).data;

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`, { skipErrorToast: true });
};
