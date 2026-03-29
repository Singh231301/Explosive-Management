"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.products().then(setProducts).catch(() => undefined);
  }, []);

  async function editProduct(product: Product) {
    try {
      const name = window.prompt("Product name", product.name);
      if (!name) return;
      const unit = window.prompt("Unit (BOX or PIECES)", product.unit) || product.unit;
      const description = window.prompt("Description", product.description || "") || "";
      const updated = await api.updateProduct(product.id, { name, unit, description });
      setProducts((current) => current.map((row) => (row.id === product.id ? updated : row)));
      showToast("Product updated successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update product", "error");
    }
  }

  async function removeProduct() {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      await api.deleteProduct(deleteTarget.id);
      setProducts((current) => current.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Product deleted successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete product", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("products", language)} subtitle={t("productsSubtitle", language)} />
      <ProductForm onSaved={(product) => setProducts((current) => [product, ...current])} />
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="bg-white/95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold">{product.name}</p>
                <p className="text-sm text-slate-500">{product.unit}</p>
                {product.description ? <p className="mt-1 text-sm text-slate-500">{product.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button type="button" className="w-auto min-w-0 bg-slate-900 hover:bg-slate-800" onClick={() => editProduct(product)}>Edit</Button>
                <Button type="button" className="w-auto min-w-0 bg-danger hover:bg-rose-700" onClick={() => setDeleteTarget(product)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={`This will permanently remove ${deleteTarget?.name || "this product"}.`}
        confirmLabel="Delete"
        cancelLabel={t("cancel", language)}
        tone="danger"
        loading={deletingId === deleteTarget?.id}
        onConfirm={removeProduct}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
