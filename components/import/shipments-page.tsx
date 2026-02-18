"use client";

import * as React from "react";
import {
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLoader,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Shipment, ShipmentStatus } from "@/lib/import-types";

const statusLabels: Record<ShipmentStatus, string> = {
  booked: "Booked",
  partially_paid: "Partially Paid",
  fully_paid: "Fully Paid",
};

export function ShipmentsPage() {
  const { data, addShipment, updateShipment, deleteShipment } = useImportData();
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [supplier, setSupplier] = React.useState("");
  const [piNumber, setPiNumber] = React.useState("");
  const [totalAmountRmb, setTotalAmountRmb] = React.useState("");
  const [bookingRate, setBookingRate] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [status, setStatus] = React.useState<ShipmentStatus>("booked");

  function resetForm() {
    setSupplier("");
    setPiNumber("");
    setTotalAmountRmb("");
    setBookingRate("");
    setQuantity("");
    setStatus("booked");
    setEditingId(null);
  }

  function openEdit(s: Shipment) {
    setEditingId(s.id);
    setSupplier(s.supplier);
    setPiNumber(s.piNumber);
    setTotalAmountRmb(String(s.totalAmountRmb));
    setBookingRate(String(s.bookingRate));
    setQuantity(String(s.quantity));
    setStatus(s.status);
    setOpen(true);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(totalAmountRmb);
    const rate = parseFloat(bookingRate);
    const qty = parseInt(quantity, 10);
    if (!supplier.trim() || !piNumber.trim() || isNaN(amount) || isNaN(rate) || isNaN(qty)) {
      toast.error("Please fill all fields correctly");
      return;
    }
    if (editingId) {
      updateShipment(editingId, {
        supplier: supplier.trim(),
        piNumber: piNumber.trim(),
        totalAmountRmb: amount,
        bookingRate: rate,
        quantity: qty,
        status,
      });
      toast.success("Shipment updated");
    } else {
      addShipment({
        supplier: supplier.trim(),
        piNumber: piNumber.trim(),
        currency: "RMB",
        totalAmountRmb: amount,
        bookingRate: rate,
        quantity: qty,
      });
      toast.success("Shipment added");
    }
    resetForm();
    setOpen(false);
  }

  function handleDelete(id: number, piNumber: string) {
    if (!confirm(`Delete shipment ${piNumber}? This will also delete all items and payments.`)) return;
    deleteShipment(id);
    toast.success("Shipment deleted");
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-xl font-semibold">Shipments / PI</h1>
        <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <SheetTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <IconPlus className="size-4" />
              Add PI
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>{editingId ? "Edit" : "Add"} Shipment / PI</SheetTitle>
                <SheetDescription>
                  {editingId ? "Update" : "Enter"} shipment details from the supplier PI.
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
                {editingId && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                        <SelectItem value="fully_paid">Fully Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <SheetFooter>
                <Button type="submit">{editingId ? "Update" : "Add"} Shipment</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PI Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total (RMB)</TableHead>
              <TableHead className="text-right">Booking Rate</TableHead>
              <TableHead className="text-right">Booked ETB</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(s)}>
                          <IconPencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(s.id, s.piNumber)}
                        >
                          <IconTrash className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
