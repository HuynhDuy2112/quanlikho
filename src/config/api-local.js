// API Configuration for localStorage fallback
// Sử dụng localStorage khi không có server

const STORAGE_KEY = 'inventory_data';

export const API_ENDPOINTS = {
  INVENTORY: 'local://inventory',
  INVENTORY_BY_ID: (id) => `local://inventory/${id}`,
};

// Helper functions for localStorage
export const localStorageAPI = {
  async get(url) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"inventory": []}');
    if (url.includes('/inventory/')) {
      const id = url.split('/').pop();
      return data.inventory.find(item => item.id === id) || null;
    }
    return data.inventory;
  },

  async post(url, body) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"inventory": []}');
    const newItem = {
      ...body,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      lastUpdated: new Date().toISOString(),
      history: body.history || []
    };
    data.inventory.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return newItem;
  },

  async put(url, body) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"inventory": []}');
    const id = url.split('/').pop();
    const index = data.inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      data.inventory[index] = { ...data.inventory[index], ...body, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data.inventory[index];
    }
    return null;
  },

  async delete(url) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"inventory": []}');
    const id = url.split('/').pop();
    data.inventory = data.inventory.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true };
  }
};

export default 'local://api';
