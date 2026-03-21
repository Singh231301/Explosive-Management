"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Form } from "@/components/forms/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";

export function TransactionEntryForm({ transactionType, warehouseId, products, parties, partyField, onSaved }: { transactionType: "PURCHASE" | "USAGE"; warehouseId: string; products: Array<{ label: string; value: string }>; parties: Array<{ label: string; value: string }>; partyField: "supplierId" | "customerId"; onSaved?: () => void; }) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [productId, setProductId] = useState(products[0]?.value ?? "");
  const [quantity, setQuantity] = useState("1");
  const [pricePerUnit, setPricePerUnit] = useState("0");
  const [partyId, setPartyId] = useState(parties[0]?.value ?? "");
  const [notes, setNotes] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
    }
  }

  return (
    <Card className="bg-white/95">
      <Form onSubmit={submit}>
        <Dropdown options={products} value={productId} onChange={setProductId} searchPlaceholder={t("selectProduct", language)} />
        <Input type="number" step="0.001" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Input type="number" step="0.01" placeholder="Price per unit" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} />
        <Dropdown options={parties} value={partyId} onChange={setPartyId} searchPlaceholder={t("selectName", language)} />
        <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button type="submit">Save Entry</Button>
      </Form>
    </Card>
  );
}
