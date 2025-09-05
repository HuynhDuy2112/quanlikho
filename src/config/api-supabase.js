// API Configuration for Supabase (Database thật)
// Đăng ký miễn phí tại: https://supabase.com

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const API_ENDPOINTS = {
  INVENTORY: `${SUPABASE_URL}/rest/v1/inventory`,
  INVENTORY_BY_ID: (id) => `${SUPABASE_URL}/rest/v1/inventory?id=eq.${id}`,
};

export const supabaseAPI = {
  async get(url) {
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  },

  async post(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to create');
    const data = await response.json();
    return data[0];
  },

  async put(url, body) {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to update');
    const data = await response.json();
    return data[0];
  },

  async delete(url) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete');
    return { success: true };
  }
};

export default SUPABASE_URL;
