import { useState, useEffect } from 'react';
import './ItemForm.css';

const ItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: undefined,
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    description: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        price: item.price || 0,
        description: item.description || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formData.category.trim()) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (formData.quantity < 0) {
      alert('Số lượng không được âm');
      return;
    }
    if (formData.price < 0) {
      alert('Giá không được âm');
      return;
    }

    onSave(formData);
  };

  const categories = [
    'Điện tử',
    'Điện thoại',
    'Nội thất',
    'Thời trang',
    'Sách',
    'Thể thao',
    'Mỹ phẩm',
    'Thực phẩm',
    'Khác'
  ];

  return (
    <div className="form-overlay">
      <div className="item-form">
        <div className="form-header">
          <h2>{item ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button onClick={onCancel} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Tên sản phẩm *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Danh mục *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Số lượng *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Giá (VNĐ) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Hủy
            </button>
            <button type="submit" className="save-button">
              {item ? 'Cập nhật' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
