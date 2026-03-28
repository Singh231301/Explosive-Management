import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { startOfDay, startOfMonth } from "@/utils/date";
import { prisma } from "@/db/prisma";
import { mapTransactionRecord } from "@/services/transaction-service";

type BillingQuery = {
  range?: string;
  startDate?: string;
  endDate?: string;
  partyType?: string;
  partyId?: string;
};

type ResolvedBillingReport = Awaited<ReturnType<typeof buildBillingReport>>;

type BillingLineItem = {
  serial: number;
  name: string;
  quantity: number;
  price: number;
  amount: number;
};

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function resolveRange(range = "this_month", startDate?: string, endDate?: string) {
  const now = new Date();

  if (range === "last_week") {
    return { start: startOfDay(addDays(now, -6)), end: endOfDay(now), label: "Last 7 Days" };
  }

  if (range === "last_month") {
    return { start: startOfDay(addDays(now, -29)), end: endOfDay(now), label: "Last 30 Days" };
  }

  if (range === "last_year") {
    return { start: startOfDay(addDays(now, -364)), end: endOfDay(now), label: "Last 365 Days" };
  }

  if (range === "custom" && startDate && endDate) {
    return {
      start: startOfDay(new Date(startDate)),
      end: endOfDay(new Date(endDate)),
      label: `Custom Range (${startDate} to ${endDate})`
    };
  }

  return { start: startOfMonth(now), end: endOfDay(now), label: "This Month" };
}

async function resolvePartyLabel(partyType?: string, partyId?: string) {
  if (partyType === "supplier" && partyId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: partyId } });
    return supplier?.name || "Selected Supplier";
  }

  if (partyType === "customer" && partyId) {
    const customer = await prisma.customer.findUnique({ where: { id: partyId } });
    return customer?.name || "Selected Customer";
  }

  return "All Parties";
}

function formatDateLabel(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(value: number) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return `Rs. ${formatted.replace(/[^\d,.-]/g, "").trim()}`;
}

function buildLineItems(report: ResolvedBillingReport): BillingLineItem[] {
  let serial = 0;

  return report.transactions.flatMap((transaction) =>
    transaction.items.map((item) => {
      serial += 1;
      return {
        serial,
        name: item.product.name,
        quantity: Number(item.quantity || 0),
        price: Number(item.pricePerUnit || 0),
        amount: Number(item.quantity || 0) * Number(item.pricePerUnit || 0)
      };
    })
  );
}

function splitText(text: string, maxLength: number) {
  const trimmed = text.trim();
  if (!trimmed) return [""];

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

async function buildBillingReport(query: BillingQuery) {
  const range = resolveRange(query.range, query.startDate, query.endDate);
  const where = {
    deletedAt: null,
    createdAt: { gte: range.start, lte: range.end },
    ...(query.partyType === "supplier" && query.partyId ? { supplierId: query.partyId } : {}),
    ...(query.partyType === "customer" && query.partyId ? { customerId: query.partyId } : {})
  };

  const transactions = await prisma.transaction.findMany({
    where,
    include: { items: { include: { product: true } }, supplier: true, customer: true, financialLedger: true },
    orderBy: { createdAt: "desc" }
  });

  const mappedTransactions = transactions.map((row) => {
    const base = mapTransactionRecord(row);
    const ledger = row.financialLedger[0];
    const computedAmount = base.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.pricePerUnit || 0), 0);
    const ledgerAmount = Number(ledger?.debit || ledger?.credit || 0);
    return {
      ...base,
      totalAmount: ledgerAmount || computedAmount
    };
  });

  const totalQuantity = mappedTransactions.reduce((sum, row) => sum + Number(row.totalQuantity || 0), 0);
  const totalDebit = mappedTransactions
    .filter((row) => row.type === "PURCHASE")
    .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
  const totalCredit = mappedTransactions
    .filter((row) => row.type === "USAGE")
    .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
  const partyName = await resolvePartyLabel(query.partyType, query.partyId);

  return {
    filters: {
      range: query.range || "this_month",
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
      label: range.label,
      partyType: query.partyType || "all",
      partyName
    },
    summary: {
      totalTransactions: mappedTransactions.length,
      totalQuantity,
      totalDebit,
      totalCredit,
      netAmount: totalDebit - totalCredit
    },
    transactions: mappedTransactions
  };
}

function drawHeader(page: import("pdf-lib").PDFPage, boldFont: import("pdf-lib").PDFFont, font: import("pdf-lib").PDFFont, report: ResolvedBillingReport, pageNumber: number) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 40, width: 130, height: 40, color: rgb(0.1, 0.48, 0.78) });
  page.drawText(pageNumber === 1 ? "Statement" : `Statement ${pageNumber}`, { x: 24, y: height - 24, size: 16, font: boldFont, color: rgb(1, 1, 1) });

  page.drawText("BILL STATEMENT", { x: 180, y: height - 82, size: 24, font: boldFont, color: rgb(0.07, 0.1, 0.18) });
  page.drawText(`Party: ${report.filters.partyName}`, { x: 50, y: height - 116, size: 12, font: boldFont, color: rgb(0.07, 0.1, 0.18) });
  page.drawText(`Range: ${report.filters.label}`, { x: 50, y: height - 134, size: 11, font, color: rgb(0.28, 0.33, 0.4) });
  page.drawText(`From: ${formatDateLabel(report.filters.startDate)}`, { x: 50, y: height - 152, size: 11, font, color: rgb(0.28, 0.33, 0.4) });
  page.drawText(`To: ${formatDateLabel(report.filters.endDate)}`, { x: 220, y: height - 152, size: 11, font, color: rgb(0.28, 0.33, 0.4) });
  page.drawText(`Generated: ${formatDateLabel(new Date().toISOString())}`, { x: width - 170, y: height - 116, size: 11, font, color: rgb(0.28, 0.33, 0.4) });

  page.drawLine({ start: { x: 40, y: height - 170 }, end: { x: width - 40, y: height - 170 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) });
  page.drawText("SN", { x: 44, y: height - 190, size: 11, font: boldFont });
  page.drawText("Item", { x: 84, y: height - 190, size: 11, font: boldFont });
  page.drawText("Qty", { x: 330, y: height - 190, size: 11, font: boldFont });
  page.drawText("Price", { x: 390, y: height - 190, size: 11, font: boldFont });
  page.drawText("Amt", { x: width - 88, y: height - 190, size: 11, font: boldFont });
  page.drawLine({ start: { x: 40, y: height - 198 }, end: { x: width - 40, y: height - 198 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) });
}

