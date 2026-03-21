"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/forms/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/components/layout/toast-provider";
import type { Product } from "@/lib/types";

export function ProductForm({ onSaved }: { onSaved: (product: Product) => void }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("PIECES");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const product = await api.createProduct({ name, unit, description });
      setName("");
      setDescription("");
      showToast("Product saved successfully", "success");
      onSaved(product);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save product", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-white/95">
      <h2 className="text-lg font-bold text-ink">Add Product</h2>
      <Form onSubmit={submit}>
        <Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="h-11 w-full rounded-xl border border-brand-100 bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-200" value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="PIECES">Pieces</option>
          <option value="BOX">Box</option>
        </select>
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit" loading={saving} loadingText="Saving...">Save Product</Button>
      </Form>
    </Card>
  );
}
