/**
 * Definisi Preset Toko Siap Pakai (Full Starter Store Presets) untuk UMKM.
 * Menyediakan preset lengkap: Info Brand, Kategori Toko, Contoh Produk Sampel,
 * dan Landing Page Sections.
 */

import type { CategoryTemplateSlug } from "@/lib/category-templates";

export interface StarterCategoryPreset {
  name: string;
  icon: string;
  sortOrder: number;
}

export interface StarterProductPreset {
  categoryIndex: number; // Indeks kategori pemilik di dalam preset
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isSampleProduct: boolean;
}

export interface StarterStorePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  landingTemplateSlug: CategoryTemplateSlug;
  brandPreset: {
    tagline: string;
    whatsappTemplate: string;
  };
  categories: StarterCategoryPreset[];
  products: StarterProductPreset[];
}

export const STARTER_STORE_PRESETS: Record<string, StarterStorePreset> = {
  atk: {
    id: "atk",
    label: "Alat Tulis Kantor & Fotocopy",
    icon: "✏️",
    description: "Preset etalase lengkap untuk toko ATK, foto kopi, perlengkapan sekolah, & kantor.",
    landingTemplateSlug: "payung",
    brandPreset: {
      tagline: "Penyedia Alat Tulis Kantor, Kertas, & Perlengkapan Sekolah Lengkap",
      whatsappTemplate: "Halo [nama toko], saya mau pesan [nama produk] dari etalase online Anda. Apakah stok ready?",
    },
    categories: [
      { name: "Pena & Alat Tulis", icon: "pen-tool", sortOrder: 1 },
      { name: "Kertas & Buku Catatan", icon: "book-open", sortOrder: 2 },
      { name: "Marker & Penanda", icon: "highlighter", sortOrder: 3 },
      { name: "Perlengkapan Meja Kantor", icon: "briefcase", sortOrder: 4 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Pulpen Gel Ergo 0.5mm (Pack 12 pcs)",
        description: "Pulpen gel tinta hitam pekat dengan pegangan karet ergonomis. Tinta cepat kering dan tidak bocor.",
        price: 35000,
        imageUrl: "https://images.unsplash.com/photo-1585336261026-6757688719d3?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Grid Spiral Notebook A5 Cover Kulit",
        description: "Buku catatan grid spiral 100 lembar kertas 80gsm warna cream soft. Nyaman untuk mencatat & sketching.",
        price: 48000,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 2,
        name: "Highlighter Pastel Marker Set 6 Warna",
        description: "Set marker penanda warna pastel lembut. Tidak tembus ke kertas tipis, cocok untuk dokumen & buku teks.",
        price: 29500,
        imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 3,
        name: "Stapler Office Ergonomis & Isi Paperclip",
        description: "Set stapler meja berbahan baja tahan karat dengan pembuka klip bawaan + 1 box isi paperclip.",
        price: 52000,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  kuliner: {
    id: "kuliner",
    label: "Kuliner, Makanan & Catering",
    icon: "🍽️",
    description: "Preset usaha kuliner, warung makan, catering event, snack box, & oleh-oleh.",
    landingTemplateSlug: "kuliner",
    brandPreset: {
      tagline: "Cita Rasa Autentik Kuliner Makanan & Catering Pilihan",
      whatsappTemplate: "Halo [nama toko], saya ingin memesan menu [nama produk]. Apakah bisa dikirim hari ini?",
    },
    categories: [
      { name: "Nasi Box & Paket Hemat", icon: "utensils", sortOrder: 1 },
      { name: "Snack Box & Kue Basah", icon: "cookie", sortOrder: 2 },
      { name: "Minuman Segar & Es", icon: "coffee", sortOrder: 3 },
      { name: "Hampers & Paket Acara", icon: "gift", sortOrder: 4 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Paket Nasi Liwet Komplit Ayam Bakar",
        description: "Nasi liwet wangi aroma rempah, dilengkapi ayam bakar kecap, tahu, tempe, sambal terasi, dan lalapan segar.",
        price: 28000,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Snack Box Rapat A (3 Kue + Air Mineral)",
        description: "Paket snack box berisi Risoles Ragout, Lemper Ayam, Brownies Potong, dan Air Mineral gelas.",
        price: 16000,
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 2,
        name: "Es Teh Manis Jumbo & Lychee Tea 500ml",
        description: "Minuman es teh segar menggunakan gula asli tanpa pemanis buatan. Kemasan cup sealed aman dikirim.",
        price: 10000,
        imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 3,
        name: "Hampers Kue Kering Spesial (3 Toples)",
        description: "Paket hamper 3 toples (Nastar Keju, Kastengel, & Putri Salju) dengan pita cantik & kartu ucapan custom.",
        price: 175000,
        imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  fashion: {
    id: "fashion",
    label: "Fashion, Batik & Konveksi",
    icon: "👕",
    description: "Preset toko baju, pengrajin batik, konveksi seragam, & hijab/aksesoris.",
    landingTemplateSlug: "batik",
    brandPreset: {
      tagline: "Koleksi Fashion & Batik Premium Khas Nusantara",
      whatsappTemplate: "Halo [nama toko], saya berminat dengan produk [nama produk]. Minta info ukuran & pilihan warnanya.",
    },
    categories: [
      { name: "Kemeja & Pria", icon: "shirt", sortOrder: 1 },
      { name: "Batik Tulis & Cap", icon: "palette", sortOrder: 2 },
      { name: "Hijab & Busana Muslimah", icon: "sparkles", sortOrder: 3 },
      { name: "Seragam & Custom Konveksi", icon: "scissors", sortOrder: 4 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Kemeja Batik Katun Halus Premium Pria",
        description: "Kemeja batik motif tradisional berfuring halus. Bahan katun 100% adem dan nyaman untuk kerja & formal.",
        price: 165000,
        imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Kain Batik Cap Parang Kencana (2 Meter)",
        description: "Kain batik cap pewarnaan alami ukuran 200cm x 115cm. Cocok untuk bahan kemeja, dress, atau bawahan.",
        price: 125000,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 2,
        name: "Hijab Voal Premium Motif Etnik 110x110",
        description: "Hijab voal segi empat mudah dibentuk, tidak menerawang, dan jahitan tepi rapi. Motif bernuansa etnik.",
        price: 45000,
        imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 3,
        name: "Bordir Kemeja Drill Seragam Komunitas",
        description: "Jasa konveksi kemeja seragam bahan American Drill gratis bordir logo komputer 2 titik (Dada + Lengan).",
        price: 95000,
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  kerajinan: {
    id: "kerajinan",
    label: "Kerajinan Tangan & Souvenir",
    icon: "🏺",
    description: "Preset pengrajin rotan, kayu, anyaman, & souvenir pernikahan/event.",
    landingTemplateSlug: "kerajinan",
    brandPreset: {
      tagline: "Kerajinan Tangan Authentic & Souvenir Custom Nusantara",
      whatsappTemplate: "Halo [nama toko], saya berminat dengan kerajinan [nama produk]. Apakah bisa custom ukuran & logo?",
    },
    categories: [
      { name: "Kerajinan Kayu & Ukiran", icon: "box", sortOrder: 1 },
      { name: "Anyaman Rotan & Bambu", icon: "grid", sortOrder: 2 },
      { name: "Souvenir Event & Pernikahan", icon: "heart", sortOrder: 3 },
      { name: "Dekorasi Rumah Handmade", icon: "home", sortOrder: 4 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Nampan Kayu Jati Perhutani Handmade",
        description: "Nampan saji kayu jati asli dengan finishing food-grade beeswax alami. Tahan lengket & serat kayu estetis.",
        price: 85000,
        imageUrl: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Keranjang Anyaman Rotan Minimalis Cover Pot",
        description: "Keranjang rotan sintetis penyimpan barang / wadah pot tanaman hias ruangan. Tahan air & anti jamur.",
        price: 65000,
        imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 2,
        name: "Souvenir Piring Kayu Custom Ukir Logo",
        description: "Souvenir unik bahan kayu mahoni lengkap cetak ukiran nama & packaging kain tile ramah lingkungan.",
        price: 18500,
        imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  jasa: {
    id: "jasa",
    label: "Jasa, Servis & Layanan",
    icon: "🔧",
    description: "Preset penyedia jasa: servis AC/elektronik, laundry, cleaning, & bengkel.",
    landingTemplateSlug: "jasa",
    brandPreset: {
      tagline: "Layanan Jasa Profesional, Cepat, Bergaransi, & Terpercaya",
      whatsappTemplate: "Halo [nama toko], saya mau pesan jasa [nama produk] untuk lokasi saya. Boleh infokan ketersediaan teknisi?",
    },
    categories: [
      { name: "Servis & Perbaikan", icon: "wrench", sortOrder: 1 },
      { name: "Pembersihan / Cleaning", icon: "sparkles", sortOrder: 2 },
      { name: "Perawatan & Maintenance", icon: "shield", sortOrder: 3 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Jasa Cuci & Servis Rutin AC 0.5 - 2 PK",
        description: "Pembersihan unit indoor & outdoor AC lengkap dengan pengecekan tekanan freon & pembersihan filter.",
        price: 75000,
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Jasa Cuci Kasur Busa & Sofa Kain (Deep Clean)",
        description: "Pembersihan tungau & noda sofa/kasur menggunakan mesin extractor hydro-vacuum khusus. Wangi & bersih.",
        price: 150000,
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  sembako: {
    id: "sembako",
    label: "Toko Kelontong & Sembako",
    icon: "🏪",
    description: "Preset warung kelontong, beras, minyak, bahan pokok, & kebutuhan harian.",
    landingTemplateSlug: "kuliner",
    brandPreset: {
      tagline: "Sembako Murah, Lengkap, & Siap Kirim Langsung ke Rumah Anda",
      whatsappTemplate: "Halo [nama toko], saya mau beli [nama produk] diantar ke alamat saya. Totalnya berapa ya?",
    },
    categories: [
      { name: "Beras & Bahan Pokok", icon: "package", sortOrder: 1 },
      { name: "Minyak, Gula & Bumbu", icon: "droplet", sortOrder: 2 },
      { name: "Mie, Instant & Kaleng", icon: "shopping-bag", sortOrder: 3 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Beras Premium Ramos Super 5kg",
        description: "Beras putih pulen bermutu tinggi tanpa pemutih & tanpa pengawet. Bebas gabah dan wangi alami.",
        price: 72000,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Minyak Goreng Sawit Pouch 2 Liter",
        description: "Minyak goreng jernih 2x penyaringan. Tidak mudah hitam & membuat gorengan renyah sempurna.",
        price: 34000,
        imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  kecantikan: {
    id: "kecantikan",
    label: "Kosmetik, Skincare & Kecantikan",
    icon: "💄",
    description: "Preset produk perawatan kulit, make up, parfum, & perawatan tubuh.",
    landingTemplateSlug: "batik",
    brandPreset: {
      tagline: "Produk Skincare & Kosmetik Original Terbukti Halal & BPOM",
      whatsappTemplate: "Halo [nama toko], saya mau order [nama produk]. Apakah produk ready dan dikirim hari ini?",
    },
    categories: [
      { name: "Skincare & Perawatan Wajah", icon: "sparkles", sortOrder: 1 },
      { name: "Make Up & Kosmetik", icon: "palette", sortOrder: 2 },
      { name: "Parfum & Body Care", icon: "heart", sortOrder: 3 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Sunscreen SPF 50 PA++++ Soft Cream 50ml",
        description: "Sunscreen tekstur cair tidak lengket, bebas noda putih (no whitecast), cocok untuk semua jenis kulit.",
        price: 68000,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "Matte Lip Cream Velvet Touch 4g",
        description: "Lip cream formula tahan lama hingga 12 jam, warna pigmen intens, serta diperkaya Vitamin E.",
        price: 49000,
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
  elektronik: {
    id: "elektronik",
    label: "Gadget, Pulsa & Aksesoris HP",
    icon: "📱",
    description: "Preset konter pulsa, servis HP, charger, kabel data, & aksesoris gadget.",
    landingTemplateSlug: "jasa",
    brandPreset: {
      tagline: "Pusat Aksesoris HP, Gadget Original, Servis, & Pulsa Murah",
      whatsappTemplate: "Halo [nama toko], saya mau pesan [nama produk]. Apakah kompatibel dengan HP saya?",
    },
    categories: [
      { name: "Charger & Kabel Data", icon: "zap", sortOrder: 1 },
      { name: "Audio & TWS Earphone", icon: "headphones", sortOrder: 2 },
      { name: "Case & Pelindung HP", icon: "smartphone", sortOrder: 3 },
    ],
    products: [
      {
        categoryIndex: 0,
        name: "Fast Charger 20W USB-C Type-C Quick Charge",
        description: "Kepala charger pengisian cepat 20 Watt support Power Delivery untuk iPhone & Android. Garansi 6 bulan.",
        price: 85000,
        imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
      {
        categoryIndex: 1,
        name: "TWS Wireless Earphone Bluetooth 5.3 Bass",
        description: "Earphone nirkabel suara bass mantap, batere awet hingga 24 jam dengan charging case.",
        price: 135000,
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80&auto=format",
        isSampleProduct: true,
      },
    ],
  },
};

export const STARTER_STORE_PRESET_KEYS = Object.keys(STARTER_STORE_PRESETS);
