# Implementation Plan: Web App Katalog Produk Online

## Ringkasan

Implementation plan ini menurunkan spesifikasi desain menjadi urutan kerja yang bisa dieksekusi bertahap untuk membangun web app katalog produk dengan admin panel. Fokus MVP tetap pada presentasi brand, pengelolaan katalog teknis, dan konversi `Tanya Harga via WhatsApp`.

Versi awal tidak mencakup fitur e-commerce penuh seperti harga, checkout, pembayaran, keranjang, akun pelanggan, stok, atau multi-admin dengan role kompleks.

## Sasaran MVP

MVP dianggap berhasil jika:

- admin bisa login
- admin bisa membuat kategori
- admin bisa membuat template spesifikasi per kategori
- admin bisa menambahkan produk lengkap dengan foto, galeri, dokumen, dan spesifikasi
- admin bisa mengelola landing page dasar
- admin bisa mengatur nomor WhatsApp dan template pesan
- pengunjung bisa membuka landing page, katalog, dan detail produk
- pengunjung bisa melakukan search dan filter sederhana
- pengunjung bisa klik `Tanya Harga via WhatsApp` dengan konteks nama produk

## Prinsip Implementasi

- bangun jalur katalog utama lebih dulu
- kunci model data sebelum UI kompleks dibangun
- prioritaskan workflow admin karena seluruh konten publik bergantung padanya
- jaga scope tetap fokus pada MVP
- pisahkan dengan jelas data landing page, data katalog, dan pengaturan global

## Urutan Dependensi

Urutan implementasi tingkat tinggi:

1. Fondasi aplikasi
2. Autentikasi admin
3. Model data inti
4. Modul kategori
5. Modul template spesifikasi kategori
6. Modul produk, galeri, dan dokumen
7. Pengaturan situs dan WhatsApp
8. Website publik: shell dan landing page
9. Website publik: katalog dan detail produk
10. Search dan filter
11. Validasi, error handling, dan hardening UX
12. Testing end-to-end MVP

Alasan urutan ini:

- UI publik tidak stabil jika model data belum dikunci
- produk tidak bisa dikelola dengan benar tanpa kategori dan template spesifikasi
- CTA WhatsApp bergantung pada pengaturan global
- search dan filter lebih aman dibangun setelah bentuk data produk benar-benar final

## Fase Implementasi

## Fase 1

### Fondasi proyek dan arsitektur dasar

Tujuan:

- menyiapkan struktur aplikasi publik dan admin
- menetapkan pola route, layout, dan organisasi modul
- menetapkan strategi media untuk gambar dan dokumen

Task:

- tetapkan arsitektur aplikasi
- tetapkan struktur route publik, auth, dan admin
- buat layout dasar untuk area publik dan admin
- tetapkan strategi upload gambar utama, galeri, dan dokumen
- tetapkan aturan slug, status tampil, sorting, dan placeholder media
- tetapkan pola validasi form dan pesan error

Definition of done:

- area publik dan admin sudah punya struktur route yang jelas
- pola layout utama sudah ditetapkan
- strategi media dan dokumen sudah dipilih
- aturan slug, status tampil, dan urutan tampil sudah konsisten

## Fase 2

### Autentikasi admin

Tujuan:

- membatasi akses admin panel hanya untuk satu admin internal

Task:

- implementasi halaman login admin
- implementasi session management
- proteksi route admin
- implementasi logout
- siapkan jalur bootstrap admin pertama

Definition of done:

- hanya admin terautentikasi yang bisa masuk area admin
- route admin terlindungi
- logout menghapus session dengan benar

## Fase 3

### Model data inti

Entitas inti:

- `Admin`
- `LandingSection`
- `Category`
- `CategorySpecTemplate`
- `CategorySpecField`
- `Product`
- `ProductSpecValue`
- `ProductDocument`
- `SiteSetting`

Keputusan domain yang harus dikunci:

- satu kategori memiliki tepat satu template spesifikasi
- satu produk berada dalam satu kategori
- spesifikasi produk mengikuti template kategori
- field spesifikasi dapat ditandai sebagai wajib
- hanya atribut tertentu yang ditandai layak menjadi filter publik

Task:

- definisikan field minimum tiap entitas
- definisikan relasi dan constraint
- tetapkan aturan slug unik
- tetapkan aturan status tampil
- tetapkan field wajib dan opsional
- tetapkan model referensi media dan dokumen

Definition of done:

- seluruh entitas dan relasi utama sudah final
- aturan field wajib, slug unik, dan status tampil sudah konsisten
- struktur spesifikasi per kategori sudah siap dipakai modul produk

## Fase 4

### Modul kategori

Tujuan:

- menyediakan struktur dasar pengelompokan katalog

Task:

- daftar kategori
- form tambah/edit kategori
- input nama, slug, deskripsi, ikon/gambar
- status tampil kategori
- urutan tampil kategori
- validasi nama wajib dan slug unik

Definition of done:

- admin dapat membuat, mengubah, dan menyembunyikan kategori
- kategori memiliki urutan tampil
- slug kategori unik

