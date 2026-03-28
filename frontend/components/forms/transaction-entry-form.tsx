"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Form } from "@/components/forms/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";

export function TransactionEntryForm({ transactionType, warehouses, products, parties, partyField, onSaved }: { transactionType: "PURCHASE" | "USAGE"; warehouses: Array<{ label: string; value: string }>; products: Array<{ label: string; value: string }>; parties: Array<{ label: string; value: string }>; partyField: "supplierId" | "customerId"; onSaved?: () => void; }) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.value ?? "");
  const [productId, setProductId] = useState(products[0]?.value ?? "");
  const [quantity, setQuantity] = useState("1");
  const [pricePerUnit, setPricePerUnit] = useState("0");
  const [partyId, setPartyId] = useState(parties[0]?.value ?? "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!warehouseId && warehouses[0]?.value) setWarehouseId(warehouses[0].value);
  }, [warehouseId, warehouses]);

  useEffect(() => {
    if (!productId && products[0]?.value) setProductId(products[0].value);
  }, [productId, products]);

  useEffect(() => {
    if (!partyId && parties[0]?.value) setPartyId(parties[0].value);
  }, [parties, partyId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.createTransaction({
        type: transactionType,
        warehouseId,
        notes,
        [partyField]: partyId || null,
        items: [{ productId, quantity: Number(quantity), pricePerUnit: Number(pricePerUnit) }]
      });
      setQuantity("1");
      setPricePerUnit("0");
      setNotes("");
      showToast("Transaction saved successfully", "success");
      onSaved?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save transaction", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-white/95">
      <Form onSubmit={submit}>
        <Dropdown label={t("warehouse", language)} options={warehouses} value={warehouseId} onChange={setWarehouseId} searchPlaceholder="Select warehouse" />
        <Dropdown options={products} value={productId} onChange={setProductId} searchPlaceholder={t("selectProduct", language)} />
        <Input type="number" step="0.001" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Input type="number" step="0.01" placeholder="Price per unit" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} />
        <Dropdown options={parties} value={partyId} onChange={setPartyId} searchPlaceholder={t("selectName", language)} />
        <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button type="submit" loading={saving} loadingText="Saving...">Save Entry</Button>
      </Form>
    </Card>
  );
}
