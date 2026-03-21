"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/forms/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/components/layout/toast-provider";
import type { Party } from "@/lib/types";

export function MasterDataForm({ resource, title, placeholders, onSaved }: { resource: "suppliers" | "customers"; title: string; placeholders: { name: string; phone?: string; address?: string }; onSaved: (party: Party) => void; }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name, phone, address };
      const saved = resource === "suppliers" ? await api.createSupplier(payload) : await api.createCustomer(payload);
      setName("");
      setPhone("");
      setAddress("");
      showToast("Saved successfully", "success");
      onSaved(saved);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-white/95">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <Form onSubmit={submit}>
        <Input placeholder={placeholders.name} value={name} onChange={(e) => setName(e.target.value)} />
        {placeholders.phone ? <Input placeholder={placeholders.phone} value={phone} onChange={(e) => setPhone(e.target.value)} /> : null}
        {placeholders.address ? <Input placeholder={placeholders.address} value={address} onChange={(e) => setAddress(e.target.value)} /> : null}
        <Button type="submit" loading={saving} loadingText="Saving...">Save</Button>
      </Form>
    </Card>
  );
}
