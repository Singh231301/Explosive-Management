"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionEntryForm } from "@/components/forms/transaction-entry-form";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Party, Product } from "@/lib/types";

export default function PurchasePage() {
  useRequireAuth();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);

  useEffect(() => {
    Promise.all([api.products(), api.suppliers()]).then(([allProducts, allSuppliers]) => {
      setProducts(allProducts);
      setSuppliers(allSuppliers);
    }).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title={t("purchaseTitle", language)} subtitle={t("purchaseSubtitle", language)} />
      <TransactionEntryForm transactionType="PURCHASE" warehouseId="default-warehouse" products={products.map((row) => ({ label: row.name, value: row.id }))} parties={suppliers.map((row) => ({ label: row.name, value: row.id }))} partyField="supplierId" />
    </div>
  );
}
