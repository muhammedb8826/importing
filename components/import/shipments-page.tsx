"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
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

import { Badge } from "@/components/ui/badge";
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
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; piNumber: string } | null>(null);

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

  function openDeleteDialog(id: number, piNumber: string) {
    setDeleteTarget({ id, piNumber });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteShipment(deleteTarget.id);
    toast.success("Shipment deleted");
    setDeleteTarget(null);
  }

  const columns = React.useMemo<ColumnDef<Shipment>[]>(
    () => [
      {
        accessorKey: "piNumber",
        header: "PI Number",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.piNumber}</span>
        ),
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
      },
      {
        accessorKey: "totalAmountRmb",
        header: () => <div className="text-right">Total (RMB)</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.totalAmountRmb.toLocaleString()} {row.original.currency}
          </div>
        ),
      },
      {
        accessorKey: "bookingRate",
        header: () => <div className="text-right">Booking Rate</div>,
        cell: ({ row }) => (
          <div className="text-right">{row.original.bookingRate}</div>
        ),
      },
      {
        id: "bookedEtb",
        header: () => <div className="text-right">Booked ETB</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {(row.original.totalAmountRmb * row.original.bookingRate).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            ETB
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="gap-1">
            {row.original.status === "fully_paid" ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            ) : (
              <IconLoader className="size-3" />
            )}
            {statusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => null,
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => openEdit(row.original)}>
                <IconPencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => openDeleteDialog(row.original.id, row.original.piNumber)}
              >
                <IconTrash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [openEdit, openDeleteDialog]
  );

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const table = useReactTable({
    data: data.shipments,
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
        <h1 className="text-xl font-semibold">Shipments / PI</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="size-4" />
                <span className="hidden lg:inline">Columns</span>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
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
      </div>
      <div className="relative flex flex-1 min-h-0 flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                    No shipments. Click &quot;Add PI&quot; to create one.
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
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((n) => (
                    <SelectItem key={n} value={`${n}`}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">First page</span>
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Previous</span>
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Next</span>
                <IconChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
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
            <AlertDialogTitle>Delete shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete shipment {deleteTarget?.piNumber}? This will also delete all items and payments.
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
