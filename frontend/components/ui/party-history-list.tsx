"use client";

import { ChevronDown, ChevronRight, Clock3, Package2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PaginatedTransactions, Party, TransactionRecord } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

type PartyHistoryListProps = {
  parties: Party[];
  kind: "supplier" | "customer";
  onEdit: (party: Party) => void;
  onDelete: (party: Party) => void;
  loadTransactions: (partyId: string, page: number) => Promise<PaginatedTransactions>;
};

type HistoryState = {
  data?: PaginatedTransactions;
  loading: boolean;
  error?: string;
};

function getTransactionTone(transactionType: TransactionRecord["type"]) {
  if (transactionType === "PURCHASE") return { label: "+ Buy", className: "bg-emerald-50 text-emerald-700" };
  if (transactionType === "USAGE") return { label: "- Sell", className: "bg-rose-50 text-rose-700" };
  return { label: transactionType, className: "bg-slate-100 text-slate-700" };
}

export function PartyHistoryList({ parties, kind, onEdit, onDelete, loadTransactions }: PartyHistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryState>>({});

  async function openHistory(partyId: string, page = 1) {
    setHistory((current) => ({
      ...current,
      [partyId]: { ...current[partyId], loading: true, error: undefined }
    }));

    try {
      const data = await loadTransactions(partyId, page);
      setHistory((current) => ({
        ...current,
        [partyId]: { data, loading: false }
      }));
    } catch (error) {
      setHistory((current) => ({
        ...current,
        [partyId]: { ...current[partyId], loading: false, error: error instanceof Error ? error.message : "Could not load transactions" }
      }));
    }
  }

  async function toggleParty(partyId: string) {
    if (expandedId === partyId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(partyId);
    if (!history[partyId]?.data) {
      await openHistory(partyId, 1);
    }
  }

  return (
    <div className="space-y-3">
      {parties.map((party) => {
        const isExpanded = expandedId === party.id;
        const state = history[party.id];
        const data = state?.data;

        return (
          <Card key={party.id} className="bg-white/95">
            <div className="flex items-start justify-between gap-4">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => void toggleParty(party.id)}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-slate-100 p-2 text-slate-600">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{party.name}</p>
                    <p className="text-sm text-slate-500">{party.phone || "-"}</p>
                    <p className="mt-1 text-sm text-slate-500">{party.address || "-"}</p>
                  </div>
                </div>
              </button>
              <div className="flex gap-2">
                <Button type="button" className="w-auto min-w-0 bg-slate-900 hover:bg-slate-800" onClick={() => onEdit(party)}>Edit</Button>
                <Button type="button" className="w-auto min-w-0 bg-danger hover:bg-rose-700" onClick={() => onDelete(party)}>Delete</Button>
              </div>
            </div>

            {isExpanded ? (
              <div className="mt-4 rounded-3xl bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{kind === "supplier" ? "Supplier transactions" : "Customer transactions"}</p>
                    <p className="text-xs text-slate-500">Showing 10 records per page</p>
                  </div>
                  {data ? <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{data.total} total</span> : null}
                </div>

                {state?.loading ? <p className="text-sm text-slate-500">Loading transactions...</p> : null}
                {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
                {!state?.loading && data && !data.items.length ? <p className="text-sm text-slate-500">No transactions found.</p> : null}

                {data?.items?.length ? (
                  <div className="space-y-3">
                    {data.items.map((transaction) => {
                      const tone = getTransactionTone(transaction.type);
                      return (
                        <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-ink">{transaction.referenceNo}</p>
                              <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-ink">{formatNumber(transaction.totalQuantity || 0)}</p>
                              <p className="text-xs text-slate-500">Total Qty</p>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-600">
                            {transaction.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <Package2 size={14} className="text-slate-400" />
                                  <span>{item.product.name}</span>
                                </div>
                                <span className="font-semibold text-ink">{formatNumber(item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1"><Clock3 size={13} /> Created {formatDate(transaction.createdAt)}</span>
                            <span>Updated {formatDate(transaction.updatedAt)}</span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Button type="button" className="w-auto bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900" onClick={() => void openHistory(party.id, Math.max(1, (data?.page || 1) - 1))} disabled={!data || data.page <= 1 || state?.loading}>
                        Previous
                      </Button>
                      <p className="text-xs font-semibold text-slate-500">Page {data.page} of {data.totalPages}</p>
                      <Button type="button" className="w-auto bg-slate-900 hover:bg-slate-800" onClick={() => void openHistory(party.id, Math.min(data.totalPages, data.page + 1))} disabled={!data || data.page >= data.totalPages || state?.loading}>
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
