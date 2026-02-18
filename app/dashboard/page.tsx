import { ImportSummaryCards } from "@/components/import"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <h1 className="px-4 text-xl font-semibold lg:px-6">Dashboard</h1>
      <ImportSummaryCards />
    </div>
  )
}
