import { useState, useEffect, useRef } from 'react';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import { API_ENDPOINTS } from '../config/api';
import { localStorageAPI } from '../config/api-local';
import './InventoryManager.css';

// JSONBin API helper
const JSONBIN_BIN_ID = '68ba42dd43b1c97be9373462';
const JSONBIN_API_KEY = '$2a$10$y9oYcaHIi4XKQR0VKznV6ehTUKR4eYRc.5oDgZ4F4e4Bu2zoLKjLK'; // Thay bằng API Key mới

// Validate API credentials
if (JSONBIN_BIN_ID === '68ba42dd43b1c97be9373462' || JSONBIN_API_KEY === '$2a$10$y9oYcaHIi4XKQR0VKznV6ehTUKR4eYRc.5oDgZ4F4e4Bu2zoLKjLK') {
  console.error('❌ JSONBin credentials not configured! Please update Bin ID and API Key.');
}

const jsonbinAPI = {
  async get(url) {
    console.log('🔍 Fetching from JSONBin:', `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`);
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      headers: {
        'X-Access-Key': JSONBIN_API_KEY,
      },
    });
    
    if (!response.ok) {
      console.error('❌ JSONBin API Error:', response.status, response.statusText);
      if (response.status === 401) {
        throw new Error('401 Unauthorized - Check your API Key and Bin ID');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ JSONBin data loaded:', data);
    return data.record.inventory || [];
  },

  async post(url, body) {
    const inventory = await this.get(url);
    const newItem = {
      ...body,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      lastUpdated: new Date().toISOString(),
      history: body.history || []
    };
    
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({
        inventory: [...inventory, newItem]
      }),
    });
    if (!response.ok) throw new Error('Failed to create');
    return newItem;
  },

  async put(url, body) {
    const inventory = await this.get(url);
    const updatedInventory = inventory.map(item => 
      item.id === body.id ? body : item
    );
    
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': JSONBIN_API_KEY,
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
    
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({ inventory: updatedInventory }),
    });
    if (!response.ok) throw new Error('Failed to delete');
    return { success: true };
  }
};

