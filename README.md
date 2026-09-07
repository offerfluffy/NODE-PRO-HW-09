# Marketplace API

## 1. Що це за сервіс

Marketplace API - це backend для онлайн-маркетплейсу, схожого на Allegro. У сервісі продавці можуть публікувати товари, покупці можуть переглядати каталог і створювати замовлення, а адміністратори можуть керувати платформою та модерувати контент.

Головна проблема сервісу - коректне оформлення замовлень. Покупець не повинен випадково створити дубль замовлення через повторний запит, а система не повинна продавати більше одиниць товару, ніж реально є в наявності.

User stories:

- Як покупець, я хочу переглядати список товарів, щоб знайти потрібний товар.
- Як покупець, я хочу створити замовлення, щоб купити вибрані товари.
- Як покупець, я хочу безпечно повторити запит створення замовлення, щоб не отримати дубль замовлення після timeout або помилки мережі.
- Як продавець, я хочу додавати та редагувати товари, щоб продавати їх на платформі.
- Як продавець, я хочу керувати залишками товарів, щоб система не продавала недоступні товари.
- Як адміністратор, я хочу модерувати товари та користувачів, щоб підтримувати якість маркетплейсу.

## 2. Домен

Основні сутності домену:

| Сутність     | Зв'язки                                                                                      | Навіщо потрібна                                                |
| ------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| User         | може бути Customer, Seller або Admin; Customer має багато Orders; Seller має багато Products | Ідентифікація користувачів, ролей і прав доступу               |
| Product      | належить Seller; має один Inventory; входить в OrderItems                                    | Каталог товарів, які продавці публікують на платформі          |
| Inventory    | належить Product                                                                             | Зберігає доступну кількість товару та захищає від overselling  |
| Order        | належить Customer; має багато OrderItems; має Payment                                        | Оформлення покупки покупцем                                    |
| OrderItem    | належить Order і Product                                                                     | Зберігає конкретний товар, кількість і ціну в межах замовлення |
| Payment      | належить Order                                                                               | Фіксує оплату замовлення та її статус                          |
| Notification | належить User; може бути пов'язана з Order                                                   | Повідомляє покупця або продавця про важливі події              |

Перевірка домену:

| Вимога                                      | Як закривається                                           |
| ------------------------------------------- | --------------------------------------------------------- |
| >= 2 ролі користувачів із різними правами   | Customer, Seller, Admin                                   |
| Обмежений ресурс, за який конкурують        | `Inventory.quantity_available`                            |
| Операція з незворотним ефектом              | Створення `Order`, `OrderItem`, `Payment` і зміна залишку |
| Подія, про яку треба когось сповістити      | `OrderCreated`, `PaymentSucceeded`, `PaymentFailed`       |
| Сутність із файлами                         | Фото товару для `Product`                                 |
| Дані, які часто читають і рідко змінюють    | Каталог `Product`                                         |
| 4-6 сутностей зі зв'язками й важким запитом | Основна модель має 7 сутностей; зв'язки описані вище      |

Важкий запит для майбутніх ДЗ: список замовлень продавця з фільтром за статусом замовлення, статусом оплати, датою, покупцем і конкретним товаром. Такий запит потребує зв'язків між `Order`, `OrderItem`, `Product`, `Payment` і `User`.

## 3. Архітектурні рішення

Compute model: modular monolith. API буде одним Node.js застосунком, але код буде розділений за доменними модулями: `users`, `products`, `inventory`, `orders`, `payments`, `notifications`. Це спрощує запуск і деплой для курсового проєкту, але залишає зрозумілі межі між частинами домену.

Database: PostgreSQL. Сервісу потрібні транзакції для checkout, тому що створення замовлення, створення `OrderItem`, створення `Payment` і зменшення `Inventory` мають відбутися узгоджено. Якщо два покупці одночасно купують останню одиницю товару, база має допомогти не допустити overselling.

Async/event handling: outbox table first, worker later. Під час checkout API буде записувати події на кшталт `OrderCreated`, `PaymentSucceeded` або `PaymentFailed` в outbox-таблицю в тій самій PostgreSQL-транзакції, що й зміни замовлення. Пізніше окремий worker зможе читати ці події та створювати `Notification`, не втрачаючи події через тимчасову недоступність системи сповіщень.

Auth: JWT access tokens with RBAC. Користувач буде передавати `Authorization: Bearer <token>` у запитах до API. Token міститиме user id і роль, а API використовуватиме ролі `customer`, `seller` і `admin` для перевірки доступу до операцій над товарами, замовленнями та moderation-функціями.

Deploy: Docker Compose для локальної розробки. API буде запускатися як Node.js container, а PostgreSQL - як окремий database container. Такий підхід спрощує запуск після clean clone і залишає можливість пізніше додати Redis або worker container.

## 4. Trade-offs

I am not starting with microservices. The domain has clear modules, but splitting them into separate services now would add network calls, distributed transactions and deployment complexity before the core API contract is stable.

I am not integrating a real payment provider in the first version. The project will model `Payment` and payment statuses first, because the course needs checkout correctness more than real money movement.

I am not adding a message broker immediately. The first async step will be an outbox table in PostgreSQL, because it is enough to persist events reliably and can later be connected to a worker or broker.

I am not adding Elasticsearch/OpenSearch at the start. Product search can begin with PostgreSQL filters and indexes; a separate search service only makes sense when search requirements become more complex.

I am not supporting multiple warehouses per product in the first version. Each product will have one inventory record, which is enough to practice stock reservation and overselling prevention.

## 5. Contract testing

Обрано варіант А — consumer-driven contract testing with Pact.

Тест `consumer.pact.test.mjs` перевіряє взаємодію `GET /orders/1` між
консюмером `marketplace-web` і провайдером `marketplace-api`. Після успішного
запуску Pact створює контракт у теці `pacts/`.

Встановлення залежностей:

```bash
npm install
```

Запуск контрактного тесту:

```bash
npm run contract:test
```

Перевірка створеного Pact-контракту:

```bash
ls pacts/*.json
```

## 6. OpenAPI validation

Перевірка OpenAPI-спеки:

```bash
npx @redocly/cli lint openapi/openapi.yaml
```

Створення об'єднаної JSON-спеки:

```bash
npx @redocly/cli bundle openapi/openapi.yaml -o spec.json
```
