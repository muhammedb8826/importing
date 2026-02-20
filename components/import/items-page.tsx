"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  getItemFtrPerUnit,
  getItemTotalCost,
  getItemTotalCrm,
  getItemTotalDiff,
  getItemTotalFtr,
  getItemTotalRmb,
  getItemTotalSell,
  getItemTotalTax,
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
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; name: string } | null>(null);

  const [shipmentId, setShipmentId] = React.useState<string>("");
  const [name, setName] = React.useState("");
  const [ctn, setCtn] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [purPrice, setPurPrice] = React.useState("");
  const [tax, setTax] = React.useState("");
  const [crmRate, setCrmRate] = React.useState("");
  const [sfPrice, setSfPrice] = React.useState("");

  function resetForm() {
    setShipmentId("");
    setName("");
    setCtn("");
    setQty("");
    setPurPrice("");
    setTax("");
    setCrmRate("");
    setSfPrice("");
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
    if (!shipmentId || !name.trim() || isNaN(ctnVal) || isNaN(qtyVal) || isNaN(pur) || isNaN(taxVal) || isNaN(crm) || isNaN(sf)) {
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
      ftrPerUnit: pur * 27,
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

  function openDeleteDialog(id: number, name: string) {
    setDeleteTarget({ id, name });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    toast.success("Item deleted");
    setDeleteTarget(null);
  }

  const columns = React.useMemo<ColumnDef<ShipmentItem>[]>(
    () => [
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => {
          const item = row.original;
          const shipment = data.shipments.find((s) => s.id === item.shipmentId);
          return (
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground text-xs">
                {shipment?.piNumber ?? item.shipmentId}
              </div>
            </div>
          );
        },
      },
      { accessorKey: "ctn", header: () => <div className="text-right">CTN</div>, cell: ({ row }) => <div className="text-right">{row.original.ctn}</div> },
      { accessorKey: "qty", header: () => <div className="text-right">QTY</div>, cell: ({ row }) => <div className="text-right">{row.original.qty}</div> },
      { accessorKey: "purPrice", header: () => <div className="text-right">PUR/PRICE</div>, cell: ({ row }) => <div className="text-right">{fmt(row.original.purPrice)}</div> },
      { accessorKey: "tax", header: () => <div className="text-right">TAX</div>, cell: ({ row }) => <div className="text-right">{fmt(row.original.tax)}</div> },
      { accessorKey: "crmRate", header: () => <div className="text-right">CRM</div>, cell: ({ row }) => <div className="text-right">{row.original.crmRate}</div> },
      { accessorKey: "sfPrice", header: () => <div className="text-right">SF/Price</div>, cell: ({ row }) => <div className="text-right">{fmt(row.original.sfPrice)}</div> },
      { id: "totalRmb", header: () => <div className="text-right">Total RMB</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemTotalRmb(row.original))}</div> },
      { id: "ftrPerUnit", header: () => <div className="text-right">ETB/UNIT</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemFtrPerUnit(row.original))}</div> },
      { id: "totalFtr", header: () => <div className="text-right">TOTAL FTR</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemTotalFtr(row.original))}</div> },
      { id: "totalTax", header: () => <div className="text-right">TOTAL TAX</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemTotalTax(row.original))}</div> },
      { id: "crmUnit", header: () => <div className="text-right">CRM/UNIT</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemCrmCostPerUnit(row.original))}</div> },
      { id: "totalCrm", header: () => <div className="text-right">TOTAL CRM</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemTotalCrm(row.original))}</div> },
      { id: "costUnit", header: () => <div className="text-right">COST/UNIT</div>, cell: ({ row }) => <div className="text-right bg-blue-50/50 dark:bg-blue-950/20 font-medium">{fmt(getItemCostPerUnit(row.original))}</div> },
      { id: "totalCost", header: () => <div className="text-right">TOTAL COST</div>, cell: ({ row }) => <div className="text-right bg-blue-50/50 dark:bg-blue-950/20 font-medium">{fmt(getItemTotalCost(row.original))}</div> },
      { id: "diff", header: () => <div className="text-right">DIFF</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemDiff(row.original))}</div> },
      { id: "totalDiff", header: () => <div className="text-right">TOTAL DIFF</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemTotalDiff(row.original))}</div> },
      { id: "totalSell", header: () => <div className="text-right">TOTAL SELL</div>, cell: ({ row }) => <div className="text-right">{fmt(getItemTotalSell(row.original))}</div> },
      {
        id: "actions",
        header: () => null,
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => openEdit(row.original)}>
                <IconPencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => openDeleteDialog(row.original.id, row.original.name)}>
                <IconTrash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [data.shipments, openEdit, openDeleteDialog]
  );

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const table = useReactTable({
    data: data.shipmentItems,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-xl font-semibold">Items</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="size-4" />
                <span className="hidden lg:inline">Columns</span>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-64 overflow-y-auto">
              {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                <p className="text-muted-foreground text-sm">ETB/unit = purchase price × 27 (calculated automatically)</p>
              </div>
              <SheetFooter>
                <Button type="submit">{editingId ? "Update" : "Add"} Item</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No items. Add a shipment first, then add items.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} row(s)
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((n) => (
                    <SelectItem key={n} value={`${n}`}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">First page</span>
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Previous</span>
                <IconChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <span className="sr-only">Next</span>
                <IconChevronRight className="size-4" />
              </Button>
              <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <span className="sr-only">Last page</span>
                <IconChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete item &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