## Fase 5

### Modul template spesifikasi kategori

Tujuan:

- memastikan input produk teknis tetap konsisten per kategori

Task:

- builder field spesifikasi per kategori
- tentukan label field
- tentukan tipe field sederhana
- tandai field wajib
- tandai field yang boleh dipakai sebagai filter publik
- atur urutan field
- tampilkan preview field pada form admin

Catatan MVP:

- jangan terlalu banyak tipe field di versi awal
- cukup dukung tipe yang benar-benar diperlukan agar validasi tetap mudah

Definition of done:

- setiap kategori memiliki satu template spesifikasi aktif
- field wajib bisa divalidasi
- field filterable bisa ditandai
- urutan field bisa diatur

## Fase 6

### Modul produk, galeri, dan dokumen

Tujuan:

- membuat alur inti pengisian katalog berjalan end-to-end

Task:

- daftar produk
- form tambah/edit produk
- pilih kategori
- input nama, slug, ringkasan, deskripsi lengkap
- upload foto utama
- upload galeri
- upload dokumen unduhan
- input nilai spesifikasi berdasarkan template kategori
- input tag atau atribut filter
- atur status tampil dan urutan tampil

Aturan penting:

- produk tidak boleh tampil jika foto utama belum ada
- produk tidak boleh tampil jika field spesifikasi wajib belum lengkap
- dokumen hanya tampil di publik jika file tersedia

Definition of done:

- admin dapat membuat produk lengkap dari awal sampai siap tampil
- galeri dan dokumen berfungsi
- spesifikasi produk tervalidasi sesuai kategori
- slug produk unik

## Fase 7

### Pengaturan situs dan WhatsApp

Tujuan:

- menutup semua dependency global yang dipakai oleh website publik

Task:

- nama brand
- informasi kontak dasar
- SEO dasar
- nomor WhatsApp utama
- template pesan default WhatsApp
- validasi format nomor
- validasi template pesan

Definition of done:

- admin dapat menyimpan nomor WhatsApp valid
- template pesan tersimpan dengan benar
- link WhatsApp dapat dibentuk dengan aman

## Fase 8

### Landing page manager

Scope section MVP:

- hero banner
- tentang brand
- keunggulan perusahaan
- kategori unggulan
- produk pilihan
- testimonial atau proyek
- CTA utama

Task:

- buat struktur data `LandingSection`
- toggle tampil section
- atur urutan section
- edit teks utama
- pilih kategori unggulan
- pilih produk pilihan
- kelola CTA
- sediakan fallback aman untuk section kosong

Definition of done:

- admin dapat mengatur section utama landing page
- urutan section bisa diubah
- section kosong tidak merusak tampilan publik

## Fase 9

### Website publik: shell dan landing page

Tujuan:

- membentuk identitas brand dan pintu masuk ke katalog

Task:

- header dan navigasi utama
- footer
- CTA WhatsApp global
- render landing page dari data admin
- render hero, tentang brand, keunggulan, kategori unggulan, produk pilihan, testimonial, dan CTA
- sembunyikan section kosong dengan elegan

Definition of done:

- landing page tampil dari data admin
- CTA menuju katalog dan WhatsApp berfungsi
- identitas brand tampil konsisten

## Fase 10

### Website publik: katalog produk

Tujuan:

- memberi pengguna jalur browse produk yang cepat dan terstruktur

Task:

- daftar kategori
- search box
- filter panel
- daftar produk
- kartu produk
- pagination atau load more
- empty state jika hasil kosong
- placeholder jika foto utama tidak ada

Definition of done:

- pengguna dapat membuka katalog dari landing page atau navigasi
- hanya produk dengan status tampil yang muncul
- empty state tampil rapi dan informatif

## Fase 11

### Website publik: detail produk

Tujuan:

- menjadikan halaman detail produk sebagai halaman konversi utama

Task:

- breadcrumb kategori
- nama produk
- galeri gambar
- ringkasan
- deskripsi lengkap
- spesifikasi teknis lengkap
- dokumen unduhan jika tersedia
- produk terkait
- tombol `Tanya Harga via WhatsApp`

Aturan penting:

- pesan WhatsApp pada halaman detail harus menyertakan nama produk
- tombol unduh hanya tampil jika dokumen benar-benar ada

Definition of done:

- halaman detail memuat informasi teknis lengkap
- CTA WhatsApp aktif dan membawa konteks produk
- dokumen tampil hanya jika tersedia

## Fase 12

### Search dan filter

Tujuan:

- memenuhi kebutuhan discovery utama tanpa membuat sistem terlalu berat

Strategi MVP:

- search berdasarkan nama produk
- filter berdasarkan kategori
- filter berdasarkan tag
- filter berdasarkan atribut yang memang ditandai filterable

Task:

- implement search nama produk
- implement filter kategori
- implement filter tag
- implement filter atribut terpilih
- sinkronkan state filter dengan URL
- tampilkan ringkasan filter aktif
- sediakan reset filter

Definition of done:

