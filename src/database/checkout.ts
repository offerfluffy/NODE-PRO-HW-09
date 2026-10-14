export type CheckoutInput = {
  customerId: string;
  productId: string;
  quantity: number;
  idempotencyKey: string;
};

export type CheckoutResult = {
  orderId: string;
  remainingStock: number;
  remainingBalanceCents: number;
};

async function main() {}

main().catch((err) => process.exit(1));
