import axios from "../utils/axios";

export async function getTodos(showToday, offset) {
  const resposnse = await axios.get(`/${offset}/?showToday=${showToday}`);
  return resposnse.data;
}

export async function createTodo(text, dueAt) {
  const response = await axios.post("/", {
    text,
    dueAt: dueAt ? dueAt.format("DD/MM/YYYY") : null,
  });
  return response.data;
}

export async function updateTodo(id, completed) {
  return axios.put(`/${id}`, {
    completed,
  });
}

export async function deleteTodo(id, order, offset) {
  const response = await axios.delete(`/${id}/${order}/${offset}`);
  return response.data;
}

export async function updateTodoOrder(source, destination) {
  return axios.post(`/order`, {
    source,
    destination,
  });
}
