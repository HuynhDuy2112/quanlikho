// API Configuration for online deployment
// Sử dụng JSON Server online miễn phí

// Option 1: JSONPlaceholder (chỉ đọc, không ghi được)
// const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Option 2: JSONBin.io (có thể ghi được, cần đăng ký)
// const API_BASE_URL = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID';

// Option 3: My JSON Server (từ GitHub repo)
const API_BASE_URL = 'https://my-json-server.typicode.com/YOUR_USERNAME/YOUR_REPO';

export const API_ENDPOINTS = {
  INVENTORY: `${API_BASE_URL}/inventory`,
  INVENTORY_BY_ID: (id) => `${API_BASE_URL}/inventory/${id}`,
};

export default API_BASE_URL;
