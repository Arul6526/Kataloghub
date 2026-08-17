/**
 * Template konten landing page per kategori industri.
 * Setiap template berisi heading/subheading/body/config untuk 7 section key,
 * dalam 2 bahasa: "id" (Indonesia) dan "su" (Sunda).
 *
 * Konten disimpan di sini (code-level), bukan di DB, agar mudah di-maintain.
 * Saat user "Terapkan Template", konten ini di-copy ke tabel landing_sections.
 */

import type { LandingSectionKey } from "@/lib/db/types";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type CategoryTemplateSlug =
  | "bordir"
  | "payung"
  | "kuliner"
  | "batik"
  | "kerajinan"
  | "jasa";

export interface TemplateSectionData {
  heading: string;
  subheading: string;
  body: string;
  config: Record<string, unknown>;
}

export interface CategoryTemplate {
  label: string;
  icon: string;
  description: string;
  sections: Record<"id" | "su", Record<LandingSectionKey, TemplateSectionData>>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function makeAdvantages(items: { title: string; description: string; icon: string }[]) {
  return { items };
}

/* ------------------------------------------------------------------ */
/*  BORDIR                                                            */
/* ------------------------------------------------------------------ */

const bordir: CategoryTemplate = {
  label: "Bordir & Konveksi",
  icon: "🧵",
  description: "Untuk usaha bordir komputer, konveksi seragam, dan embroidery.",
  sections: {
    id: {
      hero: {
        heading: "Jasa Bordir & Konveksi Berkualitas Tinggi",
        subheading: "Presisi mesin modern, sentuhan keahlian lokal. Pesan seragam, merchandise, dan produk bordir custom dengan mudah.",
        body: "",
        config: {},
      },
      about: {
        heading: "Tentang Kami",
        subheading: "Pengalaman puluhan tahun di industri bordir komputer",
        body: "Kami adalah spesialis bordir komputer dan konveksi yang melayani kebutuhan seragam kantor, sekolah, organisasi, hingga merchandise brand. Dengan mesin bordir multi-head modern dan tim berpengalaman, kami menghasilkan produk berkualitas tinggi dengan harga kompetitif.",
        config: {},
      },
      advantages: {
        heading: "Keunggulan Kami",
        subheading: "Mengapa memilih layanan bordir kami",
        body: "",
        config: makeAdvantages([
          { title: "Mesin Modern", description: "Bordir komputer multi-head untuk hasil presisi dan konsisten.", icon: "tool" },
          { title: "Minimum Order Fleksibel", description: "Mulai dari 1 pcs untuk sampel hingga ribuan pcs untuk produksi massal.", icon: "gauge" },
          { title: "Desain Custom", description: "Tim desainer siap membantu visualisasi logo dan motif Anda.", icon: "sparkles" },
          { title: "Pengiriman Tepat Waktu", description: "Komitmen deadline ketat untuk kebutuhan event dan proyek Anda.", icon: "truck" },
        ]),
      },
      featured_categories: {
        heading: "Kategori Produk",
        subheading: "Jelajahi berbagai jenis layanan bordir dan konveksi kami",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Produk Unggulan",
        subheading: "Hasil karya terbaik dari workshop kami",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Testimoni Pelanggan",
        subheading: "Kepuasan klien adalah prioritas utama kami",
        body: "Kami telah melayani ratusan klien dari berbagai instansi, perusahaan, dan komunitas di seluruh Indonesia.",
        config: {},
      },
      cta: {
        heading: "Siap Memesan Bordir Custom?",
        subheading: "Hubungi kami sekarang untuk konsultasi desain dan penawaran harga. Gratis sampel untuk order pertama!",
        body: "",
        config: {},
      },
    },
    su: {
      hero: {
        heading: "Jasa Bordir & Konvéksi Kualitas Luhung",
        subheading: "Présisi mesin modérn, kaasihan kahlian lokal. Peseun seragam, merchandise, sareng produk bordir custom kalayan gampil.",
        body: "",
        config: {},
      },
      about: {
        heading: "Ngeunaan Urang",
        subheading: "Pangalaman puluhan taun di industri bordir komputer",
        body: "Urang téh spésialis bordir komputer sareng konvéksi anu ngalayanan kabutuhan seragam kantor, sakola, organisasi, dugi ka merchandise brand. Ku mesin bordir multi-head modérn sareng tim anu berpengalaman, urang ngahasilkeun produk kualitas luhung kalayan harga kompetitif.",
        config: {},
      },
      advantages: {
        heading: "Kaunggulan Urang",
        subheading: "Kunaon milih layanan bordir urang",
        body: "",
        config: makeAdvantages([
          { title: "Mesin Modérn", description: "Bordir komputer multi-head pikeun hasil présisi sareng konsistén.", icon: "tool" },
          { title: "Minimum Order Fleksibel", description: "Ti mimiti 1 pcs kanggo sampel dugi ka ribuan pcs kanggo produksi massal.", icon: "gauge" },
          { title: "Desain Custom", description: "Tim desainer siap ngabantosan visualisasi logo sareng motif anjeun.", icon: "sparkles" },
          { title: "Pangiriman Tepat Waktu", description: "Komitmen deadline ketat kanggo kabutuhan event sareng proyek anjeun.", icon: "truck" },
        ]),
      },
      featured_categories: {
        heading: "Katégori Produk",
        subheading: "Jelajahi rupa-rupa jinis layanan bordir sareng konvéksi urang",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Produk Unggulan",
        subheading: "Hasil karya pangalusna ti workshop urang",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Téstimoni Palanggan",
        subheading: "Kapuasan klién téh prioritas utama urang",
        body: "Urang parantos ngalayanan ratusan klién ti rupa-rupa instansi, perusahaan, sareng komunitas di sakuliah Indonésia.",
        config: {},
      },
      cta: {
        heading: "Siap Meseun Bordir Custom?",
        subheading: "Kontak urang ayeuna kanggo konsultasi desain sareng panawaran harga. Gratis sampel kanggo order munggaran!",
        body: "",
        config: {},
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  PAYUNG                                                            */
/* ------------------------------------------------------------------ */

const payung: CategoryTemplate = {
  label: "Payung & Tenda",
  icon: "☂️",
  description: "Untuk produsen payung promosi, tenda lipat, dan parasol.",
  sections: {
    id: {
      hero: {
        heading: "Produsen Payung & Tenda Promosi Terpercaya",
        subheading: "Payung custom, tenda lipat, dan parasol berkualitas untuk kebutuhan promosi, event, dan usaha Anda.",
        body: "",
        config: {},
      },
      about: {
        heading: "Tentang Kami",
        subheading: "Spesialis payung dan tenda sejak bertahun-tahun",
        body: "Kami memproduksi berbagai jenis payung promosi, tenda lipat, parasol cafe, dan aksesoris outdoor lainnya. Dengan fasilitas produksi sendiri, kami menjamin kualitas bahan, ketepatan warna sablon, dan durabilitas produk.",
        config: {},
      },
      advantages: {
        heading: "Keunggulan Kami",
        subheading: "Alasan memilih payung dan tenda dari kami",
        body: "",
        config: makeAdvantages([
          { title: "Produksi Sendiri", description: "Pabrik dan workshop sendiri untuk kontrol kualitas penuh.", icon: "tool" },
          { title: "Custom Branding", description: "Sablon, digital printing, dan bordir logo sesuai kebutuhan.", icon: "sparkles" },
          { title: "Material Premium", description: "Bahan anti UV, waterproof, dan rangka baja/fiber tahan angin.", icon: "shield" },
          { title: "Pengiriman Nasional", description: "Melayani pengiriman ke seluruh Indonesia dengan packaging aman.", icon: "truck" },
        ]),
      },
      featured_categories: {
        heading: "Kategori Produk",
        subheading: "Berbagai pilihan payung dan tenda untuk setiap kebutuhan",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Produk Terlaris",
        subheading: "Produk payung dan tenda paling diminati pelanggan kami",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Testimoni Pelanggan",
        subheading: "Dipercaya ratusan perusahaan dan event organizer",
        body: "Klien kami meliputi perusahaan BUMN, startup, event organizer, hingga UMKM yang membutuhkan payung dan tenda custom.",
        config: {},
      },
      cta: {
        heading: "Butuh Payung atau Tenda Custom?",
        subheading: "Konsultasikan kebutuhan Anda sekarang. Dapatkan penawaran harga terbaik dan sample gratis!",
        body: "",
        config: {},
      },
    },
    su: {
      hero: {
        heading: "Produsén Payung & Ténda Promosi Dipercaya",
        subheading: "Payung custom, ténda lipat, sareng parasol kualitas kanggo kabutuhan promosi, event, sareng usaha anjeun.",
        body: "",
        config: {},
      },
      about: {
        heading: "Ngeunaan Urang",
        subheading: "Spésialis payung sareng ténda ti mangtaun-taun",
        body: "Urang ngaproduksi rupa-rupa jinis payung promosi, ténda lipat, parasol café, sareng aksésori outdoor séjénna. Ku fasilitas produksi sorangan, urang ngajamin kualitas bahan, katepatan warna sablon, sareng durabilitas produk.",
        config: {},
      },
      advantages: {
        heading: "Kaunggulan Urang",
        subheading: "Alesan milih payung sareng ténda ti urang",
        body: "",
        config: makeAdvantages([
          { title: "Produksi Sorangan", description: "Pabrik sareng workshop sorangan kanggo kontrol kualitas pinuh.", icon: "tool" },
          { title: "Custom Branding", description: "Sablon, digital printing, sareng bordir logo saluyu kabutuhan.", icon: "sparkles" },
          { title: "Material Prémiun", description: "Bahan anti UV, waterproof, sareng rangka baja/fiber tahan angin.", icon: "shield" },
          { title: "Pangiriman Nasional", description: "Ngalayanan pangiriman ka sakuliah Indonésia ku packaging aman.", icon: "truck" },
        ]),
      },
      featured_categories: {
        heading: "Katégori Produk",
        subheading: "Rupa-rupa pilihan payung sareng ténda kanggo unggal kabutuhan",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Produk Panglarisna",
        subheading: "Produk payung sareng ténda anu paling diminati palanggan urang",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Téstimoni Palanggan",
        subheading: "Dipercaya ratusan perusahaan sareng event organizer",
        body: "Klién urang ngawengku perusahaan BUMN, startup, event organizer, dugi ka UMKM anu merlukeun payung sareng ténda custom.",
        config: {},
      },
      cta: {
        heading: "Butuh Payung atawa Ténda Custom?",
        subheading: "Konsultasikeun kabutuhan anjeun ayeuna. Kéngingkeun panawaran harga pangalusna sareng sampel gratis!",
        body: "",
        config: {},
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  KULINER                                                           */
/* ------------------------------------------------------------------ */

const kuliner: CategoryTemplate = {
  label: "Kuliner & Makanan",
  icon: "🍽️",
  description: "Untuk usaha kuliner, catering, snack box, dan oleh-oleh makanan.",
  sections: {
    id: {
      hero: {
        heading: "Cita Rasa Autentik, Kualitas Terjamin",
        subheading: "Jelajahi menu kuliner terbaik kami. Dari snack box hingga catering premium, semua diracik dengan bahan pilihan.",
        body: "",
        config: {},
      },
      about: {
        heading: "Tentang Kami",
        subheading: "Dapur kami, kebanggaan rasa Indonesia",
        body: "Kami adalah produsen kuliner yang mengutamakan kualitas bahan, kebersihan proses, dan cita rasa autentik. Melayani pesanan snack box, nasi box, catering event, oleh-oleh khas daerah, dan hampers spesial untuk berbagai acara.",
        config: {},
      },
      advantages: {
        heading: "Keunggulan Kami",
        subheading: "Kenapa harus pesan di tempat kami",
        body: "",
        config: makeAdvantages([
          { title: "Bahan Segar Pilihan", description: "Hanya menggunakan bahan baku segar dan berkualitas tinggi.", icon: "badge-check" },
          { title: "Halal & Higienis", description: "Proses produksi berstandar hygiene tinggi dan bersertifikat halal.", icon: "shield" },
          { title: "Porsi Fleksibel", description: "Tersedia mulai dari paket personal hingga catering ratusan porsi.", icon: "gauge" },
          { title: "Pengiriman Tepat Waktu", description: "Makanan sampai dalam kondisi segar dan tepat di jadwal acara Anda.", icon: "truck" },
        ]),
      },
      featured_categories: {
        heading: "Menu & Kategori",
        subheading: "Pilih dari berbagai kategori menu andalan kami",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Menu Terfavorit",
        subheading: "Pilihan menu yang paling sering dipesan pelanggan kami",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Testimoni Pelanggan",
        subheading: "Ribuan pelanggan puas dengan rasa dan layanan kami",
        body: "Dari acara kantor, pernikahan, hingga gathering komunitas — kami sudah dipercaya menangani berbagai jenis event kuliner.",
        config: {},
      },
      cta: {
        heading: "Pesan Menu Favorit Anda Sekarang!",
        subheading: "Hubungi kami untuk konsultasi menu, harga paket, dan jadwal pengiriman. Tersedia tasting gratis untuk order besar!",
        body: "",
        config: {},
      },
    },
    su: {
      hero: {
        heading: "Cita Rasa Auténtik, Kualitas Dijamin",
        subheading: "Jelajahi menu kulinér pangalusna ti urang. Ti snack box dugi ka catering prémiun, sadaya diracik ku bahan pilihan.",
        body: "",
        config: {},
      },
      about: {
        heading: "Ngeunaan Urang",
        subheading: "Dapur urang, kabanggaan rasa Indonésia",
        body: "Urang téh produsén kulinér anu ngautamakeun kualitas bahan, kabersihan prosés, sareng cita rasa auténtik. Ngalayanan pesenan snack box, nasi box, catering event, oleh-oleh khas daérah, sareng hampers spésial kanggo rupa-rupa acara.",
        config: {},
      },
      advantages: {
        heading: "Kaunggulan Urang",
        subheading: "Kunaon kedah meseun di tempat urang",
        body: "",
        config: makeAdvantages([
          { title: "Bahan Seger Pilihan", description: "Ngan ngagunakeun bahan baku anu seger sareng kualitas luhung.", icon: "badge-check" },
          { title: "Halal & Higiénis", description: "Prosés produksi standar hygiéne luhung sareng bersertifikat halal.", icon: "shield" },
          { title: "Porsi Fleksibel", description: "Sayogi ti mimiti pakét personal dugi ka catering ratusan porsi.", icon: "gauge" },
          { title: "Pangiriman Tepat Waktu", description: "Tuangeun dongkap dina kaayaan seger sareng tepat di jadwal acara anjeun.", icon: "truck" },
        ]),
      },
      featured_categories: {
        heading: "Menu & Katégori",
        subheading: "Pilih tina rupa-rupa katégori menu andalan urang",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Menu Pangfavoritna",
        subheading: "Pilihan menu anu pangseringna dipeseun palanggan urang",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Téstimoni Palanggan",
        subheading: "Rébuan palanggan puas ku rasa sareng layanan urang",
        body: "Ti acara kantor, nikahan, dugi ka gathering komunitas — urang parantos dipercaya nanganan rupa-rupa jinis event kulinér.",
        config: {},
      },
      cta: {
        heading: "Peseun Menu Favorit Anjeun Ayeuna!",
        subheading: "Kontak urang kanggo konsultasi menu, harga pakét, sareng jadwal pangiriman. Sayogi tasting gratis kanggo order ageung!",
        body: "",
        config: {},
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  BATIK                                                             */
/* ------------------------------------------------------------------ */

const batik: CategoryTemplate = {
  label: "Batik & Tekstil",
  icon: "🎨",
  description: "Untuk pengrajin batik, produsen kain batik, dan fashion batik.",
  sections: {
    id: {
      hero: {
        heading: "Keindahan Batik, Warisan Budaya Nusantara",
        subheading: "Temukan koleksi batik tulis, cap, dan printing berkualitas tinggi. Motif tradisional hingga kontemporer untuk segala kebutuhan.",
        body: "",
        config: {},
      },
      about: {
        heading: "Tentang Kami",
        subheading: "Melestarikan seni batik dengan sentuhan modern",
        body: "Kami adalah produsen dan pengrajin batik yang berkomitmen melestarikan warisan budaya Indonesia. Setiap lembar kain kami dibuat dengan teknik tradisional yang dikombinasikan dengan desain modern, menghasilkan produk batik yang elegan dan bernilai seni tinggi.",
        config: {},
      },
      advantages: {
        heading: "Keunggulan Kami",
        subheading: "Nilai lebih dari batik kami",
        body: "",
        config: makeAdvantages([
          { title: "Pengrajin Berpengalaman", description: "Dibuat oleh tangan-tangan terampil pengrajin batik berpengalaman.", icon: "users" },
          { title: "Pewarna Alami", description: "Pilihan batik dengan pewarna alami yang ramah lingkungan.", icon: "sparkles" },
          { title: "Motif Eksklusif", description: "Desain motif eksklusif yang tidak diproduksi massal.", icon: "medal" },
          { title: "Kualitas Kain Premium", description: "Menggunakan kain katun, sutra, dan dobi terbaik.", icon: "badge-check" },
        ]),
      },
      featured_categories: {
        heading: "Koleksi Batik",
        subheading: "Jelajahi ragam koleksi batik kami",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Batik Pilihan",
        subheading: "Koleksi batik favorit pelanggan kami",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Testimoni Pelanggan",
        subheading: "Dipercaya pecinta batik di seluruh Indonesia",
        body: "Batik kami telah dikenakan di berbagai acara resmi, pernikahan, dan event internasional. Kualitas dan keunikan motif menjadi andalan kami.",
        config: {},
      },
      cta: {
        heading: "Temukan Batik Impian Anda",
        subheading: "Konsultasikan kebutuhan batik Anda — tersedia custom motif dan warna untuk pesanan khusus. Hubungi kami sekarang!",
        body: "",
        config: {},
      },
    },
    su: {
      hero: {
        heading: "Kaéndahan Batik, Warisan Budaya Nusantara",
        subheading: "Panggihan koléksi batik tulis, cap, sareng printing kualitas luhung. Motif tradisional dugi ka kontémporér kanggo sagala kabutuhan.",
        body: "",
        config: {},
      },
      about: {
        heading: "Ngeunaan Urang",
        subheading: "Ngalestarikeun séni batik ku sentuhan modérn",
        body: "Urang téh produsén sareng pangrajin batik anu berkomitmen ngalestarikeun warisan budaya Indonésia. Unggal lambar kaén urang dijieun ku téhnik tradisional anu dikombinasikeun sareng desain modérn, ngahasilkeun produk batik anu élégan sareng nilaina séni luhung.",
        config: {},
      },
      advantages: {
        heading: "Kaunggulan Urang",
        subheading: "Nilai leuwih ti batik urang",
        body: "",
        config: makeAdvantages([
          { title: "Pangrajin Berpengalaman", description: "Dijieun ku leungeun-leungeun terampil pangrajin batik berpengalaman.", icon: "users" },
          { title: "Pewarna Alami", description: "Pilihan batik ku pewarna alami anu ramah lingkungan.", icon: "sparkles" },
          { title: "Motif Éksklusif", description: "Desain motif éksklusif anu teu diproduksi massal.", icon: "medal" },
          { title: "Kualitas Kaén Prémiun", description: "Ngagunakeun kaén katun, sutra, sareng dobi pangalusna.", icon: "badge-check" },
        ]),
      },
      featured_categories: {
        heading: "Koléksi Batik",
        subheading: "Jelajahi ragam koléksi batik urang",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Batik Pilihan",
        subheading: "Koléksi batik favorit palanggan urang",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Téstimoni Palanggan",
        subheading: "Dipercaya pécinta batik di sakuliah Indonésia",
        body: "Batik urang parantos dianggo di rupa-rupa acara résmi, nikahan, sareng event internasional. Kualitas sareng kaunikan motif jadi andalan urang.",
        config: {},
      },
      cta: {
        heading: "Panggihan Batik Impian Anjeun",
        subheading: "Konsultasikeun kabutuhan batik anjeun — sayogi custom motif sareng warna kanggo pesenan khusus. Kontak urang ayeuna!",
        body: "",
        config: {},
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  KERAJINAN                                                         */
/* ------------------------------------------------------------------ */

const kerajinan: CategoryTemplate = {
  label: "Kerajinan Tangan",
  icon: "🏺",
  description: "Untuk pengrajin rotan, kayu, anyaman, dan handcraft.",
  sections: {
    id: {
      hero: {
        heading: "Kerajinan Tangan Khas Indonesia",
        subheading: "Produk handmade berkualitas tinggi dari tangan pengrajin lokal. Rotan, kayu, anyaman, dan berbagai material alami.",
        body: "",
        config: {},
      },
      about: {
        heading: "Tentang Kami",
        subheading: "Mengangkat kerajinan lokal ke pasar modern",
        body: "Kami adalah produsen dan kurator kerajinan tangan Indonesia yang menghubungkan pengrajin lokal dengan pasar modern. Setiap produk dibuat dengan tangan oleh pengrajin terampil, menggunakan material alami berkualitas tinggi dan teknik tradisional turun-temurun.",
        config: {},
      },
      advantages: {
        heading: "Keunggulan Kami",
        subheading: "Nilai unik dari setiap produk kerajinan kami",
        body: "",
        config: makeAdvantages([
          { title: "100% Handmade", description: "Setiap produk dibuat tangan oleh pengrajin terampil.", icon: "sparkles" },
          { title: "Material Alami", description: "Rotan, kayu, bambu, dan material ramah lingkungan.", icon: "badge-check" },
          { title: "Desain Custom", description: "Menerima pesanan custom sesuai kebutuhan interior dan dekorasi Anda.", icon: "tool" },
          { title: "Ekspor Ready", description: "Standar kualitas internasional untuk pasar lokal dan ekspor.", icon: "medal" },
        ]),
      },
      featured_categories: {
        heading: "Kategori Produk",
        subheading: "Jelajahi berbagai jenis kerajinan tangan kami",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Produk Pilihan",
        subheading: "Koleksi kerajinan tangan terpopuler",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Testimoni Pelanggan",
        subheading: "Dipercaya desainer interior dan pecinta handcraft",
        body: "Produk kerajinan kami telah menghiasi hotel, restoran, rumah tinggal, dan ruang pameran di berbagai kota besar.",
        config: {},
      },
      cta: {
        heading: "Tertarik dengan Produk Kerajinan Kami?",
        subheading: "Hubungi kami untuk konsultasi, custom order, atau pemesanan dalam jumlah besar. Kami siap membantu!",
        body: "",
        config: {},
      },
    },
    su: {
      hero: {
        heading: "Karajinan Leungeun Khas Indonésia",
        subheading: "Produk handmade kualitas luhung ti leungeun pangrajin lokal. Rotan, kai, anyaman, sareng rupa-rupa matérial alami.",
        body: "",
        config: {},
      },
      about: {
        heading: "Ngeunaan Urang",
        subheading: "Ngangkat karajinan lokal ka pasar modérn",
        body: "Urang téh produsén sareng kurator karajinan leungeun Indonésia anu nyambungkeun pangrajin lokal sareng pasar modérn. Unggal produk dijieun ku leungeun pangrajin terampil, ngagunakeun matérial alami kualitas luhung sareng téhnik tradisional turun-temurun.",
        config: {},
      },
      advantages: {
        heading: "Kaunggulan Urang",
        subheading: "Nilai unik ti unggal produk karajinan urang",
        body: "",
        config: makeAdvantages([
          { title: "100% Handmade", description: "Unggal produk dijieun leungeun ku pangrajin terampil.", icon: "sparkles" },
          { title: "Matérial Alami", description: "Rotan, kai, awi, sareng matérial ramah lingkungan.", icon: "badge-check" },
          { title: "Desain Custom", description: "Narima pesenan custom saluyu kabutuhan intérior sareng dékorasi anjeun.", icon: "tool" },
          { title: "Éxpor Ready", description: "Standar kualitas internasional kanggo pasar lokal sareng ékspor.", icon: "medal" },
        ]),
      },
      featured_categories: {
        heading: "Katégori Produk",
        subheading: "Jelajahi rupa-rupa jinis karajinan leungeun urang",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Produk Pilihan",
        subheading: "Koléksi karajinan leungeun pangpopulérna",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Téstimoni Palanggan",
        subheading: "Dipercaya désainér intérior sareng pécinta handcraft",
        body: "Produk karajinan urang parantos ngahias hotel, réstoran, imah tinggal, sareng ruang paméran di rupa-rupa kota gedé.",
        config: {},
      },
      cta: {
        heading: "Kataji ku Produk Karajinan Urang?",
        subheading: "Kontak urang kanggo konsultasi, custom order, atawa pesenan dina jumlah ageung. Urang siap ngabantosan!",
        body: "",
        config: {},
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  JASA                                                              */
/* ------------------------------------------------------------------ */

const jasa: CategoryTemplate = {
  label: "Jasa & Layanan",
  icon: "🔧",
  description: "Untuk penyedia jasa: cleaning, servis, rental, konsultan, dll.",
  sections: {
    id: {
      hero: {
        heading: "Layanan Profesional untuk Kebutuhan Anda",
        subheading: "Solusi jasa terpercaya dengan tenaga ahli berpengalaman. Konsultasi gratis dan harga transparan.",
        body: "",
        config: {},
      },
      about: {
        heading: "Tentang Kami",
        subheading: "Tim profesional yang siap melayani",
        body: "Kami menyediakan layanan jasa profesional yang didukung oleh tim berpengalaman dan peralatan modern. Komitmen kami adalah memberikan hasil terbaik dengan harga yang wajar dan proses yang transparan.",
        config: {},
      },
      advantages: {
        heading: "Keunggulan Kami",
        subheading: "Mengapa mempercayakan pada kami",
        body: "",
        config: makeAdvantages([
          { title: "Tenaga Ahli", description: "Tim profesional bersertifikat dan berpengalaman di bidangnya.", icon: "users" },
          { title: "Harga Transparan", description: "Tidak ada biaya tersembunyi. Penawaran detail sebelum pengerjaan.", icon: "badge-check" },
          { title: "Garansi Layanan", description: "Jaminan kepuasan dengan garansi hasil pengerjaan.", icon: "shield" },
          { title: "Respons Cepat", description: "Tim customer service siap merespons dalam hitungan jam.", icon: "gauge" },
        ]),
      },
      featured_categories: {
        heading: "Layanan Kami",
        subheading: "Pilih dari berbagai kategori jasa yang kami tawarkan",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Paket Layanan Terpopuler",
        subheading: "Paket jasa yang paling banyak dipilih pelanggan",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Testimoni Pelanggan",
        subheading: "Dipercaya ribuan pelanggan",
        body: "Kami telah melayani pelanggan dari berbagai sektor, mulai dari rumah tangga, UMKM, hingga perusahaan besar. Kepuasan pelanggan adalah motivasi utama kami.",
        config: {},
      },
      cta: {
        heading: "Butuh Layanan Kami?",
        subheading: "Hubungi kami sekarang untuk konsultasi gratis dan dapatkan penawaran harga terbaik untuk kebutuhan Anda.",
        body: "",
        config: {},
      },
    },
    su: {
      hero: {
        heading: "Layanan Proféssional kanggo Kabutuhan Anjeun",
        subheading: "Solusi jasa dipercaya ku tanaga ahli berpengalaman. Konsultasi gratis sareng harga transparan.",
        body: "",
        config: {},
      },
      about: {
        heading: "Ngeunaan Urang",
        subheading: "Tim proféssional anu siap ngalayanan",
        body: "Urang nyadiakeun layanan jasa proféssional anu didukung ku tim berpengalaman sareng pakakas modérn. Komitmen urang nyaéta masihan hasil pangalusna ku harga anu wajar sareng prosés anu transparan.",
        config: {},
      },
      advantages: {
        heading: "Kaunggulan Urang",
        subheading: "Kunaon mercayakeun ka urang",
        body: "",
        config: makeAdvantages([
          { title: "Tanaga Ahli", description: "Tim proféssional bersertifikat sareng berpengalaman di bidangna.", icon: "users" },
          { title: "Harga Transparan", description: "Teu aya biaya tersembunyi. Panawaran détail saméméh garapan.", icon: "badge-check" },
          { title: "Garansi Layanan", description: "Jaminan kapuasan ku garansi hasil pangerjaan.", icon: "shield" },
          { title: "Réspon Gancang", description: "Tim customer service siap ngaréspon dina hitungan jam.", icon: "gauge" },
        ]),
      },
      featured_categories: {
        heading: "Layanan Urang",
        subheading: "Pilih tina rupa-rupa katégori jasa anu urang tawarkeun",
        body: "",
        config: {},
      },
      featured_products: {
        heading: "Pakét Layanan Pangpopulérna",
        subheading: "Pakét jasa anu panglobana dipilih palanggan",
        body: "",
        config: {},
      },
      testimonials: {
        heading: "Téstimoni Palanggan",
        subheading: "Dipercaya rébuan palanggan",
        body: "Urang parantos ngalayanan palanggan ti rupa-rupa séktor, ti mimiti rumah tangga, UMKM, dugi ka perusahaan ageung. Kapuasan palanggan téh motivasi utama urang.",
        config: {},
      },
      cta: {
        heading: "Butuh Layanan Urang?",
        subheading: "Kontak urang ayeuna kanggo konsultasi gratis sareng kéngingkeun panawaran harga pangalusna kanggo kabutuhan anjeun.",
        body: "",
        config: {},
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Registry                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORY_TEMPLATES: Record<CategoryTemplateSlug, CategoryTemplate> = {
  bordir,
  payung,
  kuliner,
  batik,
  kerajinan,
  jasa,
};

export const CATEGORY_TEMPLATE_SLUGS = Object.keys(CATEGORY_TEMPLATES) as CategoryTemplateSlug[];
