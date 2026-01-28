import { useState, useEffect } from 'react';
import { getShops, getProducts, getFbsOrdersCount } from '../../lib/uzum-api';
import EmptyState from '../EmptyState';
import ContextualTooltip from '../ContextualTooltip';

interface UzumDashboardProps {
  lang: 'ru' | 'uz';
  token: string;
  onNavigate: (page: 'products' | 'orders' | 'finance') => void;
  onNavigateBack: () => void;
}

export default function UzumDashboard({ lang, token, onNavigate, onNavigateBack }: UzumDashboardProps) {
  const [shops, setShops] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const T = {
    ru: {
      title: 'Панель управления',
      back: 'Назад',
      loading: 'Загрузка...',
      shops: 'Мои магазины',
      products: 'Товары',
      orders: 'Заказы',
      finance: 'Финансы',
      totalProducts: 'Всего товаров',
      activeOrders: 'Активные',
      pendingOrders: 'Ожидают',
      viewAll: 'Смотреть все',
      shop: 'Магазин',
      error: 'Ошибка загрузки данных',
    },
    uz: {
      title: 'Boshqaruv paneli',
      back: 'Orqaga',
      loading: 'Yuklanmoqda...',
      shops: 'Mening dokonlarim',
      products: 'Mahsulotlar',
      orders: 'Buyurtmalar',
      finance: 'Moliya',
      totalProducts: 'Jami mahsulotlar',
      activeOrders: 'Faol',
      pendingOrders: 'Kutilmoqda',
      viewAll: 'Barchasini korish',
      shop: 'Dokon',
      error: 'Malumotlarni yuklashda xatolik',
    },
  };

  const t = T[lang];

  useEffect(() => {
    loadDashboard();
  }, [token]);

  async function loadDashboard() {
    setLoading(true);
    try {
      // Load shops
      const shopsResult = await getShops(token);
      console.log('🏪 Shops result:', shopsResult);
      if (shopsResult.success && shopsResult.shops) {
        setShops(shopsResult.shops);

        // Load products and orders for first shop
        if (shopsResult.shops.length > 0) {
          const shopId = shopsResult.shops[0].id;
          
          // Load products
          const productsResult = await getProducts(token, shopId);
          console.log('📦 Products result:', productsResult);
          
          if (productsResult.success) {
            setStats(prev => ({
              ...prev,
              totalProducts: productsResult.total || 0,
            }));
          }

          // Load orders count (все заказы)
          const ordersResult = await getFbsOrdersCount(token, shopId);
          console.log('📋 Orders count result:', ordersResult);
          if (ordersResult.success && ordersResult.count !== undefined) {
            setStats(prev => ({
              ...prev,
              activeOrders: ordersResult.count || 0,
            }));
          }

          // Load pending orders (NEW статус)
          const pendingResult = await getFbsOrdersCount(token, shopId, { status: 'NEW' });
          if (pendingResult.success && pendingResult.count !== undefined) {
            setStats(prev => ({
              ...prev,
              pendingOrders: pendingResult.count || 0,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <EmptyState
        icon="🔄"
        title={t.loading}
        subtitle={lang === 'ru' ? 'Загружаем данные из вашего аккаунта...' : 'Hisobingizdan malumotlar yuklanmoqda...'}
        type="loading"
      />
    );
  }

  if (shops.length === 0) {
    return (
      <EmptyState
        icon="🏪"
        title={lang === 'ru' ? 'Интеграция не подключена' : 'Integratsiya ulanmagan'}
        subtitle={lang === 'ru' ? 'Подключите Uzum для заказов и аналитики' : 'Buyurtmalar va tahlil uchun Uzumni ulanging'}
        actionText={lang === 'ru' ? 'Подключить' : 'Ulang'}
        onAction={onNavigateBack}
      />
    );
  }

  return (
    <div className="list">
      {/* Header with navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <button
          onClick={onNavigateBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← {t.back}
        </button>
        <div style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#111',
        }}>
          🏪 {t.title}
        </div>
      </div>

      {/* Shops Section */}
      {shops.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#111',
          }}>
            {t.shops}
            <ContextualTooltip
              content={lang === 'ru' ? 'Если данных нет — это нормально для нового магазина.' : 'Agar ma\'lumot bo\'lmasa - bu yangi do\'kon uchun normal.'}
              position="right"
              trigger="click"
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {shops.map((shop: any) => (
              <div
                key={shop.id}
                className="cardCream"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}>
                  🏪
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  textAlign: 'center',
                  color: '#111',
                }}>
                  {shop.name}
                </div>
                <div style={{
                  color: '#666',
                  fontSize: '13px',
                  textAlign: 'center',
                }}>
                  ID: {shop.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
      }}>
        {/* Products Card */}
        <div
          onClick={() => onNavigate('products')}
          className="cardCream"
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#7c3aed',
            marginBottom: '8px',
          }}>
            {stats.totalProducts}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
          }}>
            {t.totalProducts}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#7c3aed',
            fontWeight: 600,
          }}>
            {t.viewAll} →
          </div>
        </div>

        {/* Orders Card */}
        <div
          onClick={() => onNavigate('orders')}
          className="cardCream"
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#22c55e',
            marginBottom: '8px',
          }}>
            {stats.activeOrders}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
          }}>
            {t.activeOrders}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#22c55e',
            fontWeight: 600,
          }}>
            {t.viewAll} →
          </div>
        </div>

        {/* Finance Card */}
        <div
          onClick={() => onNavigate('finance')}
          className="cardCream"
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#f59e0b',
            marginBottom: '8px',
          }}>
            {stats.pendingOrders}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
          }}>
            {t.pendingOrders}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#f59e0b',
            fontWeight: 600,
          }}>
            {t.viewAll} →
          </div>
        </div>
      </div>
    </div>
  );
}
