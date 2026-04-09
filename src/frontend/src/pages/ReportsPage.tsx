import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Banknote,
  BarChart2,
  CreditCard,
  FileText,
  IndianRupee,
  Package,
  Plus,
  Smartphone,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
import type { NavPage } from "../types/store";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string) {
  const today = getToday();
  const yesterday = getYesterday();
  if (dateStr === today) return "Aaj (Today)";
  if (dateStr === yesterday) return "Kal (Yesterday)";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReportsPage({
  onNavigate,
}: { onNavigate?: (page: NavPage) => void }) {
  const {
    invoices,
    products,
    getProductStock,
    getStockValue,
    getProductBatches,
  } = useStore();

  const [dailyDate, setDailyDate] = useState(getToday());
  const [profitFrom, setProfitFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [profitTo, setProfitTo] = useState(getToday());

  // ── Daily Sales ────────────────────────────────────────────────────────────
  const dailyInvoices = invoices.filter(
    (inv) => inv.date.slice(0, 10) === dailyDate,
  );

  const totalSales = dailyInvoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalCashReceived = dailyInvoices
    .filter((inv) => inv.paymentMode === "cash")
    .reduce((s, inv) => s + inv.paidAmount, 0);
  const totalUpiReceived = dailyInvoices
    .filter((inv) => inv.paymentMode === "upi")
    .reduce((s, inv) => s + inv.paidAmount, 0);
  const totalOnlineReceived = dailyInvoices
    .filter((inv) => inv.paymentMode === "online")
    .reduce((s, inv) => s + inv.paidAmount, 0);
  const totalCreditSales = dailyInvoices
    .filter((inv) => inv.paymentMode === "credit")
    .reduce((s, inv) => s + inv.totalAmount, 0);
  const totalDueAmount = dailyInvoices.reduce(
    (s, inv) => s + (inv.dueAmount ?? 0),
    0,
  );
  const creditInvoices = dailyInvoices.filter(
    (inv) => inv.paymentMode === "credit",
  );
  const totalCollection =
    totalCashReceived + totalUpiReceived + totalOnlineReceived;

  const dailyProfit = dailyInvoices.reduce((s, inv) => {
    const cost = inv.items.reduce(
      (c, item) => c + item.purchaseCost * item.quantity,
      0,
    );
    return s + (inv.totalAmount - cost);
  }, 0);

  // ── Profit Report ──────────────────────────────────────────────────────────
  const profitInvoices = invoices.filter((inv) => {
    const d = inv.date.slice(0, 10);
    return d >= profitFrom && d <= profitTo;
  });

  const productProfitMap: Record<
    string,
    { name: string; qty: number; revenue: number; cost: number }
  > = {};
  for (const inv of profitInvoices) {
    for (const item of inv.items) {
      if (!productProfitMap[item.productId]) {
        productProfitMap[item.productId] = {
          name: item.productName,
          qty: 0,
          revenue: 0,
          cost: 0,
        };
      }
      productProfitMap[item.productId].qty += item.quantity;
      productProfitMap[item.productId].revenue +=
        item.quantity * item.sellingRate;
      productProfitMap[item.productId].cost +=
        item.purchaseCost * item.quantity;
    }
  }
  const profitRows = Object.values(productProfitMap).sort(
    (a, b) => b.revenue - b.cost - (a.revenue - a.cost),
  );
  const totalRevenue = profitRows.reduce((s, r) => s + r.revenue, 0);
  const totalCost = profitRows.reduce((s, r) => s + r.cost, 0);
  const totalProfitAll = totalRevenue - totalCost;
  const avgMarginPct = totalCost > 0 ? (totalProfitAll / totalCost) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm">
              Sales, stock, and profit analytics
            </p>
          </div>
          {onNavigate && (
            <Button
              data-ocid="reports.bill_banao.button"
              onClick={() => onNavigate("billing")}
              className="gap-2 shrink-0"
            >
              <Plus size={16} />
              Bill Banao
            </Button>
          )}
        </div>

        <Tabs defaultValue="daily">
          <TabsList data-ocid="reports.tab" className="mb-4">
            <TabsTrigger value="daily">
              <BarChart2 size={14} className="mr-2" />
              Daily Report
            </TabsTrigger>
            <TabsTrigger value="stock">
              <Package size={14} className="mr-2" />
              Stock Report
            </TabsTrigger>
            <TabsTrigger value="profit">
              <TrendingUp size={14} className="mr-2" />
              Profit Report
            </TabsTrigger>
          </TabsList>

          {/* ── Daily Sales Tab ── */}
          <TabsContent value="daily">
            <div className="flex flex-col gap-5">
              {/* Date filter */}
              <Card className="shadow-sm border-border">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          dailyDate === getToday() ? "default" : "outline"
                        }
                        className="text-xs h-8"
                        onClick={() => setDailyDate(getToday())}
                      >
                        Aaj
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          dailyDate === getYesterday() ? "default" : "outline"
                        }
                        className="text-xs h-8"
                        onClick={() => setDailyDate(getYesterday())}
                      >
                        Kal
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        Custom Date:
                      </Label>
                      <Input
                        data-ocid="reports.daily_date.input"
                        type="date"
                        value={dailyDate}
                        onChange={(e) => setDailyDate(e.target.value)}
                        className="w-36 h-8 text-xs"
                      />
                    </div>
                    <div className="ml-auto">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {formatDateLabel(dailyDate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Sales */}
                <Card className="shadow-sm border-blue-200 bg-blue-50/40">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <IndianRupee size={16} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Total Sales
                      </div>
                      <div className="font-bold text-blue-700 text-sm">
                        {fmt(totalSales)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash */}
                <Card className="shadow-sm border-green-200 bg-green-50/40">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Banknote size={16} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Cash</div>
                      <div className="font-bold text-green-700 text-sm">
                        {fmt(totalCashReceived)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* UPI */}
                <Card className="shadow-sm border-purple-200 bg-purple-50/40">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Smartphone size={16} className="text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">UPI</div>
                      <div className="font-bold text-purple-700 text-sm">
                        {fmt(totalUpiReceived)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Online */}
                <Card className="shadow-sm border-cyan-200 bg-cyan-50/40">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Wifi size={16} className="text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Online
                      </div>
                      <div className="font-bold text-cyan-700 text-sm">
                        {fmt(totalOnlineReceived)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Collection */}
                <Card className="shadow-sm border-emerald-300 bg-emerald-50/50">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Banknote size={16} className="text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Total Collection
                      </div>
                      <div className="font-bold text-emerald-700 text-sm">
                        {fmt(totalCollection)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Cash + UPI + Online
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Sales */}
                <Card className="shadow-sm border-orange-200 bg-orange-50/40">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard size={16} className="text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Credit Sales
                      </div>
                      <div className="font-bold text-orange-700 text-sm">
                        {fmt(totalCreditSales)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Due */}
                <Card className="shadow-sm border-red-200 bg-red-50/40">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <IndianRupee size={16} className="text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Total Due
                      </div>
                      <div className="font-bold text-red-600 text-sm">
                        {fmt(totalDueAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Count */}
                <Card className="shadow-sm border-border">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Total Invoices
                      </div>
                      <div className="font-bold text-sm">
                        {dailyInvoices.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {creditInvoices.length} credit
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profit */}
                <Card
                  className={`shadow-sm ${
                    dailyProfit >= 0
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-red-200 bg-red-50/40"
                  }`}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        dailyProfit >= 0 ? "bg-emerald-100" : "bg-red-100"
                      }`}
                    >
                      <TrendingUp
                        size={16}
                        className={
                          dailyProfit >= 0 ? "text-emerald-600" : "text-red-600"
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Total Profit
                      </div>
                      <div
                        className={`font-bold text-sm ${
                          dailyProfit >= 0 ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {fmt(dailyProfit)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Table */}
              <Card className="shadow-card border-border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText size={15} className="text-muted-foreground" />
                    Invoice Breakdown
                    <Badge variant="outline" className="ml-auto text-xs">
                      {dailyInvoices.length} invoices
                    </Badge>
                    {onNavigate && (
                      <Button
                        data-ocid="reports.daily.bill_banao.button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 ml-1"
                        onClick={() => onNavigate("billing")}
                      >
                        <Plus size={12} />
                        Naya Bill
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="text-xs">Invoice</TableHead>
                          <TableHead className="text-xs">Customer</TableHead>
                          <TableHead className="text-xs">Items</TableHead>
                          <TableHead className="text-xs">Total</TableHead>
                          <TableHead className="text-xs">Paid</TableHead>
                          <TableHead className="text-xs">Due</TableHead>
                          <TableHead className="text-xs">Mode</TableHead>
                          <TableHead className="text-xs">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyInvoices.length === 0 && (
                          <TableRow data-ocid="reports.daily.empty_state">
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground text-sm"
                            >
                              {dailyDate === getToday()
                                ? "Aaj koi sale nahi hui abhi tak"
                                : "Is date par koi sale nahi"}
                            </TableCell>
                          </TableRow>
                        )}
                        {dailyInvoices.map((inv, idx) => {
                          const cost = inv.items.reduce(
                            (c, item) => c + item.purchaseCost * item.quantity,
                            0,
                          );
                          const profit = inv.totalAmount - cost;
                          const due = inv.dueAmount ?? 0;
                          return (
                            <TableRow
                              key={inv.id}
                              data-ocid={`reports.daily.item.${idx + 1}`}
                              className={due > 0 ? "bg-red-50/40" : ""}
                            >
                              <TableCell className="text-sm font-medium">
                                {inv.invoiceNumber}
                              </TableCell>
                              <TableCell className="text-sm">
                                <div>{inv.customerName}</div>
                                {inv.customerMobile && (
                                  <div className="text-xs text-muted-foreground">
                                    {inv.customerMobile}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {inv.items.length} items
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {fmt(inv.totalAmount)}
                              </TableCell>
                              <TableCell className="text-sm text-green-700">
                                {fmt(inv.paidAmount)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {due > 0 ? (
                                  <span className="font-bold text-red-600">
                                    {fmt(due)}
                                  </span>
                                ) : (
                                  <span className="text-green-600 text-xs">
                                    ✓ Clear
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs capitalize ${
                                    inv.paymentMode === "credit"
                                      ? "bg-orange-50 text-orange-700 border-orange-300"
                                      : inv.paymentMode === "upi"
                                        ? "bg-purple-50 text-purple-700 border-purple-300"
                                        : inv.paymentMode === "cash"
                                          ? "bg-green-50 text-green-700 border-green-300"
                                          : "bg-cyan-50 text-cyan-700 border-cyan-300"
                                  }`}
                                >
                                  {inv.paymentMode}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className={`text-sm font-semibold ${
                                  profit >= 0
                                    ? "text-emerald-700"
                                    : "text-red-600"
                                }`}
                              >
                                {fmt(profit)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Per-item profit breakdown */}
              {dailyInvoices.length > 0 &&
                (() => {
                  const itemMap: Record<
                    string,
                    { name: string; qty: number; revenue: number; cost: number }
                  > = {};
                  for (const inv of dailyInvoices) {
                    for (const item of inv.items) {
                      if (!itemMap[item.productId]) {
                        itemMap[item.productId] = {
                          name: item.productName,
                          qty: 0,
                          revenue: 0,
                          cost: 0,
                        };
                      }
                      itemMap[item.productId].qty += item.quantity;
                      itemMap[item.productId].revenue +=
                        item.quantity * item.sellingRate;
                      itemMap[item.productId].cost +=
                        item.purchaseCost * item.quantity;
                    }
                  }
                  const rows = Object.values(itemMap);
                  return (
                    <Card className="shadow-sm border-border">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp size={15} className="text-emerald-600" />
                          Item-wise Profit (Today)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-secondary/50">
                                <TableHead className="text-xs">Item</TableHead>
                                <TableHead className="text-xs">
                                  Qty Sold
                                </TableHead>
                                <TableHead className="text-xs">
                                  Revenue
                                </TableHead>
                                <TableHead className="text-xs">Cost</TableHead>
                                <TableHead className="text-xs">
                                  Profit
                                </TableHead>
                                <TableHead className="text-xs">
                                  Margin %
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rows.map((row) => {
                                const profit = row.revenue - row.cost;
                                const pct =
                                  row.cost > 0 ? (profit / row.cost) * 100 : 0;
                                return (
                                  <TableRow key={row.name}>
                                    <TableCell className="text-sm font-medium">
                                      {row.name}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {row.qty}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {fmt(row.revenue)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {fmt(row.cost)}
                                    </TableCell>
                                    <TableCell
                                      className={`text-sm font-semibold ${profit >= 0 ? "text-emerald-700" : "text-red-600"}`}
                                    >
                                      {fmt(profit)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={`text-xs border-0 ${pct > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                                      >
                                        {pct.toFixed(1)}%
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
            </div>
          </TabsContent>

          {/* Stock Report */}
          <TabsContent value="stock">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base">
                  Current Stock Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs">Stock</TableHead>
                        <TableHead className="text-xs">Value</TableHead>
                        <TableHead className="text-xs">Sell Price</TableHead>
                        <TableHead className="text-xs">Batches</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p, idx) => {
                        const stock = getProductStock(p.id);
                        const value = getStockValue(p.id);
                        const batchCount = getProductBatches(p.id).length;
                        const isLow = stock < p.minStockAlert;
                        return (
                          <TableRow
                            key={p.id}
                            data-ocid={`reports.stock.item.${idx + 1}`}
                          >
                            <TableCell className="text-sm font-medium">
                              {p.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {stock} {p.unit}
                            </TableCell>
                            <TableCell className="text-sm">
                              {fmt(value)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {fmt(p.sellingPrice)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {batchCount}
                            </TableCell>
                            <TableCell>
                              {isLow ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Low Stock
                                </Badge>
                              ) : stock === 0 ? (
                                <Badge className="text-xs bg-secondary text-muted-foreground border-0">
                                  Out of Stock
                                </Badge>
                              ) : (
                                <Badge className="text-xs bg-success-light text-success border-0">
                                  OK
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit Report */}
          <TabsContent value="profit">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label className="text-sm">From Date</Label>
                  <Input
                    data-ocid="reports.profit_from.input"
                    type="date"
                    value={profitFrom}
                    onChange={(e) => setProfitFrom(e.target.value)}
                    className="w-40 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">To Date</Label>
                  <Input
                    data-ocid="reports.profit_to.input"
                    type="date"
                    value={profitTo}
                    onChange={(e) => setProfitTo(e.target.value)}
                    className="w-40 mt-1"
                  />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Revenue
                  </div>
                  <div className="font-bold text-brand-blue text-lg">
                    {fmt(totalRevenue)}
                  </div>
                </div>
                <div className="bg-secondary/60 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Cost
                  </div>
                  <div className="font-bold text-foreground text-lg">
                    {fmt(totalCost)}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${totalProfitAll >= 0 ? "bg-success-light" : "bg-danger-light"}`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Profit
                  </div>
                  <div
                    className={`font-bold text-lg ${totalProfitAll >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {fmt(totalProfitAll)}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    Avg Margin %
                  </div>
                  <div className="font-bold text-emerald-600 text-lg">
                    {avgMarginPct.toFixed(1)}%
                  </div>
                </div>
              </div>

              <Card className="shadow-card border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Qty Sold</TableHead>
                          <TableHead className="text-xs">Cost/Unit</TableHead>
                          <TableHead className="text-xs">Sell/Unit</TableHead>
                          <TableHead className="text-xs">Profit/Unit</TableHead>
                          <TableHead className="text-xs">
                            Total Profit
                          </TableHead>
                          <TableHead className="text-xs">Margin %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profitRows.length === 0 && (
                          <TableRow data-ocid="reports.profit.empty_state">
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground text-sm"
                            >
                              No sales data for selected range
                            </TableCell>
                          </TableRow>
                        )}
                        {profitRows.map((row, idx) => {
                          const profit = row.revenue - row.cost;
                          const profitPct =
                            row.cost > 0 ? (profit / row.cost) * 100 : 0;
                          return (
                            <TableRow
                              key={row.name}
                              data-ocid={`reports.profit.item.${idx + 1}`}
                            >
                              <TableCell className="text-sm font-medium">
                                {row.name}
                              </TableCell>
                              <TableCell className="text-sm">
                                {row.qty}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {row.qty > 0 ? fmt(row.cost / row.qty) : "-"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {row.qty > 0 ? fmt(row.revenue / row.qty) : "-"}
                              </TableCell>
                              <TableCell
                                className={`text-sm font-semibold ${
                                  profit / (row.qty || 1) >= 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {row.qty > 0 ? fmt(profit / row.qty) : "-"}
                              </TableCell>
                              <TableCell
                                className={`text-sm font-semibold ${
                                  profit >= 0 ? "text-success" : "text-danger"
                                }`}
                              >
                                {fmt(profit)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-xs border-0 ${
                                    profitPct > 0
                                      ? "bg-success-light text-success"
                                      : "bg-danger-light text-danger"
                                  }`}
                                >
                                  {profitPct.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {profitRows.length > 0 && (
                          <TableRow className="bg-secondary/50 font-bold">
                            <TableCell className="text-sm">Total</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell
                              className={`text-sm ${
                                totalRevenue - totalCost >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {fmt(totalRevenue - totalCost)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-xs border-0 ${avgMarginPct >= 0 ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                              >
                                {avgMarginPct.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
