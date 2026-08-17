# Desain Produk: Web App Katalog Produk Online

## Ringkasan

Proyek ini adalah web app katalog produk online untuk brand yang menampilkan landing page perusahaan dan katalog produk tanpa harga. Tujuan utama website adalah membantu pengunjung mengenal brand, menelusuri produk berdasarkan kategori, melihat informasi teknis lengkap, lalu menghubungi admin melalui WhatsApp untuk menanyakan harga.

Website ini bukan e-commerce penuh. Tidak ada checkout, pembayaran, keranjang, atau akun pelanggan pada versi awal. Fokus sistem adalah presentasi brand dan akuisisi lead melalui CTA `Tanya Harga via WhatsApp`.

## Tujuan Produk

### Tujuan bisnis

- Menampilkan brand secara profesional melalui landing page yang kuat
- Menyediakan katalog produk teknis yang rapi dan mudah dicari
- Mengarahkan calon pembeli untuk menghubungi admin melalui WhatsApp
- Memudahkan admin internal mengelola landing page dan katalog tanpa bergantung pada developer

### Tujuan pengguna

- Pengunjung dapat memahami profil brand dan keunggulan perusahaan
- Pengunjung dapat menelusuri produk per kategori
- Pengunjung dapat mencari dan memfilter produk dengan cepat
- Pengunjung dapat melihat spesifikasi teknis lengkap dan dokumen katalog
- Pengunjung dapat langsung menghubungi admin dengan konteks produk yang sedang dilihat

## Ruang Lingkup Versi Awal

### Termasuk

- Landing page brand
- Katalog produk per kategori
- Search produk
- Filter produk
- Halaman detail produk
- CTA WhatsApp pada area penting
- Admin panel untuk mengelola landing page
- Admin panel untuk mengelola kategori, template spesifikasi, produk, galeri, dan dokumen
- Pengaturan nomor WhatsApp dan format pesan default

### Tidak termasuk

- Checkout
- Pembayaran
- Keranjang
- Akun pelanggan
- Manajemen stok
- Multi-admin dengan role terpisah
- Multibahasa aktif
- Analytics kompleks
- Integrasi marketplace eksternal

## Pengguna dan Konteks

Target pengguna adalah campuran antara buyer perusahaan dan pengunjung umum. Karena itu, pengalaman penggunaan harus terlihat profesional untuk B2B tetapi tetap mudah dipahami oleh audiens non-teknis.

Konten utama yang diutamakan adalah Bahasa Indonesia. Struktur data tidak perlu mendukung multibahasa aktif pada versi awal.

Admin panel diasumsikan dikelola oleh satu admin internal. Maka alur admin dapat dibuat ringkas tanpa kebutuhan role dan permission yang kompleks.

## Arah Desain

Gaya visual yang dipilih adalah `industrial teknikal`. Tampilan harus terasa tegas, informatif, bersih, dan fokus pada kredibilitas brand serta detail produk. Desain tidak perlu terasa seperti marketplace promo dan tidak boleh terasa seperti toko online umum.

Karakter antarmuka yang diinginkan:

- Struktur rapi dan mudah dibaca
- Hirarki informasi kuat
- Penekanan pada kategori, spesifikasi, dan dokumen
- CTA WhatsApp jelas tetapi tidak terasa agresif
- Cocok untuk katalog produk teknis dan kebutuhan B2B

## Pendekatan Solusi

Pendekatan yang dipilih adalah membangun CMS custom terfokus untuk katalog brand, bukan memodifikasi sistem e-commerce penuh.

Alasan pemilihan:

- Kebutuhan inti bersifat katalog, bukan transaksi
- Struktur admin lebih bersih karena hanya memuat fitur yang benar-benar diperlukan
- Pengalaman publik lebih sesuai dengan citra brand daripada pola toko online
- Template spesifikasi per kategori dapat didesain langsung sesuai domain produk

## Arsitektur Tingkat Tinggi

Sistem dibagi menjadi dua area utama:

1. Website publik
2. Admin panel

### Website publik

Website publik bertugas menampilkan identitas brand, kategori produk, daftar produk, detail produk, pencarian, filter, dan jalur kontak ke WhatsApp.

### Admin panel

Admin panel bertugas mengelola seluruh konten yang tampil pada website publik, termasuk section landing page, kategori, template spesifikasi, produk, media, dokumen, dan pengaturan situs.

