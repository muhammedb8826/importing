"use client";

import * as React from "react";
import { IconPlus } from "@tabler/icons-react";
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
import { getItemCostEtb, getItemTotalCost } from "@/lib/import-types";

export function ItemsTable() {
  const { data, addItem } = useImportData();
  const [open, setOpen] = React.useState(false);
  const [shipmentId, setShipmentId] = React.useState<string>("");
  const [name, setName] = React.useState("");
  const [ctn, setCtn] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [purPrice, setPurPrice] = React.useState("");
  const [tax, setTax] = React.useState("");
  const [crmRate, setCrmRate] = React.useState("");
  const [sfPrice, setSfPrice] = React.useState("");
  const [ftrPerUnit, setFtrPerUnit] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sid = parseInt(shipmentId, 10);
    const ctnVal = parseInt(ctn, 10);
    const qtyVal = parseInt(qty, 10);
    const pur = parseFloat(purPrice);
    const taxVal = parseFloat(tax);
    const crm = parseFloat(crmRate);
    const sf = parseFloat(sfPrice);
    const ftr = parseFloat(ftrPerUnit);
    if (!shipmentId || !name.trim() || isNaN(ctnVal) || isNaN(qtyVal) || isNaN(pur) || isNaN(taxVal) || isNaN(crm) || isNaN(sf) || isNaN(ftr)) {
      toast.error("Please fill all fields correctly");
      return;
    }
    const shipment = data.shipments.find((s) => s.id === sid);
    addItem({
      shipmentId: sid,
      name: name.trim(),
      ctn: ctnVal,
      qty: qtyVal,
      purPrice: pur,
      tax: taxVal,
      crmRate: crm,
      sfPrice: sf,
      ftrPerUnit: ftr,
      bookingRate: shipment?.bookingRate ?? 0.45,
    });
    toast.success("Item added");
    setShipmentId("");
    setName("");
    setCtn("");
    setQty("");
    setPurPrice("");
    setTax("");
    setCrmRate("");
    setSfPrice("");
    setFtrPerUnit("");
    setOpen(false);
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 id="items" className="text-lg font-semibold scroll-mt-20">
          Items
        </h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <IconPlus className="size-4" />
              Add Item
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>Add Item to Shipment</SheetTitle>
                <SheetDescription>
                  Enter item details. All costs in RMB.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="item-shipment">Shipment</Label>
                  <Select value={shipmentId} onValueChange={setShipmentId}>
                    <SelectTrigger id="item-shipment">
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
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SOCKET"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="item-ctn">CTN</Label>
                    <Input
                      id="item-ctn"
                      type="number"
                      value={ctn}
                      onChange={(e) => setCtn(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-qty">QTY</Label>
                    <Input
                      id="item-qty"
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-purPrice">PUR/PRICE (RMB)</Label>
                  <Input
                    id="item-purPrice"
                    type="number"
                    step="0.01"
                    value={purPrice}
                    onChange={(e) => setPurPrice(e.target.value)}
                    placeholder="3.5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-tax">TAX (per unit)</Label>
                  <Input
                    id="item-tax"
                    type="number"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="44.47"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-crmRate">CRM Rate</Label>
                  <Input
                    id="item-crmRate"
                    type="number"
                    step="0.001"
                    value={crmRate}
                    onChange={(e) => setCrmRate(e.target.value)}
                    placeholder="0.033"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-sfPrice">SF/Price (RMB)</Label>
                  <Input
                    id="item-sfPrice"
                    type="number"
                    step="0.01"
                    value={sfPrice}
                    onChange={(e) => setSfPrice(e.target.value)}
                    placeholder="160"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-ftrPerUnit">FTR/LUNIT (RMB)</Label>
                  <Input
                    id="item-ftrPerUnit"
                    type="number"
                    step="0.01"
                    value={ftrPerUnit}
                    onChange={(e) => setFtrPerUnit(e.target.value)}
                    placeholder="94.5"
                  />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit">Add Item</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px] overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">CTN</TableHead>
                <TableHead className="text-right">QTY</TableHead>
                <TableHead className="text-right">PUR/PRICE</TableHead>
                <TableHead className="text-right">TOTAL COST</TableHead>
                <TableHead className="text-right">Cost (ETB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.shipmentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No items. Add a shipment first, then add items.
                  </TableCell>
                </TableRow>
              ) : (
                data.shipmentItems.map((item) => {
                  const shipment = data.shipments.find(
                    (s) => s.id === item.shipmentId
                  );
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {shipment?.piNumber ?? item.shipmentId}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.ctn}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">{item.purPrice}</TableCell>
                      <TableCell className="text-right">
                        {getItemTotalCost(item).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        RMB
                      </TableCell>
                      <TableCell className="text-right">
                        {getItemCostEtb(item).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ETB
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
