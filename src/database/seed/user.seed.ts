import { EntityManager } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

type UserSeed = Pick<User, 'email' | 'passwordHash' | 'fullName' | 'role'>;

export const USER_SEEDS: UserSeed[] = [
  {
    email: 'seller.one@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Seller One',
    role: UserRole.SELLER,
  },
  {
    email: 'seller.two@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Seller Two',
    role: UserRole.SELLER,
  },
  {
    email: 'customer.one@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Customer One',
    role: UserRole.CUSTOMER,
  },
  {
    email: 'customer.two@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Customer Two',
    role: UserRole.CUSTOMER,
  },
  {
    email: 'customer.three@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Customer Three',
    role: UserRole.CUSTOMER,
  },
  {
    email: 'customer.four@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Customer Four',
    role: UserRole.CUSTOMER,
  },
  {
    email: 'customer.five@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Customer Five',
    role: UserRole.CUSTOMER,
  },
  {
    email: 'admin@example.com',
    passwordHash: 'seed-only-password-hash',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
  },
];

export async function seedUsers(
  manager: EntityManager,
): Promise<Map<string, User>> {
  const repository = manager.getRepository(User);
  const usersByEmail = new Map<string, User>();

  for (const userData of USER_SEEDS) {
    let user = await repository.findOneBy({ email: userData.email });

    if (!user) {
      user = await repository.save(repository.create(userData));
    }

    usersByEmail.set(user.email, user);
  }

  return usersByEmail;
}
