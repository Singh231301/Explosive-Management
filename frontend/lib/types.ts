export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Product = {
  id: string;
  name: string;
  unit: string;
  description?: string | null;
};

export type Party = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
};

export type InventoryRow = {
  id: string;
  productId: string;
  productName: string;
  warehouseName: string;
  unit: string;
  quantity: number;
  lowLimit: number;
  maxLimit: number | null;
  isLowStock: boolean;
  isOverLimit: boolean;
  updatedAt: string;
};

export type TransactionItem = {
  id: string;
  productId?: string;
  quantity: number;
  pricePerUnit?: number;
  product: { name: string };
};

export type TransactionRecord = {
  id: string;
  type: string;
  referenceNo: string;
  createdAt: string;
  supplierId?: string | null;
  customerId?: string | null;
  notes?: string | null;
  warehouseId?: string;
  totalQuantity?: number;
  items: TransactionItem[];
};

export type DashboardData = {
  recentTransactions: TransactionRecord[];
};

export type ReportsData = {
  dailyCount: number;
  monthlyCount: number;
  financialLedger: Array<{ debit: number; credit: number }>;
  inventory: Array<{ id: string; quantity: number; product: { name: string } }>;
};
