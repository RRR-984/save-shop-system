import { l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, X, a3 as MessageCircle, a4 as Download, B as Button } from "./index-Bt77HP0S.js";
import { P as Printer } from "./printer-CuzNdr5X.js";
function buildInvoiceHTML(invoice, shopName, dateStr) {
  const due = invoice.dueAmount ?? invoice.totalAmount - invoice.paidAmount;
  const subtotal = invoice.items.reduce(
    (s, item) => s + item.quantity * item.sellingRate,
    0
  );
  const hasCharges = (invoice.transportCharge ?? 0) > 0 || (invoice.labourCharge ?? 0) > 0 || (invoice.otherCharges ?? 0) > 0;
  const itemRows = invoice.items.map(
    (item) => `
      <tr>
        <td style="text-align:left;padding:2px 4px;word-break:break-word;">${item.productName}</td>
        <td style="text-align:right;padding:2px 4px;">${item.quantity}</td>
        <td style="text-align:right;padding:2px 4px;">Rs.${item.sellingRate}</td>
        <td style="text-align:right;padding:2px 4px;">Rs.${item.quantity * item.sellingRate}</td>
      </tr>`
  ).join("");
  const chargeRows = hasCharges ? `
    <hr style="border:none;border-top:1px dashed #000;margin:4px 0;" />
    ${(invoice.transportCharge ?? 0) > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin:2px 0;"><span>Transportation</span><span>Rs.${invoice.transportCharge}</span></div>` : ""}
    ${(invoice.labourCharge ?? 0) > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin:2px 0;"><span>Labour</span><span>Rs.${invoice.labourCharge}</span></div>` : ""}
    ${(invoice.otherCharges ?? 0) > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin:2px 0;"><span>Other Charges</span><span>Rs.${invoice.otherCharges}</span></div>` : ""}
    <div style="display:flex;justify-content:space-between;font-size:11px;margin:2px 0;"><span>Subtotal (items)</span><span>Rs.${subtotal}</span></div>
    ` : "";
  const dueRow = due > 0 ? `<div style="display:flex;justify-content:space-between;font-weight:bold;color:#c00;">
           <span>Balance Due</span><span>Rs.${due}</span>
         </div>` : `<div style="text-align:center;font-weight:bold;margin-top:4px;">*** FULLY PAID ***</div>`;
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
  ${chargeRows}
  <div class="totals">
    <div class="total-main"><span>GRAND TOTAL</span><span>Rs.${invoice.totalAmount}</span></div>
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
  <\/script>
</body>
</html>`;
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function InvoiceShareModal({
  invoice,
  onClose
}) {
  const { appConfig } = useStore();
  const { currentShop, session } = useAuth();
  const shopName = appConfig.shopName ?? (currentShop == null ? void 0 : currentShop.name) ?? (session == null ? void 0 : session.shopName) ?? "Save Shop System";
  const overlayRef = reactExports.useRef(null);
  const due = invoice.dueAmount ?? invoice.totalAmount - invoice.paidAmount;
  const dateStr = formatDate(invoice.date);
  const subtotal = invoice.items.reduce(
    (s, item) => s + item.quantity * item.sellingRate,
    0
  );
  const hasCharges = (invoice.transportCharge ?? 0) > 0 || (invoice.labourCharge ?? 0) > 0 || (invoice.otherCharges ?? 0) > 0;
  reactExports.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }
  function handleWhatsApp() {
    var _a;
    const itemLines = invoice.items.map(
      (item) => `  • ${item.productName} × ${item.quantity} @ ₹${item.sellingRate} = ₹${item.quantity * item.sellingRate}`
    ).join("\n");
    const chargeLines = [];
    if ((invoice.transportCharge ?? 0) > 0)
      chargeLines.push(`  🚛 Transportation: ₹${invoice.transportCharge}`);
    if ((invoice.labourCharge ?? 0) > 0)
      chargeLines.push(`  👷 Labour: ₹${invoice.labourCharge}`);
    if ((invoice.otherCharges ?? 0) > 0)
      chargeLines.push(`  📦 Other: ₹${invoice.otherCharges}`);
    const lines = [
      `🧾 *Invoice #${invoice.invoiceNumber}*`,
      `📅 Date: ${dateStr}`,
      `👤 Customer: ${invoice.customerName}`,
      "",
      "📦 *Items:*",
      itemLines,
      ...chargeLines.length > 0 ? ["", "➕ *Extra Charges:*", ...chargeLines] : [],
      "",
      ...hasCharges ? [
        `📋 Subtotal: ₹${subtotal}`,
        `💰 *Grand Total: ₹${invoice.totalAmount}*`
      ] : [`💰 *Total: ₹${invoice.totalAmount}*`],
      `✅ Paid: ₹${invoice.paidAmount}`,
      ...due > 0 ? [`⚠️ Due: ₹${due}`] : [],
      "",
      "Thank you for shopping with us! 🙏",
      shopName
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const mobile = (_a = invoice.customerMobile) == null ? void 0 : _a.replace(/\D/g, "");
    const url = mobile && mobile.length === 10 ? `https://wa.me/91${mobile}?text=${text}` : `https://wa.me/?text=${text}`;
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: overlayRef,
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { backgroundColor: "rgba(0,0,0,0.55)" },
      onClick: handleOverlayClick,
      "aria-label": "Invoice sharing options",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border animate-bounce-in",
          style: { maxHeight: "90vh", overflowY: "auto" },
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 pt-5 pb-3 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-foreground", children: "🧾 Invoice Ready" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  "#",
                  invoice.invoiceNumber,
                  " · ",
                  invoice.customerName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": "Close",
                  className: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16, className: "text-muted-foreground" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 rounded-xl px-4 py-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground", children: shopName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  "Invoice #",
                  invoice.invoiceNumber
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: dateStr })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Customer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: invoice.customerName })
              ] }),
              invoice.customerMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Mobile" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: invoice.customerMobile })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto_auto_auto] text-[10px] font-semibold text-muted-foreground uppercase bg-muted/40 px-3 py-1.5 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Item" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Qty" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Rate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Amt" })
                ] }),
                invoice.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "grid grid-cols-[1fr_auto_auto_auto] text-xs px-3 py-2 gap-2 border-t border-border/50",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium truncate", children: item.productName }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-muted-foreground", children: item.quantity }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-right text-muted-foreground", children: [
                        "₹",
                        item.sellingRate
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-right font-semibold text-foreground", children: [
                        "₹",
                        item.quantity * item.sellingRate
                      ] })
                    ]
                  },
                  item.productId
                ))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-1", children: [
                hasCharges && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                    "₹",
                    subtotal
                  ] })
                ] }),
                (invoice.transportCharge ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "🚛 Transportation" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                    "+₹",
                    invoice.transportCharge
                  ] })
                ] }),
                (invoice.labourCharge ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "👷 Labour" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                    "+₹",
                    invoice.labourCharge
                  ] })
                ] }),
                (invoice.otherCharges ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "📦 Other Charges" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                    "+₹",
                    invoice.otherCharges
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-base text-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hasCharges ? "Grand Total" : "Total" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "₹",
                    invoice.totalAmount
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Paid" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-green-600", children: [
                    "₹",
                    invoice.paidAmount
                  ] })
                ] }),
                due > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Balance Due" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-red-600", children: [
                    "₹",
                    due
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 text-green-600 text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "✅ Fully Paid" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-5 space-y-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleWhatsApp,
                  "data-ocid": "invoice_share.whatsapp.button",
                  className: "btn-hover w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white",
                  style: {
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 18 }),
                    "Send via WhatsApp"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: handlePrint,
                  "data-ocid": "invoice_share.print.button",
                  className: "btn-hover w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white",
                  style: {
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 18 }),
                    "Print Bill"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleDownloadPDF,
                  "data-ocid": "invoice_share.download_pdf.button",
                  className: "btn-hover w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white",
                  style: {
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 18 }),
                    "Download PDF"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  "data-ocid": "invoice_share.done.button",
                  className: "w-full h-10 text-sm font-medium",
                  onClick: onClose,
                  children: "Done"
                }
              )
            ] })
          ]
        }
      )
    }
  ) });
}
export {
  InvoiceShareModal as I
};
