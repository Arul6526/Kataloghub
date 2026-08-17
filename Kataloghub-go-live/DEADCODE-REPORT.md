# Laporan Scanner Dead Code — KatalogHub

**Tanggal:** 2026-07-28
**Tool:** `knip` (scanner unused-export / unused-dependency untuk TS/Next.js)
**Scope:** `src/` + root project files

---

## 🟢 RINGKASAN (SETELAH VERIFIKASI MANUAL)
- **Dead code di level aplikasi (`src/`): SANGAT SEDIKIT.** Hanya 2 function auth yang benar-benar tidak dipakai.
- **Dead dependency: BANYAK.** 9 dependency terpasang tapi tidak dipakai → bikin image Docker & install time lebih besar dari perlu.
- **File sampah di root: 8 file** (2 `.js` script + 6 `.sql` duplikat).

> ⚠️ Catatan: Knip juga melaporkan 27 "unused export" lain (mis. `buttonVariants`, `formatDate`, `ToastVariant`, dll). Setelah cek manual, **itu false positive** — export tersebut dipakai sebagai building-block UI/utils oleh file lain. **JANGAN** dihapus.

---

## 🔴 DEAD DEPENDENCY (BENERAN TIDAK DIPAKAI — AMAN DIHAPUS)

| Package | Bukti | Aksi |
|---------|-------|------|
| `pg` | Hanya dipakai `migrate2.js` (root script) | Hapus dari package.json |
| `react-hook-form` | 0 file di `src` import; tidak ada `useForm`/`Controller` | Hapus |
| `@hookform/resolvers` | 0 file di `src` import | Hapus (pasangan RHF) |
| `@radix-ui/react-avatar` | 0 import; file `avatar.tsx` tidak ada di disk | Hapus |
| `@radix-ui/react-tabs` | 0 import; file `tabs.tsx` tidak ada di disk | Hapus |
| `@radix-ui/react-toast` | 0 import; `toast.tsx` pakai lucide custom, bukan radix | Hapus |
| `@radix-ui/react-tooltip` | 0 import; file `tooltip.tsx` tidak ada di disk | Hapus |
| `dotenv` | Hanya dipakai `check_users.js`/`migrate2.js` | Hapus (Next.js pakai `.env.local` native) |

**Radix yang TETAP dibutuhkan (jangan hapus):** react-checkbox, react-dialog, react-dropdown-menu, react-label, react-select, react-separator, react-slot, react-switch.

> `eslint` & `eslint-config-next` dilaporkan unused oleh Knip karena script `lint` pakai `next lint` (bukan binary eslint langsung). **JANGAN hapus** — masih dibutuhkan Next.js.

---

## 🟡 DEAD FUNCTION DI `src/lib/auth.ts`
| Function | Bukti | Aksi |
|----------|-------|------|
| `isAdmin` | Tidak ada caller. Yang ke-match di middleware adalah variabel lokal `isAdminArea`, bukan function ini. | Hapus |
| `isSuperAdmin` | Sama — hanya `isSuperAdminArea` (variabel) yang dipakai di middleware. | Hapus |

**Function auth yang TETAP dipakai (jangan hapus):** `requireAdmin`, `getCurrentUser`.

---

## 🟠 FILE SAMPAH DI ROOT (TIDAK TER-DEPLOY TAPI MENGOTORI REPO)
| File | Alasan |
|------|--------|
| `check_users.js` | Script debug one-off, baca `SUPABASE_SERVICE_ROLE_KEY` mentah. Tidak dirujuk di mana pun. |
| `migrate2.js` | Script migrasi satu kali pakai `pg`. Tidak dirujuk. |
| `migration-multitenant.sql` | Duplikat dari `supabase/migrations/`. |
| `patch-multitenant.sql` | Duplikat. |
| `patch-order-leads.sql` | Duplikat. |
| `patch-rls.sql` | Duplikat. |
| `patch-saas.sql` | Duplikat. |
| `patch-trigger.sql` | Duplikat. |

**Artifact yang perlu di-gitignore (bukan dihapus secara fisik):**
- `.impeccable/` — output skill agent.
- `graphify-out/` — output analisis graph kita.

---

## ✅ REKOMENDASI EKSEKUSI (URUTAN AMAN)
1. Hapus 2 file `.js` root + 6 file `.sql` root.
2. Tambahkan `.impeccable/` & `graphify-out/` ke `.gitignore`.
3. Hapus 8 dependency unused di `package.json`, lalu `npm install` (atau `pnpm install`) untuk sync lockfile.
4. Hapus function `isAdmin` & `isSuperAdmin` di `src/lib/auth.ts`.
5. Jalankan `npm run build` sebagai smoke test — pastikan tidak ada error import.

---
*Dibuat oleh: Partner Coding Yang Mulia.*
