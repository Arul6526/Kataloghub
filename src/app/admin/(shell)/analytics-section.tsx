import { createAdminClient } from "@/lib/supabase/server";
import { AnalyticsChartClient, type ChartData } from "./analytics-chart-client";

export async function AnalyticsSection({ storeSlug }: { storeSlug?: string }) {
  const supabase = createAdminClient();
  
  // Fetch data for the last 7 days
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  let query = supabase
    .from("page_views")
    .select("created_at, session_hash, path")
    .gte("created_at", sevenDaysAgo.toISOString())
    .lte("created_at", today.toISOString());

  if (storeSlug) {
    query = query.ilike("path", `/toko/${storeSlug}%`);
  }

  const { data } = await query;

  // Aggregate by day
  const rawData = data || [];
  const chartDataMap: Record<string, { views: number; uniqueSet: Set<string> }> = {};

  // Initialize all 7 days so days with 0 views still show up on the chart
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    chartDataMap[dateStr] = { views: 0, uniqueSet: new Set() };
  }

  for (const row of rawData) {
    const d = new Date(row.created_at);
    const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (chartDataMap[dateStr]) {
      chartDataMap[dateStr].views++;
      chartDataMap[dateStr].uniqueSet.add(row.session_hash);
    }
  }

  const chartData: ChartData[] = Object.entries(chartDataMap).map(([date, stats]) => ({
    date,
    views: stats.views,
    unique: stats.uniqueSet.size,
  }));

  const totalViews = chartData.reduce((acc, curr) => acc + curr.views, 0);
  const totalUnique = chartData.reduce((acc, curr) => acc + curr.unique, 0);

  return (
    <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Kunjungan Website</h2>
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Statistik pengunjung dalam 7 hari terakhir</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total Kunjungan</p>
            <p className="font-mono font-bold text-2xl tracking-tight">{totalViews}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pengunjung Unik</p>
            <p className="font-mono font-bold text-2xl tracking-tight text-blue-500">{totalUnique}</p>
          </div>
        </div>
      </div>
      <AnalyticsChartClient data={chartData} />
    </div>
  );
}
