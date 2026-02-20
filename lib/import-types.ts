export type ShipmentStatus = "booked" | "partially_paid" | "fully_paid";

export interface Shipment {
  id: number;
  supplier: string;
  piNumber: string;
  currency: string;
  totalAmountRmb: number;
  bookingRate: number;
  quantity: number;
  status: ShipmentStatus;
  createdAt: string;
}

export interface ShipmentItem {
  id: number;
  shipmentId: number;
  name: string;
  ctn: number;           // Cartons
  qty: number;           // Quantity per carton
  purPrice: number;      // Purchase price per unit (RMB)
  tax: number;           // Tax per unit
  crmRate: number;       // CRM rate (e.g. 0.033)
  sfPrice: number;       // Selling price per unit
  ftrPerUnit: number;    // Freight per unit
  bookingRate: number;
}

export interface Payment {
  id: number;
  shipmentId: number;
  amountRmb: number;
  actualRate: number;
  date: string;
  etbPaid: number;
  forexGainLoss: number;
  note?: string;
}

export interface ImportData {
  shipments: Shipment[];
  shipmentItems: ShipmentItem[];
  payments: Payment[];
}

// Computed values for item (Excel-style)
export function getItemTotalUnits(item: ShipmentItem): number {
  return item.ctn * item.qty;
}

export function getItemTotalRmb(item: ShipmentItem): number {
  return getItemTotalUnits(item) * item.purPrice;
}

export function getItemTotalFtr(item: ShipmentItem): number {
  return getItemTotalUnits(item) * item.ftrPerUnit;
}

export function getItemTotalTax(item: ShipmentItem): number {
  return getItemTotalUnits(item) * item.tax;
}

// export function getItemCrmCostPerUnit(item: ShipmentItem): number {
//   return (item.purPrice + item.ftrPerUnit + item.tax + item.sfPrice) * item.crmRate;
// }

const CRM_BASE = 300;

export function getItemCrmCostPerUnit(item: ShipmentItem): number {
  return CRM_BASE * item.crmRate;
}

export function getItemTotalCrm(item: ShipmentItem): number {
  return getItemTotalUnits(item) * getItemCrmCostPerUnit(item);
}

export function getItemCostPerUnit(item: ShipmentItem): number {
  // ftrPerUnit (ETB/UNIT) is in ETB; convert to RMB using booking rate: ETB * rate = RMB equivalent
  const ftrRmb = item.ftrPerUnit * item.bookingRate;
  return item.purPrice + ftrRmb + item.tax + getItemCrmCostPerUnit(item);
}

export function getItemTotalCost(item: ShipmentItem): number {
  return getItemTotalUnits(item) * getItemCostPerUnit(item);
}

export function getItemDiff(item: ShipmentItem): number {
  return item.sfPrice - getItemCostPerUnit(item);
}

export function getItemTotalDiff(item: ShipmentItem): number {
  return getItemTotalUnits(item) * getItemDiff(item);
}

export function getItemTotalSell(item: ShipmentItem): number {
  return getItemTotalUnits(item) * item.sfPrice;
}

// Inventory cost in ETB (total cost * booking rate)
export function getItemCostEtb(item: ShipmentItem): number {
  return getItemTotalCost(item) * item.bookingRate;
}

// Forex gain/loss per payment: (bookingRate - actualRate) * amountRmb
// Positive = gain (paid less ETB than booked), Negative = loss
export function calculateForexGainLoss(
  amountRmb: number,
  bookingRate: number,
  actualRate: number
): number {
  const bookedEtb = amountRmb * bookingRate;
  const actualEtb = amountRmb * actualRate;
  return bookedEtb - actualEtb; // positive = we paid less = gain
}
