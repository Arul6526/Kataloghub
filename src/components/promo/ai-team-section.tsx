import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  MessageCircle,
  Package,
  Send,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const AI_TEAM = [
  {
    icon: Package,
    role: "PRODUCT AI",
    title: "Produk lebih siap jual",
    detail: "Rapikan data, tulis deskripsi, dan temukan celah katalog.",
    tone: "text-blue-600 dark:text-blue-300 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Send,
    role: "MARKETING AI",
    title: "Konten tidak pernah buntu",
    detail: "Caption, CTA, hashtag, dan ide campaign untuk sosial media.",
    tone: "text-violet-600 dark:text-violet-300 bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: BarChart3,
    role: "BUSINESS AI",
    title: "Keputusan lebih terarah",
    detail: "Ubah katalog dan data toko menjadi langkah pertumbuhan.",
    tone: "text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: MessageCircle,
    role: "SALES AI",
    title: "Peluang tidak terlewat",
    detail: "Siapkan balasan, follow-up, dan rekomendasi produk.",
    tone: "text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
];

export function AiTeamSection() {
  return (
    <section
      id="ai-team"
      className="relative overflow-hidden border-b border-border bg-card py-14 sm:py-20 lg:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.12),transparent_32%),radial-gradient(circle_at_90%_80%,hsl(262_83%_58%/0.10),transparent_30%)]" />
      <div className="bg-paper-dots absolute inset-0 opacity-40" />

      <div className="container relative z-10 px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> KatalogHub AI Team
            </div>
            <h2 className="font-space text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Bukan sekadar chatbot.
              <span className="block text-primary">Ini tim yang masuk ke bisnis Anda.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Satu ruang kerja untuk membuat katalog lebih rapi, promosi lebih konsisten, keputusan
              lebih cepat, dan percakapan penjualan lebih siap. AI KatalogHub bekerja dengan konteks
              toko Anda, bukan jawaban generik.
            </p>

            <div className="mt-6 grid gap-2 text-xs font-medium text-muted-foreground sm:grid-cols-2">
              {[
                "Mode Managed by KatalogHub",
                "BYOK dengan provider pilihan Anda",
                "Product, Marketing, Business, Sales AI",
                "Konten siap dibagikan ke media sosial",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> {item}
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90"
            >
              Masukkan AI ke Toko Anda <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background/90 shadow-2xl ring-1 ring-primary/10 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">AI TEAM / TOKO ANDA</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Gateway online · context connected
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Active
                </span>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                {AI_TEAM.map((member) => {
                  const Icon = member.icon;
                  return (
                    <div
                      key={member.role}
                      className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${member.tone}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
                            {member.role}
                          </p>
                          <h3 className="mt-1 text-sm font-bold leading-tight">{member.title}</h3>
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                        {member.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Business signal
                    </p>
                    <p className="truncate text-xs font-semibold">
                      "Buatkan campaign promo ATK untuk awal tahun ajaran"
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> AI GATEWAY ROUTING{" "}
                  <span className="h-px flex-1 bg-border" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
