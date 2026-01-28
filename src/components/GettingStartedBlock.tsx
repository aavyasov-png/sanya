interface GettingStartedBlockProps {
  lang: 'ru' | 'uz';
  onNavigateCalculator: () => void;
  onNavigateCommissions: () => void;
  onNavigateSizes: () => void;
  onNavigateFaq: () => void;
}

export default function GettingStartedBlock({
  lang,
  onNavigateCalculator,
  onNavigateCommissions,
  onNavigateSizes,
  onNavigateFaq,
}: GettingStartedBlockProps) {
  const T = {
    ru: {
      title: 'С чего начать',
      subtitle: 'Полезные инструменты для новичков',
      profitCalc: 'Посчитать прибыль',
      profitCalcSub: 'Узнайте, сколько вы получите после комиссий',
      commissions: 'Проверить комиссии',
      commissionsSub: 'Найти комиссию для любой категории товара',
      sizes: 'Узнать габариты',
      sizesSub: 'Какие размеры товара и как это влияет на логистику',
      faq: 'Прочитать FAQ',
      faqSub: 'Ответы на частые вопросы',
    },
    uz: {
      title: 'Boshlang\'ich',
      subtitle: 'Yangilar uchun foydali vositalar',
      profitCalc: 'Foyda hisoblash',
      profitCalcSub: 'Komissiyalardan keyin qanchani olishingizni bilib oling',
      commissions: 'Komissiyalarni tekshirish',
      commissionsSub: 'Har qanday tovar turkumi uchun komissiyani topish',
      sizes: 'O\'lchamlarni bilib olish',
      sizesSub: 'Tovar o\'lchamlari va logistikaga ta\'siri',
      faq: 'FAQ ni o\'qish',
      faqSub: 'Tez so\'raladigan savollarga javoblar',
    },
  };

  const t = T[lang];

  const items = [
    {
      icon: '🧮',
      title: t.profitCalc,
      subtitle: t.profitCalcSub,
      onClick: onNavigateCalculator,
      color: '#6F00FF',
    },
    {
      icon: '💰',
      title: t.commissions,
      subtitle: t.commissionsSub,
      onClick: onNavigateCommissions,
      color: '#9D4EFF',
    },
    {
      icon: '📏',
      title: t.sizes,
      subtitle: t.sizesSub,
      onClick: onNavigateSizes,
      color: '#C77DFF',
    },
    {
      icon: '❓',
      title: t.faq,
      subtitle: t.faqSub,
      onClick: onNavigateFaq,
      color: '#E0AAFF',
    },
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 900,
        color: '#111',
        marginBottom: '4px',
        padding: '0 16px',
      }}>
        🚀 {t.title}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'rgba(0,0,0,0.55)',
        marginBottom: '12px',
        padding: '0 16px',
      }}>
        {t.subtitle}
      </div>

      {/* Сетка с элементами */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        padding: '0 16px',
      }}>
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${item.color}30`,
              background: `${item.color}10`,
              cursor: 'pointer',
              transition: 'all .2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${item.color}20`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${item.color}10`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: '24px',
              lineHeight: '1',
            }}>
              {item.icon}
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#111',
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(0,0,0,0.55)',
              lineHeight: '1.3',
            }}>
              {item.subtitle}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
