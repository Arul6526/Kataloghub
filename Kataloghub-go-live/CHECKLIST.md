# Checklist Produksi: KatalogHub

Yang Mulia, ini adalah daftar hal-hal yang wajib diselesaikan sebelum KatalogHub siap untuk *go-live* ke dunia nyata.

## 🛡️ Security & Auth
- [ ] **Logging:** Hapus semua `console.log` di *server-side* yang berpotensi membocorkan informasi sensitif (cek `src/lib/actions/product-actions.ts`).
- [ ] **Rate Limiting:** Terapkan *rate limiting* pada `Server Actions` utama melalui `middleware.ts` untuk mencegah *brute force*.
- [ ] **RLS Audit:** Pastikan semua tabel di Supabase memiliki *Row Level Security* (RLS) yang aktif dan tepat, jangan hanya mengandalkan pengecekan di kode backend.

## ⚙️ Data Integrity & Transactions
- [ ] **Atomic Operations:** Pertimbangkan untuk membungkus operasi *save* (yang melibatkan banyak *delete* & *insert* sekaligus) menjadi satu *Database Function* (RPC) di Supabase untuk memastikan *atomicity* (all or nothing).
- [ ] **JSON Schema Validation:** Pastikan kolom bertipe JSONB (seperti `gallery`) memiliki *check constraint* di level database agar data tetap valid.

## 🚀 Performance & Infrastructure
- [ ] **Monitoring:** Siapkan *error tracking* (seperti Sentry atau log-monitoring dari Supabase/Vercel) untuk memantau error *runtime* di produksi.
- [ ] **Caching:** Verifikasi strategi `revalidatePath` agar tidak ada data *stale* (basi) yang muncul setelah admin melakukan update produk.
- [ ] **Environment Variables:** Pastikan semua *environment variables* (Supabase URL, Anon Key, Service Role) di-*set* di dashboard hosting dan tidak ada file `.env` yang ter-commit ke Git.

## 🧪 Quality Assurance (QA)
- [ ] **Smoke Test:** Jalankan simulasi *end-to-end* (Admin upload produk -> Produk tampil di toko -> Hapus produk -> Produk hilang dari toko).
- [ ] **Error Fallback:** Pastikan UI menampilkan *feedback* yang jelas jika *Server Action* gagal (misal: *toast notification* yang muncul saat database error).

---
*Status: Dalam pengerjaan.*
*Dibuat oleh: Partner Coding Yang Mulia.*
