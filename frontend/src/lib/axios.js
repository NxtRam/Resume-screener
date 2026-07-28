import axios from "axios";

let rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
rawUrl = rawUrl.replace(/\/+$/, "");
if (!rawUrl.endsWith("/api")) {
  rawUrl = `${rawUrl}/api`;
}

export const axiosInstance = axios.create({
  baseURL: rawUrl,
  headers: {
    "Content-Type": "application/json",
  },
});