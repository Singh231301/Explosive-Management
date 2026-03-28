"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionEntryForm } from "@/components/forms/transaction-entry-form";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Party, Product, Warehouse } from "@/lib/types";

export default function UsagePage() {
  useRequireAuth();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Party[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    Promise.all([api.products(), api.customers(), api.warehouses()]).then(([allProducts, allCustomers, allWarehouses]) => {
      setProducts(allProducts);
      setCustomers(allCustomers);
      setWarehouses(allWarehouses);
    }).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title={t("usageTitle", language)} subtitle={t("usageSubtitle", language)} />
      <TransactionEntryForm
        transactionType="USAGE"
        warehouses={warehouses.map((row) => ({ label: row.name, value: row.id }))}
        products={products.map((row) => ({ label: row.name, value: row.id }))}
        parties={customers.map((row) => ({ label: row.name, value: row.id }))}
        partyField="customerId"
      />
    </div>
  );
}