## Struktur Halaman Publik

### Landing page

Landing page berisi:

- Hero banner
- Tentang brand
- Keunggulan perusahaan
- Kategori unggulan
- Produk pilihan
- Testimonial atau proyek
- CTA menuju katalog
- CTA WhatsApp

Landing page harus mampu berfungsi sebagai halaman pengenalan brand sekaligus pintu masuk ke katalog.

### Halaman katalog

Halaman katalog menampilkan daftar produk dengan susunan berbasis kategori, kolom pencarian, dan filter. Halaman ini harus memudahkan pengguna masuk dari kategori terlebih dahulu, lalu mempersempit pilihan dengan search dan filter tambahan.

Filter awal dirancang cukup fleksibel untuk dipakai pada katalog teknis. Nilai filter dapat berasal dari kategori, tag, brand, aplikasi, atau atribut spesifikasi yang relevan.

### Halaman detail produk

Halaman detail produk adalah fokus utama konversi. Halaman ini berisi:

- Nama produk
- Breadcrumb kategori
- Galeri gambar
- Deskripsi singkat
- Deskripsi lengkap
- Spesifikasi teknis lengkap
- Dokumen atau katalog unduhan
- Produk terkait
- Tombol `Tanya Harga via WhatsApp`

CTA WhatsApp pada halaman ini harus membawa konteks produk secara otomatis ke pesan awal agar admin lebih mudah menindaklanjuti.

## Alur Pengguna

Alur utama pengguna publik:

`Landing page -> pilih kategori atau cari produk -> filter produk -> buka detail produk -> klik WhatsApp`

Alur ini menjaga pengalaman tetap fokus pada discovery dan inquiry, bukan transaksi.

## Desain Admin Panel

Admin panel dibagi menjadi beberapa modul inti.

### Dashboard

Dashboard menampilkan ringkasan sederhana seperti jumlah kategori, jumlah produk, dan status konten utama. Dashboard tidak perlu analytics kompleks pada versi awal.

### Landing page manager

Modul ini memungkinkan admin mengelola:

- Hero banner
- Teks profil brand
- Keunggulan
- Kategori unggulan
- Produk pilihan
- Testimonial atau proyek
- CTA
- Urutan section

Modul ini harus cukup fleksibel untuk mengubah struktur presentasi landing page tanpa perlu mengubah kode.

### Kategori

Setiap kategori memiliki:

- Nama
- Slug
- Deskripsi singkat
- Gambar atau ikon
- Status tampil
- Urutan tampil
- Template spesifikasi

Kategori berfungsi sebagai pengelompokan katalog sekaligus basis struktur spesifikasi produk.

### Template spesifikasi kategori

Setiap kategori memiliki template spesifikasi sendiri. Template ini menentukan field teknis apa saja yang harus diisi untuk produk dalam kategori tersebut.

Contoh field:

- Material
- Ukuran
- Kapasitas
- Tegangan
- Aplikasi
- Warna

Pendekatan ini dipilih agar data produk tetap konsisten dan mudah dipahami pada katalog teknis.

### Produk

Setiap produk memiliki:

- Kategori
- Nama
- Slug
- Ringkasan
- Deskripsi lengkap
- Foto utama
- Galeri
- Dokumen unduhan
- Nilai spesifikasi berdasarkan template kategori
- Tag atau atribut filter
- Status tampil
- Urutan tampil

Produk tidak memiliki harga pada versi awal.

### Pengaturan

Modul pengaturan mencakup:

- Nomor WhatsApp utama
- Template pesan default WhatsApp
- Nama brand
- Informasi kontak dasar
- SEO dasar seperti title dan meta description

## Model Data

Entitas inti yang direkomendasikan:

- `Admin`
- `LandingSection`
- `Category`
- `CategorySpecTemplate`
- `CategorySpecField`
- `Product`
- `ProductSpecValue`
- `ProductDocument`
- `SiteSetting`

### Relasi inti

- Satu `Category` memiliki tepat satu `CategorySpecTemplate`
- Satu `CategorySpecTemplate` memiliki satu atau lebih `CategorySpecField`
- Satu `Product` berada dalam satu `Category`
- Satu `Product` memiliki banyak `ProductSpecValue`
- Satu `Product` dapat memiliki banyak `ProductDocument`
- `LandingSection` menyimpan konten dan urutan untuk landing page
- `SiteSetting` menyimpan konfigurasi global seperti WhatsApp dan identitas situs

