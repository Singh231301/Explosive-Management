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

export type Warehouse = {
  id: string;
  name: string;
  location?: string | null;
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
  updatedAt: string;
  supplierId?: string | null;
  customerId?: string | null;
  supplierName?: string | null;
  customerName?: string | null;
  notes?: string | null;
  warehouseId?: string;
  warehouseName?: string | null;
  totalQuantity?: number;
  totalAmount?: number;
  items: TransactionItem[];
};

export type PaginatedTransactions = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: TransactionRecord[];
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

export type BillingReport = {
  filters: {
    range: string;
    startDate: string;
    endDate: string;
    label: string;
    partyType: string;
    partyName: string;
    warehouseId?: string;
    warehouseName?: string;
  };
  summary: {
    totalTransactions: number;
    totalQuantity: number;
    totalDebit: number;
    totalCredit: number;
    netAmount: number;
  };
  transactions: TransactionRecord[];
};
