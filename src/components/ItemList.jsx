import './ItemList.css';

const ItemList = ({ 
  items, 
  onEdit, 
  onDelete, 
  onIncreaseQuantity, 
  onDecreaseQuantity 
}) => {
  const toggleStates = new Map();
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>Không có sản phẩm nào</h3>
        <p>Hãy thêm sản phẩm đầu tiên vào kho của bạn</p>
      </div>
    );
  }

  console.log(items);
  

  return (
    <div className="item-list">
      <div className="list-header">
        <h3>Danh sách sản phẩm ({items.length})</h3>
      </div>
      
      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <h4 className="item-name">{item.name}</h4>
              <span className="item-category">{item.category}</span>
            </div>
            
            <div className="item-details">
              <div className="item-description">
                {item.description || 'Không có mô tả'}
              </div>
              
              <div className="item-price">
                {item.price.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>
            
            <div className="quantity-controls">
              <div className="quantity-display">
                <span className="quantity-label">Số lượng:</span>
                <span className="quantity-value">{item.quantity}</span>
              </div>
              
              <div className="quantity-buttons">
                <button
                  onClick={() => onDecreaseQuantity(item.id)}
                  className="quantity-btn decrease"
                  disabled={item.quantity <= 0}
                >
                  -
                </button>
                <button
                  onClick={() => onIncreaseQuantity(item.id)}
                  className="quantity-btn increase"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="item-tabs">
              <button
                className="action-btn history-btn"
                onClick={() => {
                  const opened = toggleStates.get(item.id) || false;
                  toggleStates.set(item.id, !opened);
                  // trigger re-render by forcing state through a no-op pattern
                  // Since this component is simple, we rely on a micro state hack via requestAnimationFrame
                  requestAnimationFrame(() => {
                    const el = document.getElementById(`history-${item.id}`);
                    if (el) {
                      el.style.display = !opened ? 'block' : 'none';
                    }
                  });
                }}
              >
                Lịch sử
              </button>
            </div>

            <div id={`history-${item.id}`} style={{ display: 'none', marginTop: '8px' }}>
              {(item.history || []).length === 0 ? (
                <div className="history-empty">Chưa có lịch sử</div>
              ) : (
                <div className="history-list">
                  {(item.history || []).slice().reverse().map((h, idx) => (
                    <div key={idx} className={`history-row ${h.change > 0 ? 'pos' : 'neg'}`}>
                      <div>
                        <strong>{h.change > 0 ? '+1' : '-1'}</strong>
                        {' '}từ {h.from} → {h.to}
                      </div>
                      <div>
                        <small>{new Date(h.timestamp).toLocaleString('vi-VN')}</small>
                      </div>
                      {h.description && (
                        <div className="history-desc">{h.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="item-actions">
              <button
                onClick={() => onEdit(item)}
                className="action-btn edit-btn"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="action-btn delete-btn"
              >
                🗑️ Xóa
              </button>
            </div>
            
            <div className="item-footer">
              <small className="last-updated">
                Cập nhật: {new Date(item.lastUpdated).toLocaleDateString('vi-VN')}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;
