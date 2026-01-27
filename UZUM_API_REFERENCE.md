# Uzum Seller API Reference

Полная документация по всем доступным методам интеграции с Uzum Seller API.

## Авторизация

```typescript
import { testToken } from './lib/uzum-api';

// Проверка токена
const result = await testToken('YOUR_TOKEN');
if (result.valid) {
  console.log('Магазины:', result.sellerInfo.shops);
}
```

## Shop - Магазины

### getShops()
Получение списка собственных магазинов.

```typescript
import { getShops } from './lib/uzum-api';

const { success, shops } = await getShops(token);
// shops: [{ id: 96273, name: "PLAYO" }]
```

## Product - Товары

### getProducts()
Получение SKU по ID магазина.

```typescript
import { getProducts } from './lib/uzum-api';

const { success, products } = await getProducts(token, shopId);
```

### updateProductPrices()
Изменение цен SKU.

```typescript
import { updateProductPrices } from './lib/uzum-api';

const { success } = await updateProductPrices(token, shopId, [
  { sku: 'SKU123', price: 10000 },
  { sku: 'SKU456', price: 15000 }
]);
```

## FBS - Заказы (Fulfillment by Seller)

### getFbsOrders()
Получение заказов продавца.

```typescript
import { getFbsOrders } from './lib/uzum-api';

const { success, orders } = await getFbsOrders(token, {
  limit: 50,
  offset: 0,
  status: 'NEW',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### getFbsOrdersCount()
Получить количество заказов.

```typescript
import { getFbsOrdersCount } from './lib/uzum-api';

const { success, count } = await getFbsOrdersCount(token, {
  status: 'NEW',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### getFbsOrder()
Получение информации о заказе.

```typescript
import { getFbsOrder } from './lib/uzum-api';

const { success, order } = await getFbsOrder(token, orderId);
```

### confirmFbsOrder()
Подтверждение заказа.

```typescript
import { confirmFbsOrder } from './lib/uzum-api';

const { success } = await confirmFbsOrder(token, orderId);
```

### cancelFbsOrder()
Отмена заказа.

```typescript
import { cancelFbsOrder } from './lib/uzum-api';

const { success } = await cancelFbsOrder(token, orderId, 'Причина отмены');
```

### getFbsOrderLabel()
Получить этикетку для FBS заказа.

```typescript
import { getFbsOrderLabel } from './lib/uzum-api';

const { success, label } = await getFbsOrderLabel(token, orderId);
```

### getFbsReturnReasons()
Получение причин возврата.

```typescript
import { getFbsReturnReasons } from './lib/uzum-api';

const { success, reasons } = await getFbsReturnReasons(token);
```

### getFbsSkuStocks()
Получение остатков по SKU.

```typescript
import { getFbsSkuStocks } from './lib/uzum-api';

const { success, stocks } = await getFbsSkuStocks(token, {
  shopId: 96273,
  sku: 'SKU123'
});
```

### updateFbsSkuStocks()
Обновление остатков по SKU.

```typescript
import { updateFbsSkuStocks } from './lib/uzum-api';

const { success } = await updateFbsSkuStocks(token, [
  { sku: 'SKU123', stock: 100 },
  { sku: 'SKU456', stock: 50 }
]);
```

## Finance - Финансы

### getFinanceOrders()
Получение списка заказов с финансовой информацией.

```typescript
import { getFinanceOrders } from './lib/uzum-api';

const { success, orders } = await getFinanceOrders(token, {
  limit: 100,
  offset: 0,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### getFinanceExpenses()
Получение списка расходов продавца.

```typescript
import { getFinanceExpenses } from './lib/uzum-api';

const { success, expenses } = await getFinanceExpenses(token, {
  limit: 100,
  offset: 0,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

## Invoice - Накладные

### getInvoices()
Получение списка накладных.

```typescript
import { getInvoices } from './lib/uzum-api';

const { success, invoices } = await getInvoices(token, {
  limit: 50,
  offset: 0
});
```

### getShopInvoices()
Получение накладных поставки по ID магазина.

```typescript
import { getShopInvoices } from './lib/uzum-api';

const { success, invoices } = await getShopInvoices(token, shopId, {
  limit: 50,
  offset: 0
});
```

### getShopInvoiceProducts()
Получение состава накладной.

```typescript
import { getShopInvoiceProducts } from './lib/uzum-api';

const { success, products } = await getShopInvoiceProducts(token, shopId, {
  invoiceId: '12345'
});
```

### getReturns()
Получение возвратов продавца.

```typescript
import { getReturns } from './lib/uzum-api';

const { success, returns } = await getReturns(token, {
  limit: 50,
  offset: 0
});
```

### getShopReturns()
Получение накладных возврата.

```typescript
import { getShopReturns } from './lib/uzum-api';

const { success, returns } = await getShopReturns(token, shopId, {
  limit: 50,
  offset: 0
});
```

### getShopReturnDetails()
Получение состава накладной возврата.

```typescript
import { getShopReturnDetails } from './lib/uzum-api';

const { success, returnDetails } = await getShopReturnDetails(
  token, 
  shopId, 
  returnId
);
```

## Обработка ошибок

Все функции возвращают объект с полем `success`:

```typescript
const result = await getProducts(token, shopId);

if (result.success) {
  console.log('Товары:', result.products);
} else {
  console.error('Ошибка:', result.error);
}
```

## Типичные ошибки

- **401 Unauthorized** - Неверный токен
- **403 Forbidden** - Нет доступа или требуются дополнительные параметры
- **404 Not Found** - Ресурс не найден
- **429 Too Many Requests** - Превышен лимит запросов

## Пример полного workflow

```typescript
import { 
  testToken, 
  getShops, 
  getProducts, 
  getFbsOrders 
} from './lib/uzum-api';

async function initUzumIntegration(token: string) {
  // 1. Проверяем токен
  const tokenCheck = await testToken(token);
  if (!tokenCheck.valid) {
    throw new Error(tokenCheck.error);
  }

  // 2. Получаем магазины
  const shopsResult = await getShops(token);
  if (!shopsResult.success) {
    throw new Error(shopsResult.error);
  }

  const shopId = shopsResult.shops[0].id;

  // 3. Получаем товары
  const productsResult = await getProducts(token, shopId);
  console.log('Товары:', productsResult.products);

  // 4. Получаем заказы
  const ordersResult = await getFbsOrders(token, {
    limit: 20,
    status: 'NEW'
  });
  console.log('Новые заказы:', ordersResult.orders);
}
```

## Swagger UI

Полная документация API: https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/webjars/swagger-ui/index.html
