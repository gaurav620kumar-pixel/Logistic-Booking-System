const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("lbs_token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export const api = {
  get: (url) =>
    fetch(BASE_URL + url, { headers: headers() }).then(handleResponse),

  post: (url, data) =>
    fetch(BASE_URL + url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  put: (url, data) =>
    fetch(BASE_URL + url, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (url) =>
    fetch(BASE_URL + url, {
      method: "DELETE",
      headers: headers(),
    }).then(handleResponse),
};