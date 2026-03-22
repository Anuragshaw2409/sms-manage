import { Plan, Tax, Transaction, User } from './types';

export const initialPlans: Plan[] = Array.from({ length: 25 }, (_, i) => ({
  id: crypto.randomUUID(),
  name: ['Basic', 'Standard', 'Premium', 'Enterprise', 'Starter'][i % 5] + ` ${i + 1}`,
  price: [999, 2999, 4999, 9999, 499][i % 5],
  discountedPrice: [799, 2499, 3999, 7999, 399][i % 5],
  validity: [1, 3, 6, 12, 1][i % 5],
  includedModules: ['Attendance', 'Fee Management', 'Library', 'Transport', 'Exam'].slice(0, (i % 5) + 1),
  numberOfSchools: [1, 5, 10, 50, 1][i % 5],
  pagePermissions: ['Dashboard', 'Reports', 'Settings', 'Analytics'].slice(0, (i % 4) + 1),
  routesPermissions: ['/dashboard', '/reports', '/settings', '/analytics'].slice(0, (i % 4) + 1),
  isActive: i % 3 !== 0,
}));

export const initialTaxes: Tax[] = [
  { id: crypto.randomUUID(), state: 'Maharashtra', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Karnataka', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Delhi', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Tamil Nadu', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Gujarat', cgst: 6, sgst: 6, igst: 12 },
  { id: crypto.randomUUID(), state: 'Rajasthan', cgst: 6, sgst: 6, igst: 12 },
  { id: crypto.randomUUID(), state: 'Uttar Pradesh', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'West Bengal', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Telangana', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Kerala', cgst: 6, sgst: 6, igst: 12 },
  { id: crypto.randomUUID(), state: 'Madhya Pradesh', cgst: 9, sgst: 9, igst: 18 },
  { id: crypto.randomUUID(), state: 'Punjab', cgst: 6, sgst: 6, igst: 12 },
];

export const initialTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
  id: crypto.randomUUID(),
  status: (['completed', 'pending', 'failed', 'refunded'] as const)[i % 4],
  amountPaid: [999, 2999, 4999, 9999][i % 4],
  quantityPurchased: [1, 2, 5, 10][i % 4],
  taxesPaid: [180, 540, 900, 1800][i % 4],
  planName: ['Basic', 'Standard', 'Premium', 'Enterprise'][i % 4],
  startedAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
  validity: [1, 3, 6, 12][i % 4],
  includedModules: ['Attendance', 'Fee Management', 'Library'].slice(0, (i % 3) + 1),
}));

export const initialUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: crypto.randomUUID(),
  name: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Ross', 'Eve Williams'][i % 5],
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Manager', 'User'][i % 3],
  status: (i % 3 === 0 ? 'inactive' : 'active') as 'active' | 'inactive',
  createdAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
}));
