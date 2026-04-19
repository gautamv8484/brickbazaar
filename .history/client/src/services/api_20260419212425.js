import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  // ========== NEW ==========
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  // =========================
};

// Product APIs
export const productAPI = {
  getAllWithLocation: (params = {}) => api.get("/products", { params }),
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get("/products/seller/me"),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  getBuyerOrders: () => api.get("/orders/buyer/me"),
  getSellerOrders: () => api.get("/orders/seller/me"),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
// Review APIs
export const reviewAPI = {
  create: (data) => api.post("/reviews", data),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  checkReview: (orderId) => api.get(`/reviews/check/${orderId}`),
  getSellerReviews: () => api.get("/reviews/seller/me"),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  toggleBanUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  cancelOrder: (id) => api.put(`/admin/orders/${id}/cancel`),
  // Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`)
};

export default api;
