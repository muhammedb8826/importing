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
  IconTrendingDown,
  IconTrendingUp,
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
import type { Payment } from "@/lib/import-types";

export function PaymentsPage() {
  const { data, addPayment, updatePayment, deletePayment } = useImportData();
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);

  const [shipmentId, setShipmentId] = React.useState<string>("");
  const [amountRmb, setAmountRmb] = React.useState("");
  const [actualRate, setActualRate] = React.useState("");
  const [date, setDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = React.useState("");

  function resetForm() {
    setShipmentId("");
    setAmountRmb("");
    setActualRate("");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
    setEditingId(null);
  }

  function openEdit(p: Payment) {
    setEditingId(p.id);
    setShipmentId(String(p.shipmentId));
    setAmountRmb(String(p.amountRmb));
    setActualRate(String(p.actualRate));
    setDate(p.date);
    setNote(p.note ?? "");
    setOpen(true);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sid = parseInt(shipmentId, 10);
    const amount = parseFloat(amountRmb);
    const rate = parseFloat(actualRate);
    if (!shipmentId || isNaN(amount) || isNaN(rate)) {
      toast.error("Please fill required fields correctly");
      return;
    }
    if (editingId) {
      updatePayment(editingId, {
        amountRmb: amount,
        actualRate: rate,
        date,
        note: note.trim() || undefined,
      });
      toast.success("Payment updated");
    } else {
      addPayment({
        shipmentId: sid,
        amountRmb: amount,
        actualRate: rate,
        date,
        note: note.trim() || undefined,
      });
      toast.success("Payment recorded");
    }
    resetForm();
    setOpen(false);
  }

  function openDeleteDialog(id: number) {
    setDeleteTarget(id);
  }

  function confirmDelete() {
    if (deleteTarget == null) return;
    deletePayment(deleteTarget);
    toast.success("Payment deleted");
    setDeleteTarget(null);
  }

  const columns = React.useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        id: "shipment",
        header: "Shipment",
        cell: ({ row }) => {
          const p = row.original;
          const shipment = data.shipments.find((s) => s.id === p.shipmentId);
          return <span className="font-medium">{shipment?.piNumber ?? p.shipmentId}</span>;
        },
      },
      { accessorKey: "date", header: "Date" },
      {
        accessorKey: "amountRmb",
        header: () => <div className="text-right">Amount (RMB)</div>,
        cell: ({ row }) => <div className="text-right">{row.original.amountRmb.toLocaleString()} RMB</div>,
      },
      {
        accessorKey: "actualRate",
        header: () => <div className="text-right">Actual Rate</div>,
        cell: ({ row }) => <div className="text-right">{row.original.actualRate}</div>,
      },
      {
        accessorKey: "etbPaid",
        header: () => <div className="text-right">ETB Paid</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.etbPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
          </div>
        ),
      },
      {
        accessorKey: "forexGainLoss",
        header: () => <div className="text-right">Forex G/L</div>,
        cell: ({ row }) => {
          const p = row.original;
          const isGain = p.forexGainLoss >= 0;
          return (
            <div className={`text-right font-medium ${isGain ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {isGain ? <IconTrendingUp className="inline size-3" /> : <IconTrendingDown className="inline size-3" />}{" "}
              {isGain ? "+" : ""}{p.forexGainLoss.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
            </div>
          );
        },
      },
      {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.note ?? "—"}</span>,
      },
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
              <DropdownMenuItem variant="destructive" onClick={() => openDeleteDialog(row.original.id)}>
                <IconTrash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [data, openEdit, openDeleteDialog]
  );

  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const table = useReactTable({
    data: data.payments,
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
        <h1 className="text-xl font-semibold">Payments</h1>
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
              Record Payment
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>{editingId ? "Edit" : "Record"} Payment</SheetTitle>
                <SheetDescription>
                  {editingId ? "Update" : "Enter"} RMB amount and actual exchange rate. Forex gain/loss is calculated automatically.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="pay-shipment">Shipment</Label>
                  <Select
                    value={shipmentId}
                    onValueChange={setShipmentId}
                    disabled={!!editingId}
                  >
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
                <Button type="submit">{editingId ? "Update" : "Record"} Payment</Button>
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
                    No payments. Record a partial or full payment.
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
      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this payment? This action cannot be undone.
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
