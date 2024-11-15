import axios from "axios";

const apiWithSession = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
  instance.interceptors.request.use(async (req) => {
    let access_token = localStorage.getItem("access_token");
    if (
      access_token &&
      access_token.startsWith('"') &&
      access_token.endsWith('"')
    ) {
      access_token = access_token.slice(1, -1);
    }

    req.headers.Authorization = `Bearer ${access_token}`;
    return req;
  });

  return instance;
};

const apiNoSession = () => {
  return axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });
};

export const flexpiAPI = apiWithSession();
export const flexpiPublicAPI = apiNoSession();
