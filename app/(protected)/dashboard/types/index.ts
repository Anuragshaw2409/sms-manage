export interface Plan {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  validity: number;
  includedModules: string[];
  numberOfSchools: number;
  pagePermissions: string[];
  routesPermissions: string[];
  isActive: boolean;
}

export interface Tax {
  id: string;
  state: string;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface Transaction {
  id: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  amountPaid: number;
  quantityPurchased: number;
  taxesPaid: number;
  planName: string;
  startedAt: string;
  validity: number;
  includedModules: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
