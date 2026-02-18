"use client";

import * as React from "react";
import {
  IconCircleCheckFilled,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { useImportData } from "@/lib/import-store";
import type { ShipmentStatus } from "@/lib/import-types";

const statusLabels: Record<ShipmentStatus, string> = {
  booked: "Booked",
  partially_paid: "Partially Paid",
  fully_paid: "Fully Paid",
};

export function ShipmentsTable() {
  const { data, addShipment } = useImportData();
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [supplier, setSupplier] = React.useState("");
  const [piNumber, setPiNumber] = React.useState("");
  const [totalAmountRmb, setTotalAmountRmb] = React.useState("");
  const [bookingRate, setBookingRate] = React.useState("");
  const [quantity, setQuantity] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(totalAmountRmb);
    const rate = parseFloat(bookingRate);
    const qty = parseInt(quantity, 10);
    if (!supplier.trim() || !piNumber.trim() || isNaN(amount) || isNaN(rate) || isNaN(qty)) {
      toast.error("Please fill all fields correctly");
      return;
    }
    addShipment({
      supplier: supplier.trim(),
      piNumber: piNumber.trim(),
      currency: "RMB",
      totalAmountRmb: amount,
      bookingRate: rate,
      quantity: qty,
    });
    toast.success("Shipment added");
    setSupplier("");
    setPiNumber("");
    setTotalAmountRmb("");
    setBookingRate("");
    setQuantity("");
    setOpen(false);
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 id="shipments" className="text-lg font-semibold scroll-mt-20">
          Shipments / PI
        </h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <IconPlus className="size-4" />
              Add PI
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <form ref={formRef} onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>Add New PI / Shipment</SheetTitle>
                <SheetDescription>
                  Enter shipment details from the supplier PI.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Shanghai Tech Co."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="piNumber">PI Number</Label>
                  <Input
                    id="piNumber"
                    value={piNumber}
                    onChange={(e) => setPiNumber(e.target.value)}
                    placeholder="e.g. PI-2024-001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalAmountRmb">Total Amount (RMB)</Label>
                  <Input
                    id="totalAmountRmb"
                    type="number"
                    step="0.01"
                    value={totalAmountRmb}
                    onChange={(e) => setTotalAmountRmb(e.target.value)}
                    placeholder="150000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bookingRate">Booking Rate (RMB → ETB)</Label>
                  <Input
                    id="bookingRate"
                    type="number"
                    step="0.01"
                    value={bookingRate}
                    onChange={(e) => setBookingRate(e.target.value)}
                    placeholder="0.45"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity (units)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit">Add Shipment</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PI Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total (RMB)</TableHead>
              <TableHead className="text-right">Booking Rate</TableHead>
              <TableHead className="text-right">Booked ETB</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No shipments. Click &quot;Add PI&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              data.shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.piNumber}</TableCell>
                  <TableCell>{s.supplier}</TableCell>
                  <TableCell className="text-right">
                    {s.totalAmountRmb.toLocaleString()} {s.currency}
                  </TableCell>
                  <TableCell className="text-right">{s.bookingRate}</TableCell>
                  <TableCell className="text-right">
                    {(s.totalAmountRmb * s.bookingRate).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ETB
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {s.status === "fully_paid" ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                      ) : (
                        <IconLoader className="size-3" />
                      )}
                      {statusLabels[s.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
