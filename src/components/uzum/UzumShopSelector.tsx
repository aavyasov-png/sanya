import { useState, useEffect } from 'react';
import { getShops } from '../../lib/uzum-api';

interface UzumShopSelectorProps {
  lang: 'ru' | 'uz';
  token: string;
  selectedShopId: string | null;
  onShopSelect: (shopId: string | null) => void;
}

export default function UzumShopSelector({ lang, token, selectedShopId, onShopSelect }: UzumShopSelectorProps) {
  const [shops, setShops] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadShops();
  }, [token]);

  async function loadShops() {
    try {
      const result = await getShops(token);
      if (result.success && result.shops) {
        setShops(result.shops);
        // Auto-select first shop if none selected
        if (!selectedShopId && result.shops.length > 0) {
          onShopSelect(result.shops[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  }

  const selectedShop = shops.find(s => s.id === selectedShopId);
  const shopName = selectedShop?.title || lang === 'ru' ? 'Выберите магазин' : 'Do\'konni tanlang';

  if (shops.length <= 1) {
    return null; // Hide selector if only one shop
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '150px',
        }}
      >
        <span>🏪</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{shopName}</span>
        <span style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}>
          {shops.map(shop => (
            <button
              key={shop.id}
              onClick={() => {
                onShopSelect(shop.id);
                setShowDropdown(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                backgroundColor: selectedShopId === shop.id ? '#ede9fe' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ fontWeight: selectedShopId === shop.id ? 600 : 400 }}>
                {shop.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                ID: {shop.id}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
