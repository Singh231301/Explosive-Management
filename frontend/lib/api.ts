import type { BillingReport, DashboardData, InventoryRow, PaginatedTransactions, Party, Product, ReportsData, SessionUser, TransactionRecord, Warehouse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const TOKEN_KEY = "explosive_token";
const USER_KEY = "explosive_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(USER_KEY);
  return value ? (JSON.parse(value) as SessionUser) : null;
}

export function saveSession(token: string, user: SessionUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result.data as T;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  login: (payload: { email: string; password: string }) => request<{ token: string; user: SessionUser }>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  dashboard: () => request<DashboardData>("/inventory/dashboard"),
  inventory: () => request<InventoryRow[]>("/inventory"),
  setInventoryLimit: (productId: string, payload: { maxLimit: number | null; lowLimit: number | null }) => request(`/inventory/limits/${productId}`, { method: "PUT", body: JSON.stringify(payload) }),
  products: () => request<Product[]>("/products"),
  createProduct: (payload: { name: string; unit: string; description: string }) => request<Product>("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: { name: string; unit: string; description: string }) => request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id: string) => request<Product>(`/products/${id}`, { method: "DELETE" }),
  suppliers: () => request<Party[]>("/suppliers"),
  supplierTransactions: (id: string, page = 1, pageSize = 10) => request<PaginatedTransactions>(`/suppliers/${id}/transactions?page=${page}&pageSize=${pageSize}`),
  createSupplier: (payload: { name: string; phone?: string; address?: string }) => request<Party>("/suppliers", { method: "POST", body: JSON.stringify(payload) }),
  updateSupplier: (id: string, payload: { name: string; phone?: string; address?: string }) => request<Party>(`/suppliers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSupplier: (id: string) => request<Party>(`/suppliers/${id}`, { method: "DELETE" }),
  customers: () => request<Party[]>("/customers"),
  customerTransactions: (id: string, page = 1, pageSize = 10) => request<PaginatedTransactions>(`/customers/${id}/transactions?page=${page}&pageSize=${pageSize}`),
  createCustomer: (payload: { name: string; phone?: string; address?: string }) => request<Party>("/customers", { method: "POST", body: JSON.stringify(payload) }),
  updateCustomer: (id: string, payload: { name: string; phone?: string; address?: string }) => request<Party>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCustomer: (id: string) => request<Party>(`/customers/${id}`, { method: "DELETE" }),
  warehouses: () => request<Warehouse[]>("/warehouses"),
  createWarehouse: (payload: { name: string; location?: string }) => request<Warehouse>("/warehouses", { method: "POST", body: JSON.stringify(payload) }),
  transactions: () => request<TransactionRecord[]>("/transactions"),
  createTransaction: (payload: unknown) => request<TransactionRecord>("/transactions", { method: "POST", body: JSON.stringify(payload) }),
  updateTransaction: (id: string, payload: unknown) => request<TransactionRecord>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTransaction: (id: string) => request<TransactionRecord>(`/transactions/${id}`, { method: "DELETE" }),
  reports: () => request<ReportsData>("/reports"),
  billingReport: (params: { range?: string; startDate?: string; endDate?: string; partyType?: string; partyId?: string; warehouseId?: string }) => request<BillingReport>(`/reports/billing${toQuery(params)}`)
};

export function apiFileUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

