"use client";

import * as React from "react";
import { IconPlus, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImportData } from "@/lib/import-store";

export function PaymentsTable() {
  const { data, addPayment } = useImportData();
  const [open, setOpen] = React.useState(false);
  const [shipmentId, setShipmentId] = React.useState<string>("");
  const [amountRmb, setAmountRmb] = React.useState("");
  const [actualRate, setActualRate] = React.useState("");
  const [date, setDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sid = parseInt(shipmentId, 10);
    const amount = parseFloat(amountRmb);
    const rate = parseFloat(actualRate);
    if (!shipmentId || isNaN(amount) || isNaN(rate)) {
      toast.error("Please fill required fields correctly");
      return;
    }
    addPayment({
      shipmentId: sid,
      amountRmb: amount,
      actualRate: rate,
      date,
      note: note.trim() || undefined,
    });
    toast.success("Payment recorded");
    setShipmentId("");
    setAmountRmb("");
    setActualRate("");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
    setOpen(false);
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 id="payments" className="text-lg font-semibold scroll-mt-20">
          Payments
        </h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <IconPlus className="size-4" />
              Record Payment
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>Record Partial Payment</SheetTitle>
                <SheetDescription>
                  Enter RMB amount and actual exchange rate. Forex gain/loss is
                  calculated automatically.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="pay-shipment">Shipment</Label>
                  <Select value={shipmentId} onValueChange={setShipmentId}>
                    <SelectTrigger id="pay-shipment">
                      <SelectValue placeholder="Select shipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.shipments.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.piNumber} - {s.supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pay-amount">Amount (RMB)</Label>
                  <Input
                    id="pay-amount"
                    type="number"
                    step="0.01"
                    value={amountRmb}
                    onChange={(e) => setAmountRmb(e.target.value)}
                    placeholder="75000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pay-rate">Actual Rate (RMB → ETB)</Label>
                  <Input
                    id="pay-rate"
                    type="number"
                    step="0.01"
                    value={actualRate}
                    onChange={(e) => setActualRate(e.target.value)}
                    placeholder="0.46"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pay-date">Date</Label>
                  <Input
                    id="pay-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pay-note">Note (optional)</Label>
                  <Input
                    id="pay-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="First installment"
                  />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit">Record Payment</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount (RMB)</TableHead>
              <TableHead className="text-right">Actual Rate</TableHead>
              <TableHead className="text-right">ETB Paid</TableHead>
              <TableHead className="text-right">Forex G/L</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No payments. Record a partial or full payment.
                </TableCell>
              </TableRow>
            ) : (
              data.payments.map((p) => {
                const shipment = data.shipments.find(
                  (s) => s.id === p.shipmentId
                );
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {shipment?.piNumber ?? p.shipmentId}
                    </TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell className="text-right">
                      {p.amountRmb.toLocaleString()} RMB
                    </TableCell>
                    <TableCell className="text-right">{p.actualRate}</TableCell>
                    <TableCell className="text-right">
                      {p.etbPaid.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ETB
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        p.forexGainLoss >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {p.forexGainLoss >= 0 ? (
                        <IconTrendingUp className="inline size-3" />
                      ) : (
                        <IconTrendingDown className="inline size-3" />
                      )}{" "}
                      {p.forexGainLoss >= 0 ? "+" : ""}
                      {p.forexGainLoss.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ETB
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.note ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
