"use client";

import * as React from "react";
import {
  type ImportData,
  type Shipment,
  type ShipmentItem,
  type Payment,
  calculateForexGainLoss,
} from "./import-types";

const STORAGE_KEY = "import-data";

function loadDataFromStorage(initial: ImportData): ImportData {
  if (typeof window === "undefined") return initial;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ImportData;
    }
  } catch {
    // ignore
  }
  return initial;
}

function saveData(data: ImportData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map((x) => x.id)) + 1 : 1;
}

interface ImportDataContextValue {
  data: ImportData;
  // Shipments CRUD
  addShipment: (s: Omit<Shipment, "id" | "createdAt" | "status">) => void;
  updateShipment: (id: number, s: Partial<Omit<Shipment, "id" | "createdAt">>) => void;
  deleteShipment: (id: number) => void;
  // Items CRUD
  addItem: (item: Omit<ShipmentItem, "id">) => void;
  updateItem: (id: number, item: Partial<Omit<ShipmentItem, "id">>) => void;
  deleteItem: (id: number) => void;
  // Payments CRUD
  addPayment: (p: Omit<Payment, "id" | "etbPaid" | "forexGainLoss">) => void;
  updatePayment: (id: number, p: Partial<Omit<Payment, "id" | "shipmentId">>) => void;
  deletePayment: (id: number) => void;
  updateShipmentStatus: (id: number, status: Shipment["status"]) => void;
  resetToDefault: (initial: ImportData) => void;
}

const ImportDataContext = React.createContext<ImportDataContextValue | null>(
  null
);