const InventoryManager = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [reasonState, setReasonState] = useState({ open: false, title: '', defaultText: '' });
  const [reasonInput, setReasonInput] = useState('');
  const reasonResolveRef = useRef(null);

  // Load data from API
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      // Thử JSONBin trước
      const data = await jsonbinAPI.get(API_ENDPOINTS.INVENTORY);
      setItems(data);
    } catch (error) {
      console.error('Error loading from JSONBin:', error);
      // Fallback to localStorage
      try {
        const data = await localStorageAPI.get(API_ENDPOINTS.INVENTORY);
        setItems(data);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setItems([]);
      }
    }
  };

  // Modal-based prompt for reason
  const promptForReason = (message, defaultText = '') => {
    return new Promise((resolve) => {
      setReasonState({ open: true, title: message, defaultText });
      setReasonInput(defaultText || '');
      reasonResolveRef.current = resolve;
    });
  };

  const handleReasonConfirm = () => {
    const value = reasonInput.trim();
    if (!value) {
      alert('Lý do không được để trống.');
      return;
    }
    const resolve = reasonResolveRef.current;
    reasonResolveRef.current = null;
    setReasonState(prev => ({ ...prev, open: false }));
    resolve && resolve(value);
  };

  const handleReasonCancel = () => {
    const resolve = reasonResolveRef.current;
    reasonResolveRef.current = null;
    setReasonState(prev => ({ ...prev, open: false }));
    resolve && resolve(null);
  };

  //Save data to API
  const saveInventory = async (newItems) => {
    console.log('Saving inventory to API:', newItems);
    try {
      // Update each item individually to the API
      for (const item of newItems) {
        const response = await fetch(API_ENDPOINTS.INVENTORY_BY_ID(item.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        
        if (!response.ok) {
          console.error(`Failed to update item ${item.id}:`, response.statusText);
        }
      }
      setItems(newItems);
      console.log('Inventory saved to API and state updated');
    } catch (error) {
      console.error('Error saving to API:', error);
      // Fallback to localStorage
      localStorage.setItem('inventory', JSON.stringify(newItems));
      setItems(newItems);
    }
  };

  const addItem = async (newItem) => {
    try {
      const item = {
        ...newItem,
        history: [],
        lastUpdated: new Date().toISOString()
      };
      
      console.log('➕ Adding item to JSONBin:', item);
      // Thử JSONBin trước
      const createdItem = await jsonbinAPI.post(API_ENDPOINTS.INVENTORY, item);
      console.log('✅ Item added to JSONBin:', createdItem);
      setItems(prevItems => [...prevItems, createdItem]);
      setShowForm(false);
    } catch (error) {
      console.error('❌ Error adding item to JSONBin:', error);
      // Fallback to localStorage
      try {
        const item = {
          ...newItem,
          history: [],
          lastUpdated: new Date().toISOString()
        };
        const createdItem = await localStorageAPI.post(API_ENDPOINTS.INVENTORY, item);
        setItems(prevItems => [...prevItems, createdItem]);
        setShowForm(false);
        alert('⚠️ Lưu vào localStorage (JSONBin lỗi)');
      } catch (localError) {
        console.error('Error adding to localStorage:', localError);
        alert('Lỗi lưu dữ liệu. Vui lòng thử lại.');
      }
    }
  };

  const updateItem = async (updatedItem) => {
    try {
      const existing = items.find(i => i.id === updatedItem.id) || {};

      let historyList = Array.isArray(updatedItem.history)
        ? updatedItem.history
        : (existing.history || []);

      // Ghi lịch sử nếu số lượng thay đổi qua form chỉnh sửa
      if (typeof existing.quantity === 'number' && typeof updatedItem.quantity === 'number' && existing.quantity !== updatedItem.quantity) {
        const change = updatedItem.quantity - existing.quantity;
        const actionLabel = change > 0 ? 'tăng' : 'giảm';
        const defaultDesc = `Chỉnh sửa ${actionLabel} số lượng qua form`;
        const description = await promptForReason('Nhập lý do thay đổi số lượng:', defaultDesc);
        if (description === null) {
          return; // hủy cập nhật nếu người dùng cancel
        }
        const historyEntry = {
          timestamp: new Date().toISOString(),
          change,
          from: existing.quantity,
          to: updatedItem.quantity,
          description
        };
        historyList = [...historyList, historyEntry];
      }

      const itemToUpdate = {
        ...updatedItem,
        history: historyList,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('✏️ Updating item in JSONBin:', itemToUpdate);
      // Thử JSONBin trước
      const updatedItemFromAPI = await jsonbinAPI.put(API_ENDPOINTS.INVENTORY_BY_ID(updatedItem.id), itemToUpdate);
      console.log('✅ Item updated in JSONBin:', updatedItemFromAPI);
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === updatedItem.id ? updatedItemFromAPI : item
        )
      );
      setEditingItem(null);
      setShowForm(false);
    } catch (error) {
      console.error('❌ Error updating item in JSONBin:', error);
      // Fallback to localStorage
      try {
        const itemToUpdate = {
          ...updatedItem,
          history: Array.isArray(updatedItem.history) ? updatedItem.history : (items.find(i => i.id === updatedItem.id)?.history || []),
          lastUpdated: new Date().toISOString()
        };
        const updatedItemFromLocal = await localStorageAPI.put(API_ENDPOINTS.INVENTORY_BY_ID(updatedItem.id), itemToUpdate);
        if (updatedItemFromLocal) {
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === updatedItem.id ? updatedItemFromLocal : item
            )
          );
          setEditingItem(null);
          setShowForm(false);
          alert('⚠️ Cập nhật vào localStorage (JSONBin lỗi)');
        }
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
        alert('Lỗi cập nhật dữ liệu. Vui lòng thử lại.');
      }
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        console.log('🗑️ Deleting item from JSONBin:', id);
        // Thử JSONBin trước
        await jsonbinAPI.delete(API_ENDPOINTS.INVENTORY_BY_ID(id));
        console.log('✅ Item deleted from JSONBin');
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('❌ Error deleting item from JSONBin:', error);
        // Fallback to localStorage
        try {
          await localStorageAPI.delete(API_ENDPOINTS.INVENTORY_BY_ID(id));
          setItems(prevItems => prevItems.filter(item => item.id !== id));
          alert('⚠️ Xóa trong localStorage (JSONBin lỗi)');
        } catch (localError) {
          console.error('Error deleting from localStorage:', localError);
          alert('Lỗi xóa dữ liệu. Vui lòng thử lại.');
        }
      }
    }
  };

  const increaseQuantity = async (id) => {
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      const description = await promptForReason('Nhập lý do tăng số lượng:', '');
      if (description === null) return; // user cancelled
      const newQuantity = item.quantity + 1;
      const historyEntry = {
        timestamp: new Date().toISOString(),
        change: +1,
        from: item.quantity,
        to: newQuantity,
        description
      };

      const updatedItem = {
        ...item,
        quantity: newQuantity,
        history: [...(item.history || []), historyEntry],
        lastUpdated: new Date().toISOString()
      };
      
      console.log('➕ Increasing quantity in JSONBin:', updatedItem);
      // Thử JSONBin trước
      const updatedItemFromAPI = await jsonbinAPI.put(API_ENDPOINTS.INVENTORY_BY_ID(id), updatedItem);
      console.log('✅ Quantity increased in JSONBin:', updatedItemFromAPI);
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? updatedItemFromAPI : item
        )
      );
    } catch (error) {
      console.error('❌ Error increasing quantity in JSONBin:', error);
      // Fallback to localStorage
      try {
        const item = items.find(item => item.id === id);
        if (!item) return;
        
        const description = await promptForReason('Nhập lý do tăng số lượng:', '');
        if (description === null) return;
        
        const newQuantity = item.quantity + 1;
        const historyEntry = {
          timestamp: new Date().toISOString(),
          change: +1,
          from: item.quantity,
          to: newQuantity,
          description
        };

        const updatedItem = {
          ...item,
          quantity: newQuantity,
          history: [...(item.history || []), historyEntry],
          lastUpdated: new Date().toISOString()
        };
        
        const updatedItemFromLocal = await localStorageAPI.put(API_ENDPOINTS.INVENTORY_BY_ID(id), updatedItem);
        if (updatedItemFromLocal) {
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === id ? updatedItemFromLocal : item
            )
          );
          alert('⚠️ Tăng số lượng trong localStorage (JSONBin lỗi)');
        }
      } catch (localError) {
        console.error('Error increasing quantity in localStorage:', localError);
      }
    }
  };

  const decreaseQuantity = async (id) => {
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      const description = await promptForReason('Nhập lý do giảm số lượng:', '');
      if (description === null) return; // user cancelled
      const newQuantity = Math.max(0, item.quantity - 1);
      const historyEntry = {
        timestamp: new Date().toISOString(),
        change: -1,
        from: item.quantity,
        to: newQuantity,
        description
      };

      const updatedItem = {
        ...item,
        quantity: newQuantity,
        history: [...(item.history || []), historyEntry],
        lastUpdated: new Date().toISOString()
      };
      
      console.log('➖ Decreasing quantity in JSONBin:', updatedItem);
      // Thử JSONBin trước
      const updatedItemFromAPI = await jsonbinAPI.put(API_ENDPOINTS.INVENTORY_BY_ID(id), updatedItem);
      console.log('✅ Quantity decreased in JSONBin:', updatedItemFromAPI);
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? updatedItemFromAPI : item
        )
      );
    } catch (error) {
      console.error('❌ Error decreasing quantity in JSONBin:', error);
      // Fallback to localStorage
      try {
        const item = items.find(item => item.id === id);
        if (!item) return;
        
        const description = await promptForReason('Nhập lý do giảm số lượng:', '');
        if (description === null) return;
        
        const newQuantity = Math.max(0, item.quantity - 1);
        const historyEntry = {
          timestamp: new Date().toISOString(),
          change: -1,
          from: item.quantity,
          to: newQuantity,
          description
        };

        const updatedItem = {
          ...item,
          quantity: newQuantity,
          history: [...(item.history || []), historyEntry],
          lastUpdated: new Date().toISOString()
        };
        
        const updatedItemFromLocal = await localStorageAPI.put(API_ENDPOINTS.INVENTORY_BY_ID(id), updatedItem);
        if (updatedItemFromLocal) {
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === id ? updatedItemFromLocal : item
            )
          );
          alert('⚠️ Giảm số lượng trong localStorage (JSONBin lỗi)');
        }
      } catch (localError) {
        console.error('Error decreasing quantity in localStorage:', localError);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setShowForm(false);
  };

  // Filter items based on search term and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(items.map(item => item.category))];

  console.log(items);
  

  return (
    <div className="inventory-manager">
      <div className="header">
        <h1>Quản Lý Kho</h1>
        <div className="controls">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="add-button"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {reasonState.open && (
        <div className="reason-modal-overlay" role="dialog" aria-modal="true">
          <div className="reason-modal">
            <div className="reason-header">
              <h3>{reasonState.title || 'Nhập lý do'}</h3>
            </div>
            <div className="reason-body">
              <textarea
                className="reason-input"
                placeholder="Nhập lý do..."
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
            <div className="reason-actions">
              <button className="reason-cancel" onClick={handleReasonCancel}>Hủy</button>
              <button className="reason-confirm" onClick={handleReasonConfirm}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ItemForm
          item={editingItem}
          onSave={editingItem ? updateItem : addItem}
          onCancel={handleCancel}
        />
      )}

      <ItemList
        items={filteredItems}
        onEdit={handleEdit}
        onDelete={deleteItem}
        onIncreaseQuantity={increaseQuantity}
        onDecreaseQuantity={decreaseQuantity}
      />

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">Tổng sản phẩm:</span>
          <span className="stat-value">{items.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tổng số lượng:</span>
          <span className="stat-value">
            {items.map(item => item.quantity).reduce((sum, item) => sum + item, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
