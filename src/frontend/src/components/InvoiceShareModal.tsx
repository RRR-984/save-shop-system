import { Button } from "@/components/ui/button";
import { Download, MessageCircle, Printer, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";
import type { Invoice } from "../types/store";

function buildInvoiceHTML(
  invoice: Invoice,
  shopName: string,
  dateStr: string,
): string {
  const due = invoice.dueAmount ?? invoice.totalAmount - invoice.paidAmount;

  const itemRows = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="text-align:left;padding:2px 4px;word-break:break-word;">${item.productName}</td>
        <td style="text-align:right;padding:2px 4px;">${item.quantity}</td>
        <td style="text-align:right;padding:2px 4px;">Rs.${item.sellingRate}</td>
        <td style="text-align:right;padding:2px 4px;">Rs.${item.quantity * item.sellingRate}</td>
      </tr>`,
    )
    .join("");

  const dueRow =
    due > 0
      ? `<div style="display:flex;justify-content:space-between;font-weight:bold;color:#c00;">
           <span>Balance Due</span><span>Rs.${due}</span>
         </div>`
      : `<div style="text-align:center;font-weight:bold;margin-top:4px;">*** FULLY PAID ***</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Invoice #${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      width: 80mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 8px;
    }
    .header { text-align: center; margin-bottom: 6px; }
    .shop-name { font-size: 15px; font-weight: bold; letter-spacing: 0.5px; }
    .tax-invoice { font-size: 11px; margin-top: 2px; }
    .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { font-weight: bold; padding: 2px 4px; border-bottom: 1px solid #000; }
    th:first-child, td:first-child { text-align: left; }
    th:not(:first-child), td:not(:first-child) { text-align: right; }
    .totals { margin-top: 4px; font-size: 12px; }
    .total-main { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; border-top: 2px solid #000; padding-top: 4px; margin-bottom: 3px; }
    .total-row { display: flex; justify-content: space-between; margin: 2px 0; }
    .footer { text-align: center; margin-top: 10px; font-size: 10px; }
    @media print {
      body { width: 80mm; }
      @page { size: 80mm auto; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">${shopName}</div>
    <div class="tax-invoice">TAX INVOICE</div>
  </div>
  <hr class="divider" />
  <div class="info-row"><span>Invoice #</span><span>${invoice.invoiceNumber}</span></div>
  <div class="info-row"><span>Date</span><span>${dateStr}</span></div>
  <div class="info-row"><span>Customer</span><span>${invoice.customerName}</span></div>
  ${invoice.customerMobile ? `<div class="info-row"><span>Mobile</span><span>${invoice.customerMobile}</span></div>` : ""}
  <div class="info-row"><span>Payment</span><span>${invoice.paymentMode.toUpperCase()}</span></div>
  <hr class="divider" />
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amt</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <hr class="divider" />
  <div class="totals">
    <div class="total-main"><span>TOTAL</span><span>Rs.${invoice.totalAmount}</span></div>
    <div class="total-row"><span>Paid</span><span>Rs.${invoice.paidAmount}</span></div>
    ${dueRow}
  </div>
  <hr class="divider" />
  <div class="footer">
    <div>--------------------------------</div>
    <div>Thank you for your business!</div>
    <div style="font-weight:bold;margin-top:2px;">${shopName}</div>
    <div style="margin-top:2px;">${dateStr}</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;
}

interface InvoiceShareModalProps {
  invoice: Invoice;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function InvoiceShareModal({
  invoice,
  onClose,
}: InvoiceShareModalProps) {
  const { appConfig } = useStore();
  const shopName = appConfig.shopName ?? "Save Shop System";
  const overlayRef = useRef<HTMLDivElement>(null);

  const due = invoice.dueAmount ?? invoice.totalAmount - invoice.paidAmount;
  const dateStr = formatDate(invoice.date);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleWhatsApp() {
    const itemLines = invoice.items
      .map(
        (item) =>
          `  • ${item.productName} × ${item.quantity} @ ₹${item.sellingRate} = ₹${item.quantity * item.sellingRate}`,
      )
      .join("\n");

    const lines = [
      `🧾 *Invoice #${invoice.invoiceNumber}*`,
      `📅 Date: ${dateStr}`,
      `👤 Customer: ${invoice.customerName}`,
      "",
      "📦 *Items:*",
      itemLines,
      "",
      `💰 *Total: ₹${invoice.totalAmount}*`,
      `✅ Paid: ₹${invoice.paidAmount}`,
      ...(due > 0 ? [`⚠️ Due: ₹${due}`] : []),
      "",
      "Thank you for shopping with us! 🙏",
      shopName,
    ];

    const text = encodeURIComponent(lines.join("\n"));
    const mobile = invoice.customerMobile?.replace(/\D/g, "");
    const url =
      mobile && mobile.length === 10
        ? `https://wa.me/91${mobile}?text=${text}`
        : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  function openInvoiceWindow() {
    const html = buildInvoiceHTML(invoice, shopName, dateStr);
    const printWin = window.open("", "_blank", "width=420,height=650");
    if (!printWin) {
      alert("Please allow popups for this site to print/download the invoice.");
      return;
    }
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }

  function handlePrint() {
    openInvoiceWindow();
  }

  function handleDownloadPDF() {
    openInvoiceWindow();
  }

  return (
    <>
      {/* Modal overlay */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click to close */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={handleOverlayClick}
        aria-label="Invoice sharing options"
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation helper */}
        <div
          className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border animate-bounce-in"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-foreground">
                🧾 Invoice Ready
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                #{invoice.invoiceNumber} · {invoice.customerName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Invoice summary */}
          <div className="px-5 py-4 space-y-3">
            {/* Invoice header block */}
            <div className="bg-primary/5 rounded-xl px-4 py-3 text-center">
              <div className="font-bold text-sm text-foreground">
                {shopName}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Invoice #{invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-muted-foreground">{dateStr}</div>
            </div>

            {/* Customer row */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">
                {invoice.customerName}
              </span>
            </div>
            {invoice.customerMobile && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mobile</span>
                <span className="text-foreground">
                  {invoice.customerMobile}
                </span>
              </div>
            )}

            {/* Items list */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] font-semibold text-muted-foreground uppercase bg-muted/40 px-3 py-1.5 gap-2">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amt</span>
              </div>
              {invoice.items.map((item) => (
                <div
                  key={item.productId}
                  className="grid grid-cols-[1fr_auto_auto_auto] text-xs px-3 py-2 gap-2 border-t border-border/50"
                >
                  <span className="text-foreground font-medium truncate">
                    {item.productName}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {item.quantity}
                  </span>
                  <span className="text-right text-muted-foreground">
                    ₹{item.sellingRate}
                  </span>
                  <span className="text-right font-semibold text-foreground">
                    ₹{item.quantity * item.sellingRate}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-bold text-base text-foreground">
                <span>Total</span>
                <span>₹{invoice.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-green-600">
                  ₹{invoice.paidAmount}
                </span>
              </div>
              {due > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance Due</span>
                  <span className="font-bold text-red-600">₹{due}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <span>✅ Fully Paid</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 pb-5 space-y-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              data-ocid="invoice_share.whatsapp.button"
              className="btn-hover w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              }}
            >
              <MessageCircle size={18} />
              Send via WhatsApp
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              data-ocid="invoice_share.print.button"
              className="btn-hover w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              }}
            >
              <Printer size={18} />
              Print Bill
            </button>

            {/* Download PDF (browser print-to-PDF) */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              data-ocid="invoice_share.download_pdf.button"
              className="btn-hover w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              }}
            >
              <Download size={18} />
              Download PDF
            </button>

            {/* Done */}
            <Button
              variant="outline"
              data-ocid="invoice_share.done.button"
              className="w-full h-10 text-sm font-medium"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