export function ImportDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: ImportData;
}) {
  // Always use initialData for first render to avoid hydration mismatch
  // (server and client must match; localStorage is loaded after mount)
  const [data, setData] = React.useState<ImportData>(initialData);

  React.useEffect(() => {
    const stored = loadDataFromStorage(initialData);
    setData(stored);
  }, [initialData]);

  const addShipment = React.useCallback(
    (s: Omit<Shipment, "id" | "createdAt" | "status">) => {
      setData((prev) => {
        const shipment: Shipment = {
          ...s,
          id: nextId(prev.shipments),
          status: "booked",
          createdAt: new Date().toISOString(),
        };
        const next = {
          ...prev,
          shipments: [...prev.shipments, shipment],
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const addItem = React.useCallback((item: Omit<ShipmentItem, "id">) => {
    setData((prev) => {
      const newItem: ShipmentItem = {
        ...item,
        id: nextId(prev.shipmentItems),
      };
      const next = {
        ...prev,
        shipmentItems: [...prev.shipmentItems, newItem],
      };
      saveData(next);
      return next;
    });
  }, []);

  const addPayment = React.useCallback(
    (p: Omit<Payment, "id" | "etbPaid" | "forexGainLoss">) => {
      setData((prev) => {
        const shipment = prev.shipments.find((s) => s.id === p.shipmentId);
        const bookingRate = shipment?.bookingRate ?? 0;
        const etbPaid = p.amountRmb * p.actualRate;
        const forexGainLoss = calculateForexGainLoss(
          p.amountRmb,
          bookingRate,
          p.actualRate
        );
        const payment: Payment = {
          ...p,
          id: nextId(prev.payments),
          etbPaid,
          forexGainLoss,
        };
        const totalPaidRmb = [
          ...prev.payments.filter((x) => x.shipmentId === p.shipmentId),
          payment,
        ].reduce((sum, x) => sum + x.amountRmb, 0);
        const totalRmb = shipment?.totalAmountRmb ?? 0;
        const newStatus: Shipment["status"] =
          totalPaidRmb >= totalRmb ? "fully_paid" : "partially_paid";
        const next = {
          ...prev,
          payments: [...prev.payments, payment],
          shipments: prev.shipments.map((s) =>
            s.id === p.shipmentId ? { ...s, status: newStatus } : s
          ),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const updateShipment = React.useCallback(
    (id: number, updates: Partial<Omit<Shipment, "id" | "createdAt">>) => {
      setData((prev) => {
        const next = {
          ...prev,
          shipments: prev.shipments.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const deleteShipment = React.useCallback((id: number) => {
    setData((prev) => {
      const next = {
        ...prev,
        shipments: prev.shipments.filter((s) => s.id !== id),
        shipmentItems: prev.shipmentItems.filter((i) => i.shipmentId !== id),
        payments: prev.payments.filter((p) => p.shipmentId !== id),
      };
      saveData(next);
      return next;
    });
  }, []);

  const updateItem = React.useCallback(
    (id: number, updates: Partial<Omit<ShipmentItem, "id">>) => {
      setData((prev) => {
        const next = {
          ...prev,
          shipmentItems: prev.shipmentItems.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const deleteItem = React.useCallback((id: number) => {
    setData((prev) => {
      const next = {
        ...prev,
        shipmentItems: prev.shipmentItems.filter((i) => i.id !== id),
      };
      saveData(next);
      return next;
    });
  }, []);

  const updatePayment = React.useCallback(
    (id: number, updates: Partial<Omit<Payment, "id" | "shipmentId">>) => {
      setData((prev) => {
        const payment = prev.payments.find((p) => p.id === id);
        if (!payment) return prev;
        const merged = { ...payment, ...updates };
        const shipment = prev.shipments.find((s) => s.id === payment.shipmentId);
        const bookingRate = shipment?.bookingRate ?? 0;
        const etbPaid = merged.amountRmb * merged.actualRate;
        const forexGainLoss = calculateForexGainLoss(
          merged.amountRmb,
          bookingRate,
          merged.actualRate
        );
        const updatedPayment: Payment = { ...merged, etbPaid, forexGainLoss };
        const otherPayments = prev.payments.filter((p) => p.id !== id);
        const totalPaidRmb = [
          ...otherPayments.filter((x) => x.shipmentId === payment.shipmentId),
          updatedPayment,
        ].reduce((sum, x) => sum + x.amountRmb, 0);
        const totalRmb = shipment?.totalAmountRmb ?? 0;
        const newStatus: Shipment["status"] =
          totalPaidRmb >= totalRmb ? "fully_paid" : "partially_paid";
        const next = {
          ...prev,
          payments: prev.payments.map((p) =>
            p.id === id ? updatedPayment : p
          ),
          shipments: prev.shipments.map((s) =>
            s.id === payment.shipmentId ? { ...s, status: newStatus } : s
          ),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const deletePayment = React.useCallback((id: number) => {
    setData((prev) => {
      const payment = prev.payments.find((p) => p.id === id);
      if (!payment) return prev;
      const otherPayments = prev.payments.filter((p) => p.id !== id);
      const totalPaidRmb = otherPayments
        .filter((x) => x.shipmentId === payment.shipmentId)
        .reduce((sum, x) => sum + x.amountRmb, 0);
      const shipment = prev.shipments.find((s) => s.id === payment.shipmentId);
      const totalRmb = shipment?.totalAmountRmb ?? 0;
      const newStatus: Shipment["status"] =
        totalPaidRmb >= totalRmb ? "fully_paid" : totalPaidRmb > 0 ? "partially_paid" : "booked";
      const next = {
        ...prev,
        payments: otherPayments,
        shipments: prev.shipments.map((s) =>
          s.id === payment.shipmentId ? { ...s, status: newStatus } : s
        ),
      };
      saveData(next);
      return next;
    });
  }, []);

  const updateShipmentStatus = React.useCallback(
    (id: number, status: Shipment["status"]) => {
      setData((prev) => {
        const next = {
          ...prev,
          shipments: prev.shipments.map((s) =>
            s.id === id ? { ...s, status } : s
          ),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const resetToDefault = React.useCallback((initial: ImportData) => {
    setData(initial);
    saveData(initial);
  }, []);

  const value = React.useMemo(
    () => ({
      data,
      addShipment,
      updateShipment,
      deleteShipment,
      addItem,
      updateItem,
      deleteItem,
      addPayment,
      updatePayment,
      deletePayment,
      updateShipmentStatus,
      resetToDefault,
    }),
    [
      data,
      addShipment,
      updateShipment,
      deleteShipment,
      addItem,
      updateItem,
      deleteItem,
      addPayment,
      updatePayment,
      deletePayment,
      updateShipmentStatus,
      resetToDefault,
    ]
  );

  return (
    <ImportDataContext.Provider value={value}>
      {children}
    </ImportDataContext.Provider>
  );
}

export function useImportData() {
  const ctx = React.useContext(ImportDataContext);
  if (!ctx) throw new Error("useImportData must be used within ImportDataProvider");
  return ctx;
}
