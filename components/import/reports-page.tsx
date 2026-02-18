"use client";

import { ReportsSection } from "./reports-section";

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <h1 className="px-4 text-xl font-semibold lg:px-6">Reports</h1>
      <ReportsSection />
    </div>
  );
}
