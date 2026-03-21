"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Party } from "@/lib/types";

type PartyEditDialogProps = {
  open: boolean;
  title: string;
  saving?: boolean;
  party: Party | null;
  onClose: () => void;
  onSave: (payload: { name: string; phone: string; address: string }) => Promise<void>;
};

export function PartyEditDialog({ open, title, saving = false, party, onClose, onSave }: PartyEditDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!open || !party) return;
    setName(party.name);
    setPhone(party.phone || "");
    setAddress(party.address || "");
  }, [open, party]);

  if (!open || !party) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">Update the details and save the changes.</p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            disabled={saving}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" />
          <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" />
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="button" className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" loading={saving} loadingText="Saving..." onClick={() => void onSave({ name, phone, address })}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