Struktur ini dipilih agar setiap unit memiliki tanggung jawab jelas dan dapat berkembang tanpa mencampur data konten dengan data katalog.

Pada versi awal, `status tampil` untuk kategori dan produk diperlakukan sebagai kontrol visibilitas sederhana, bukan alur editorial draft dan publish yang kompleks.

## Search dan Filter

Fitur pencarian harus memungkinkan pengguna mencari berdasarkan nama produk. Filter harus mendukung setidaknya kategori dan atribut relevan yang membantu katalog teknis dipersempit secara cepat.

Pada versi awal, filter tidak harus sepenuhnya dinamis lintas semua jenis field. Desain yang disarankan adalah menggunakan kombinasi:

- kategori
- tag produk
- atribut yang memang dipilih untuk ditampilkan sebagai filter

Dengan demikian pengalaman pengguna tetap sederhana tetapi berguna.

## Integrasi WhatsApp

WhatsApp adalah CTA utama pada seluruh sistem.

### Titik tampil CTA

- Header atau area navigasi utama
- Landing page
- Halaman katalog
- Halaman detail produk

### Perilaku CTA

- Mengarahkan ke nomor WhatsApp utama
- Membawa template pesan awal
- Pada halaman detail produk, pesan menyertakan nama produk

Contoh intent pesan:

`Halo, saya ingin tanya harga untuk produk [nama produk].`

## Error Handling

Sistem harus menangani kasus data belum lengkap tanpa merusak tampilan publik.

Aturan dasar:

- Jika produk tidak memiliki gambar utama, tampilkan placeholder visual yang rapi
- Jika produk tidak memiliki dokumen, tombol unduh tidak ditampilkan
- Jika field wajib pada template spesifikasi belum diisi, admin tidak dapat mempublikasikan produk
- Jika nomor WhatsApp atau template pesan belum diatur, admin panel menampilkan validasi yang jelas
- Jika hasil pencarian kosong, halaman katalog menampilkan empty state yang informatif

## Validasi Admin

Untuk menjaga kualitas katalog, admin panel harus memvalidasi:

- nama kategori wajib diisi
- nama produk wajib diisi
- slug unik
- kategori produk wajib dipilih
- foto utama wajib ada sebelum produk tampil
- field spesifikasi wajib mengikuti template kategori
- nomor WhatsApp harus valid sebelum CTA digunakan

## Strategi Testing

Pengujian difokuskan pada alur yang paling penting.

### Alur admin

1. Admin login
2. Admin membuat kategori
3. Admin membuat template spesifikasi kategori
4. Admin menambahkan produk dengan galeri, spesifikasi, dan dokumen
5. Admin memperbarui landing page
6. Admin mengatur nomor WhatsApp dan CTA

### Alur publik

1. Pengunjung membuka landing page
2. Pengunjung masuk ke katalog dari kategori unggulan atau navigasi utama
3. Pengunjung mencari produk
4. Pengunjung memfilter produk
5. Pengunjung membuka detail produk
6. Pengunjung menekan tombol `Tanya Harga via WhatsApp`

### Pengujian tambahan

- validasi empty state
- validasi dokumen yang tidak tersedia
- validasi field spesifikasi wajib
- validasi pembentukan link WhatsApp

## Batasan dan Prinsip Pengembangan

Untuk menjaga scope tetap sehat, versi awal harus mengikuti prinsip berikut:

- tidak menambah fitur transaksi
- tidak membuat sistem role yang kompleks
- tidak memasukkan modul yang belum punya manfaat langsung
- menjaga panel admin sederhana untuk satu admin
- menjaga struktur data tetap siap berkembang jika jumlah kategori dan produk meningkat

## Rekomendasi Implementasi Lanjutan

Saat masuk ke tahap implementation plan, pekerjaan sebaiknya dipecah ke beberapa area:

1. fondasi proyek dan autentikasi admin
2. model data kategori, template spesifikasi, dan produk
3. halaman publik katalog dan detail produk
4. landing page manager
5. search, filter, dan integrasi WhatsApp
6. validasi, pengujian, dan penyempurnaan UI

Urutan ini menjaga risiko tetap rendah dan memastikan jalur utama katalog dapat diuji lebih awal.