- pengguna dapat melakukan kombinasi search dan filter
- hasil filter konsisten
- filter aktif terlihat jelas dan bisa di-reset

## Fase 13

### Validasi, error handling, dan hardening UX

Validasi admin:

- nama kategori wajib
- nama produk wajib
- slug unik
- kategori wajib dipilih
- foto utama wajib sebelum tampil
- field spesifikasi wajib harus lengkap
- nomor WhatsApp valid

Error handling publik:

- placeholder jika foto utama kosong
- tombol dokumen disembunyikan jika file tidak ada
- section landing kosong disembunyikan
- empty state pencarian informatif
- halaman 404 untuk slug yang tidak ditemukan

Hardening UX:

- loading state yang jelas
- feedback sukses dan gagal pada admin
- helper text pada form yang kompleks
- proteksi submit ganda

Definition of done:

- validasi kritis berjalan konsisten
- publik tetap stabil saat data belum lengkap
- admin menerima pesan validasi yang jelas

## Fase 14

### Testing dan readiness MVP

Alur admin yang wajib diuji:

1. login admin
2. buat kategori
3. buat template spesifikasi kategori
4. tambah produk dengan galeri, spesifikasi, dan dokumen
5. atur landing page
6. atur nomor WhatsApp dan CTA

Alur publik yang wajib diuji:

1. buka landing page
2. masuk ke katalog
3. cari produk
4. filter produk
5. buka detail produk
6. klik `Tanya Harga via WhatsApp`

Pengujian tambahan:

- produk tanpa dokumen
- produk tanpa gambar utama
- field spesifikasi belum lengkap
- nomor WhatsApp invalid
- hasil pencarian kosong
- kategori tanpa produk
- slug kategori atau produk tidak ditemukan

Definition of done:

- alur admin utama lolos end-to-end
- alur publik utama lolos end-to-end
- CTA WhatsApp tidak punya blocker
- halaman publik utama tetap stabil saat data kosong

## Milestone MVP

### Milestone 1

Fondasi siap:

- struktur aplikasi publik dan admin
- auth admin
- model data inti
- strategi media dan dokumen

### Milestone 2

Backoffice katalog berfungsi:

- kategori
- template spesifikasi
- produk
- galeri
- dokumen
- site setting

### Milestone 3

Website publik discovery berfungsi:

- landing page
- katalog
- detail produk
- navigasi publik
- fallback empty state

### Milestone 4

Konversi dan hardening MVP:

- search
- filter
- WhatsApp CTA
- validasi akhir
- pengujian alur utama

## Risiko utama dan mitigasi

### Kompleksitas template spesifikasi dinamis

Risiko:

- form produk terlalu rumit
- validasi sulit
- filter publik tidak konsisten

Mitigasi:

- batasi tipe field di MVP
- bedakan field tampil, field wajib, dan field filterable
- kunci aturan perubahan template setelah produk existing ada

### Scope creep ke arah e-commerce

Risiko:

- roadmap melebar ke harga, checkout, dan stok

Mitigasi:

- parkir semua fitur transaksi di luar MVP
- pertahankan fokus ke katalog dan inquiry WhatsApp

### Kualitas data admin rendah

Risiko:

- halaman publik terlihat kosong atau tidak profesional

Mitigasi:

- validasi ketat sebelum tampil
- helper text di admin
- dashboard menampilkan indikator kelengkapan

### Media dan dokumen tidak konsisten

Risiko:

- broken image
- tombol unduh mati

Mitigasi:

- placeholder gambar
- tampilkan tombol dokumen hanya jika file valid
- tetapkan metadata media minimum

### WhatsApp CTA gagal

Risiko:

- jalur konversi utama gagal

Mitigasi:

- validasi nomor di admin
- uji pembentukan link dan encoding pesan
- fallback bila setting belum lengkap

## Definisi selesai global MVP

Admin:

- admin dapat login dan logout
- admin dapat mengelola kategori
- admin dapat membuat template spesifikasi
- admin dapat mengelola produk lengkap
- admin dapat mengelola landing page dasar
- admin dapat mengatur nomor WhatsApp dan template pesan

Publik:

- landing page menampilkan identitas brand dan CTA
- pengguna dapat masuk ke katalog
- pengguna dapat mencari dan memfilter produk
- pengguna dapat membuka detail produk
- pengguna dapat klik WhatsApp dengan nama produk otomatis di pesan

Stabilitas:

- data kosong tidak merusak tampilan publik
- produk tanpa dokumen tidak menampilkan tombol unduh
- produk tanpa gambar utama menampilkan placeholder
- slug tidak valid mengarah ke halaman not found
- tidak ada fitur transaksi di MVP

## Batas scope yang harus dijaga

Jangan dimasukkan ke MVP:

- checkout
- pembayaran
- keranjang
- akun pelanggan
- manajemen stok
- multi-admin dengan role detail
- workflow editorial kompleks
- multibahasa aktif
- analytics kompleks
- integrasi marketplace

Jika kebutuhan di atas muncul, perlakukan sebagai fase lanjutan setelah MVP katalog inquiry stabil.
