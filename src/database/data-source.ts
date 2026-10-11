import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Inventory } from './entities/inventory.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';

const port = Number(requiredEnv('DB_PORT'));

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error('DB_PORT must be a valid port number');
}

const dataSource = new DataSource({
  type: 'postgres',

  host: requiredEnv('DB_HOST'),
  port,
  username: requiredEnv('DB_USER'),
  password: requiredEnv('DB_PASSWORD'),
  database: requiredEnv('DB_NAME'),

  entities: [User, Product, Inventory, Order, OrderItem],

  migrations: [`${__dirname}/migrations/*.js`],

  synchronize: false,
  logging: false,
});

export default dataSource;

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}