"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

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

  async function removeProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      setProducts((current) => current.filter((row) => row.id !== id));
      showToast("Product deleted successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete product", "error");
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
                <Button type="button" className="w-auto bg-slate-900 px-3 py-2" onClick={() => editProduct(product)}>Edit</Button>
                <Button type="button" className="w-auto bg-danger px-3 py-2" onClick={() => removeProduct(product.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