export async function getReports() {
  const now = new Date();
  const [dailyCount, monthlyCount, financialLedger, inventory] = await Promise.all([
    prisma.transaction.count({ where: { createdAt: { gte: startOfDay(now) }, deletedAt: null } }),
    prisma.transaction.count({ where: { createdAt: { gte: startOfMonth(now) }, deletedAt: null } }),
    prisma.financialLedger.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.inventory.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } })
  ]);

  return {
    dailyCount,
    monthlyCount,
    financialLedger: financialLedger.map((row) => ({ debit: Number(row.debit), credit: Number(row.credit) })),
    inventory: inventory.map((row) => ({ id: row.id, quantity: Number(row.quantity), product: { name: row.product.name } }))
  };
}

export async function getBillingReport(query: BillingQuery) {
  return buildBillingReport(query);
}

export async function getBillingReportPdf(query: BillingQuery) {
  const report = await buildBillingReport(query);
  const lineItems = buildLineItems(report);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [595.28, 841.89];
  let page = pdf.addPage(pageSize);
  let pageNumber = 1;
  drawHeader(page, boldFont, font, report, pageNumber);

  const { width, height } = page.getSize();
  let y = height - 230;
  const rowHeight = 20;

  for (const item of lineItems) {
    const nameLines = splitText(item.name, 28);
    const requiredHeight = Math.max(rowHeight, nameLines.length * 14 + 8);

    if (y - requiredHeight < 160) {
      page = pdf.addPage(pageSize);
      pageNumber += 1;
      drawHeader(page, boldFont, font, report, pageNumber);
      y = height - 230;
    }

    page.drawText(String(item.serial), { x: 44, y, size: 11, font, color: rgb(0.07, 0.1, 0.18) });
    nameLines.forEach((line, index) => {
      page.drawText(line, { x: 84, y: y - index * 14, size: 11, font, color: rgb(0.07, 0.1, 0.18) });
    });
    page.drawText(String(item.quantity), { x: 330, y, size: 11, font, color: rgb(0.07, 0.1, 0.18) });
    page.drawText(item.price.toFixed(2), { x: 390, y, size: 11, font, color: rgb(0.07, 0.1, 0.18) });
    page.drawText(item.amount.toFixed(2), { x: width - 88, y, size: 11, font, color: rgb(0.07, 0.1, 0.18) });
    y -= requiredHeight;
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  if (y < 220) {
    page = pdf.addPage(pageSize);
    pageNumber += 1;
    drawHeader(page, boldFont, font, report, pageNumber);
    y = height - 230;
  }

  const summaryTop = y - 10;
  page.drawLine({ start: { x: 40, y: summaryTop + 20 }, end: { x: width - 40, y: summaryTop + 20 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) });
  page.drawText("Subtotal", { x: 44, y: summaryTop, size: 12, font: boldFont });
  page.drawText(String(report.summary.totalQuantity), { x: 330, y: summaryTop, size: 12, font: boldFont });
  page.drawText(formatMoney(subtotal), { x: width - 150, y: summaryTop, size: 12, font: boldFont });
  page.drawLine({ start: { x: 40, y: summaryTop - 12 }, end: { x: width - 40, y: summaryTop - 12 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) });

  const summaryRows = [
    { label: "Total Buy", value: formatMoney(report.summary.totalDebit) },
    { label: "Total Sell", value: formatMoney(report.summary.totalCredit) },
    { label: "Net Amount", value: formatMoney(report.summary.netAmount) },
    { label: "Transactions", value: String(report.summary.totalTransactions) }
  ];

  let summaryY = summaryTop - 42;
  for (const row of summaryRows) {
    page.drawText(row.label, { x: 330, y: summaryY, size: 11, font, color: rgb(0.28, 0.33, 0.4) });
    page.drawText(row.value, { x: width - 150, y: summaryY, size: 11, font: boldFont, color: rgb(0.07, 0.1, 0.18) });
    summaryY -= 24;
  }

  page.drawLine({ start: { x: 40, y: summaryY + 8 }, end: { x: width - 40, y: summaryY + 8 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) });
  page.drawText("TOTAL", { x: 44, y: summaryY - 16, size: 16, font: boldFont, color: rgb(0.07, 0.1, 0.18) });
  page.drawText(formatMoney(subtotal), { x: width - 150, y: summaryY - 16, size: 16, font: boldFont, color: rgb(0.07, 0.1, 0.18) });
  page.drawLine({ start: { x: 40, y: summaryY - 26 }, end: { x: width - 40, y: summaryY - 26 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) });
  page.drawText("Thank You", { x: 250, y: 50, size: 16, font: boldFont, color: rgb(0.1, 0.48, 0.78) });

  return pdf.save();
}
