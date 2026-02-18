"use client";

import * as React from "react";
import { IconDownload } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useImportData } from "@/lib/import-store";
import {
  getItemCostEtb,
  getItemCostPerUnit,
  getItemTotalCost,
  getItemTotalRmb,
} from "@/lib/import-types";

function exportToCsv(data: string[][], filename: string) {
  const csv = data
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsSection() {
  const { data } = useImportData();

  const shipmentSummaries = React.useMemo(() => {
    return data.shipments.map((s) => {
      const payments = data.payments.filter((p) => p.shipmentId === s.id);
      const totalPaidEtb = payments.reduce((sum, p) => sum + p.etbPaid, 0);
      const totalForex = payments.reduce((sum, p) => sum + p.forexGainLoss, 0);
      const bookedEtb = s.totalAmountRmb * s.bookingRate;
      return {
        piNumber: s.piNumber,
        supplier: s.supplier,
        totalRmb: s.totalAmountRmb,
        bookedEtb,
        totalPaidEtb,
        forexGainLoss: totalForex,
        status: s.status,
      };
    });
  }, [data]);

  function handleExportShipments() {
    const rows: string[][] = [
      ["PI Number", "Supplier", "Total RMB", "Booked ETB", "Paid ETB", "Forex G/L", "Status"],
      ...shipmentSummaries.map((r) => [
        r.piNumber,
        r.supplier,
        String(r.totalRmb),
        r.bookedEtb.toFixed(2),
        r.totalPaidEtb.toFixed(2),
        r.forexGainLoss.toFixed(2),
        r.status,
      ]),
    ];
    exportToCsv(rows, `shipment-summary-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Shipment summary exported");
  }

  function handleExportItems() {
    const rows: string[][] = [
      ["Shipment", "Item Name", "CTN", "QTY", "PUR/PRICE", "Total RMB", "COST/UNIT", "TOTAL COST", "Cost ETB"],
      ...data.shipmentItems.map((i) => {
        const s = data.shipments.find((x) => x.id === i.shipmentId);
        return [
          s?.piNumber ?? String(i.shipmentId),
          i.name,
          String(i.ctn),
          String(i.qty),
          String(i.purPrice),
          getItemTotalRmb(i).toFixed(2),
          getItemCostPerUnit(i).toFixed(2),
          getItemTotalCost(i).toFixed(2),
          getItemCostEtb(i).toFixed(2),
        ];
      }),
    ];
    exportToCsv(rows, `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Inventory report exported");
  }

  function handleExportPayments() {
    const rows: string[][] = [
      ["Shipment ID", "Date", "Amount RMB", "Actual Rate", "ETB Paid", "Forex G/L", "Note"],
      ...data.payments.map((p) => {
        const s = data.shipments.find((x) => x.id === p.shipmentId);
        return [
          s?.piNumber ?? String(p.shipmentId),
          p.date,
          String(p.amountRmb),
          String(p.actualRate),
          p.etbPaid.toFixed(2),
          p.forexGainLoss.toFixed(2),
          p.note ?? "",
        ];
      }),
    ];
    exportToCsv(rows, `payment-history-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Payment history exported");
  }

  return (
      <div className="space-y-4 px-4 lg:px-6">
      <Tabs defaultValue="shipment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shipment">Shipment Summary</TabsTrigger>
          <TabsTrigger value="items">Item Inventory</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>
        <TabsContent value="shipment" className="space-y-4">
          <Button variant="outline" size="sm" onClick={handleExportShipments}>
            <IconDownload className="size-4" />
            Export CSV
          </Button>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PI Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Total RMB</TableHead>
                  <TableHead className="text-right">Booked ETB</TableHead>
                  <TableHead className="text-right">Paid ETB</TableHead>
                  <TableHead className="text-right">Forex G/L</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipmentSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No shipment data.
                    </TableCell>
                  </TableRow>
                ) : (
                  shipmentSummaries.map((r) => (
                    <TableRow key={r.piNumber}>
                      <TableCell className="font-medium">{r.piNumber}</TableCell>
                      <TableCell>{r.supplier}</TableCell>
                      <TableCell className="text-right">
                        {r.totalRmb.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.bookedEtb.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.totalPaidEtb.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          r.forexGainLoss >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {r.forexGainLoss >= 0 ? "+" : ""}
                        {r.forexGainLoss.toFixed(2)}
                      </TableCell>
                      <TableCell>{r.status.replace("_", " ")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="items" className="space-y-4">
          <Button variant="outline" size="sm" onClick={handleExportItems}>
            <IconDownload className="size-4" />
            Export CSV
          </Button>
          <div className="overflow-x-auto">
            <div className="min-w-[800px] overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">CTN</TableHead>
                    <TableHead className="text-right">QTY</TableHead>
                    <TableHead className="text-right">PUR/PRICE</TableHead>
                    <TableHead className="text-right">Total RMB</TableHead>
                    <TableHead className="text-right">COST/UNIT</TableHead>
                    <TableHead className="text-right">TOTAL COST</TableHead>
                    <TableHead className="text-right">Cost ETB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.shipmentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No items.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.shipmentItems.map((i) => {
                      const s = data.shipments.find((x) => x.id === i.shipmentId);
                      return (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">
                            {s?.piNumber ?? i.shipmentId}
                          </TableCell>
                          <TableCell>{i.name}</TableCell>
                          <TableCell className="text-right">{i.ctn}</TableCell>
                          <TableCell className="text-right">{i.qty}</TableCell>
                          <TableCell className="text-right">{i.purPrice}</TableCell>
                          <TableCell className="text-right">
                            {getItemTotalRmb(i).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {getItemCostPerUnit(i).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {getItemTotalCost(i).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {getItemCostEtb(i).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Button variant="outline" size="sm" onClick={handleExportPayments}>
            <IconDownload className="size-4" />
            Export CSV
          </Button>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount RMB</TableHead>
                  <TableHead className="text-right">ETB Paid</TableHead>
                  <TableHead className="text-right">Forex G/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No payments.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.payments.map((p) => {
                    const s = data.shipments.find((x) => x.id === p.shipmentId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {s?.piNumber ?? p.shipmentId}
                        </TableCell>
                        <TableCell>{p.date}</TableCell>
                        <TableCell className="text-right">
                          {p.amountRmb.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.etbPaid.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            p.forexGainLoss >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {p.forexGainLoss >= 0 ? "+" : ""}
                          {p.forexGainLoss.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
