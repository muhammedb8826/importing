"use client";

import * as React from "react";
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

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
import {
  getItemCostPerUnit,
  getItemCrmCostPerUnit,
  getItemDiff,
  getItemTotalCost,
  getItemTotalCrm,
  getItemTotalDiff,
  getItemTotalFtr,
  getItemTotalRmb,
  getItemTotalSell,
  getItemTotalTax,
  getItemTotalUnits,
  type ShipmentItem,
} from "@/lib/import-types";

function fmt(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ItemsPage() {
  const { data, addItem, updateItem, deleteItem } = useImportData();
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [shipmentId, setShipmentId] = React.useState<string>("");
  const [name, setName] = React.useState("");
  const [ctn, setCtn] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [purPrice, setPurPrice] = React.useState("");
  const [tax, setTax] = React.useState("");
  const [crmRate, setCrmRate] = React.useState("");
  const [sfPrice, setSfPrice] = React.useState("");
  const [ftrPerUnit, setFtrPerUnit] = React.useState("");

  function resetForm() {
    setShipmentId("");
    setName("");
    setCtn("");
    setQty("");
    setPurPrice("");
    setTax("");
    setCrmRate("");
    setSfPrice("");
    setFtrPerUnit("");
    setEditingId(null);
  }

  function openEdit(item: ShipmentItem) {
    setEditingId(item.id);
    setShipmentId(String(item.shipmentId));
    setName(item.name);
    setCtn(String(item.ctn));
    setQty(String(item.qty));
    setPurPrice(String(item.purPrice));
    setTax(String(item.tax));
    setCrmRate(String(item.crmRate));
    setSfPrice(String(item.sfPrice));
    setFtrPerUnit(String(item.ftrPerUnit));
    setOpen(true);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

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
    const bookingRate = shipment?.bookingRate ?? 0.45;
    const itemData = {
      shipmentId: sid,
      name: name.trim(),
      ctn: ctnVal,
      qty: qtyVal,
      purPrice: pur,
      tax: taxVal,
      crmRate: crm,
      sfPrice: sf,
      ftrPerUnit: ftr,
      bookingRate,
    };
    if (editingId) {
      updateItem(editingId, itemData);
      toast.success("Item updated");
    } else {
      addItem(itemData);
      toast.success("Item added");
    }
    resetForm();
    setOpen(false);
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete item "${name}"?`)) return;
    deleteItem(id);
    toast.success("Item deleted");
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-xl font-semibold">Items</h1>
        <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <SheetTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <IconPlus className="size-4" />
              Add Item
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>{editingId ? "Edit" : "Add"} Item</SheetTitle>
                <SheetDescription>
                  Enter item details. All costs in RMB.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="item-shipment">Shipment</Label>
                  <Select
                    value={shipmentId}
                    onValueChange={setShipmentId}
                    disabled={!!editingId}
                  >
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
                    <Label htmlFor="item-ctn">CTN (Cartons)</Label>
                    <Input
                      id="item-ctn"
                      type="number"
                      value={ctn}
                      onChange={(e) => setCtn(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-qty">QTY (per carton)</Label>
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
                  <Label htmlFor="item-purPrice">PUR/PRICE (RMB per unit)</Label>
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
                  <Label htmlFor="item-sfPrice">SF/Price (Selling price per unit)</Label>
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
                  <Label htmlFor="item-ftrPerUnit">FTR/LUNIT (Freight per unit)</Label>
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
                <Button type="submit">{editingId ? "Update" : "Add"} Item</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="overflow-x-auto mx-4 lg:mx-6">
        <div className="min-w-[1400px] overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">CTN</TableHead>
                <TableHead className="text-right">QTY</TableHead>
                <TableHead className="text-right">PUR/PRICE</TableHead>
                <TableHead className="text-right">TAX</TableHead>
                <TableHead className="text-right">CRM</TableHead>
                <TableHead className="text-right">SF/Price</TableHead>
                <TableHead className="text-right">Total RMB</TableHead>
                <TableHead className="text-right">FTR/LUNIT</TableHead>
                <TableHead className="text-right">TOTAL FTR</TableHead>
                <TableHead className="text-right">TOTAL TAX</TableHead>
                <TableHead className="text-right">CRM/UNIT</TableHead>
                <TableHead className="text-right">TOTAL CRM</TableHead>
                <TableHead className="text-right bg-blue-50 dark:bg-blue-950/30">COST/UNIT</TableHead>
                <TableHead className="text-right bg-blue-50 dark:bg-blue-950/30">TOTAL COST</TableHead>
                <TableHead className="text-right">DIFF</TableHead>
                <TableHead className="text-right">TOTAL DIFF</TableHead>
                <TableHead className="text-right">TOTAL SELL</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.shipmentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={19} className="h-24 text-center">
                    No items. Add a shipment first, then add items.
                  </TableCell>
                </TableRow>
              ) : (
                data.shipmentItems.map((item) => {
                  const shipment = data.shipments.find((s) => s.id === item.shipmentId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{item.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {shipment?.piNumber ?? item.shipmentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.ctn}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">{fmt(item.purPrice)}</TableCell>
                      <TableCell className="text-right">{fmt(item.tax)}</TableCell>
                      <TableCell className="text-right">{item.crmRate}</TableCell>
                      <TableCell className="text-right">{fmt(item.sfPrice)}</TableCell>
                      <TableCell className="text-right">{fmt(getItemTotalRmb(item))}</TableCell>
                      <TableCell className="text-right">{fmt(item.ftrPerUnit)}</TableCell>
                      <TableCell className="text-right">{fmt(getItemTotalFtr(item))}</TableCell>
                      <TableCell className="text-right">{fmt(getItemTotalTax(item))}</TableCell>
                      <TableCell className="text-right">{fmt(getItemCrmCostPerUnit(item))}</TableCell>
                      <TableCell className="text-right">{fmt(getItemTotalCrm(item))}</TableCell>
                      <TableCell className="text-right bg-blue-50/50 dark:bg-blue-950/20 font-medium">
                        {fmt(getItemCostPerUnit(item))}
                      </TableCell>
                      <TableCell className="text-right bg-blue-50/50 dark:bg-blue-950/20 font-medium">
                        {fmt(getItemTotalCost(item))}
                      </TableCell>
                      <TableCell className="text-right">{fmt(getItemDiff(item))}</TableCell>
                      <TableCell className="text-right">{fmt(getItemTotalDiff(item))}</TableCell>
                      <TableCell className="text-right">{fmt(getItemTotalSell(item))}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(item)}>
                              <IconPencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(item.id, item.name)}
                            >
                              <IconTrash className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
