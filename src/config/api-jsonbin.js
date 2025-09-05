// API Configuration for JSONBin.io (có thể lưu dữ liệu thật)
// Đăng ký miễn phí tại: https://jsonbin.io

// Thay YOUR_BIN_ID bằng ID thật từ JSONBin.io
const JSONBIN_BIN_ID = 'YOUR_BIN_ID';
const JSONBIN_API_KEY = 'YOUR_API_KEY'; // Tạo API key từ JSONBin.io

const API_BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

export const API_ENDPOINTS = {
  INVENTORY: `${API_BASE_URL}/inventory`,
  INVENTORY_BY_ID: (id) => `${API_BASE_URL}/inventory/${id}`,
};

// Helper để gọi API với authentication
export const jsonbinAPI = {
  async get(url) {
    const response = await fetch(url, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.record.inventory;
  },

  async post(url, body) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({
        inventory: [...(await this.get(url)), body]
      }),
    });
    if (!response.ok) throw new Error('Failed to create');
    return body;
  },

  async put(url, body) {
    const inventory = await this.get(url);
    const updatedInventory = inventory.map(item => 
      item.id === body.id ? body : item
    );
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({ inventory: updatedInventory }),
    });
    if (!response.ok) throw new Error('Failed to update');
    return body;
  },

  async delete(url) {
    const id = url.split('/').pop();
    const inventory = await this.get(url);
    const updatedInventory = inventory.filter(item => item.id !== id);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({ inventory: updatedInventory }),
    });
    if (!response.ok) throw new Error('Failed to delete');
    return { success: true };
  }
};

export default API_BASE_URL;
