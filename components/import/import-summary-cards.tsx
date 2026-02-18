"use client";

import { IconCurrencyYen, IconReceipt, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useImportData } from "@/lib/import-store";
import { getItemCostEtb } from "@/lib/import-types";

export function ImportSummaryCards() {
  const { data } = useImportData();

  const totalBookedEtb = data.shipments.reduce(
    (sum, s) => sum + s.totalAmountRmb * s.bookingRate,
    0
  );
  const totalPaidEtb = data.payments.reduce((sum, p) => sum + p.etbPaid, 0);
  const totalForex = data.payments.reduce((sum, p) => sum + p.forexGainLoss, 0);
  const totalInventoryCost = data.shipmentItems.reduce(
    (sum, i) => sum + getItemCostEtb(i),
    0
  );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Booked (ETB)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBookedEtb.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <span className="text-muted-foreground text-xs">RMB → ETB</span>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {data.shipments.length} shipment(s) at booking rate
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Paid (ETB)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPaidEtb.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <span className="text-muted-foreground text-xs">Actual rate</span>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {data.payments.length} payment(s) recorded
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Forex Gain / Loss</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
              totalForex >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {totalForex >= 0 ? "+" : ""}
            {totalForex.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
          </CardTitle>
          <CardAction>
            {totalForex >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {totalForex >= 0 ? "Gain" : "Loss"} vs booking rate
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Inventory Cost (ETB)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalInventoryCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <IconCurrencyYen className="size-4" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {data.shipmentItems.length} item(s) across shipments
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
