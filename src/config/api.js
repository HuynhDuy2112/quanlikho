// API Configuration
// Sử dụng JSONBin.io (có thể lưu dữ liệu thật)
// Thay YOUR_BIN_ID và YOUR_API_KEY bằng thông tin thật từ JSONBin.io
const JSONBIN_BIN_ID = '68ba42dd43b1c97be9373462';
const JSONBIN_API_KEY = '$2a$10$y9oYcaHIi4XKQR0VKznV6ehTUKR4eYRc.5oDgZ4F4e4Bu2zoLKjLK'; // Thay bằng API Key mới
const API_BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Fallback cho development local
// const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
// const API_BASE_URL = `http://${hostname}:3001`;

export const API_ENDPOINTS = {
  INVENTORY: `${API_BASE_URL}/inventory`,
  INVENTORY_BY_ID: (id) => `${API_BASE_URL}/inventory/${id}`,
};

export default API_BASE_URL;
