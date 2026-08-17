-- ============================================================
-- Migration: Seed landing sections default
-- Tanggal: 2026-07-12
-- Membuat 7 section MVP dengan sort_order default & is_visible=false
-- sampai admin mengisinya. Section kosong disembunyikan di publik.
-- ============================================================

insert into public.landing_sections (section_key, heading, subheading, body, config, is_visible, sort_order) values
  (
    'hero',
    'Solusi Teknikal untuk Industri Anda',
    'Brand katalog produk teknis terpercaya',
    null,
    '{"image_path": null, "cta_label": "Lihat Katalog", "cta_href": "/katalog"}'::jsonb,
    false,
    10
  ),
  (
    'about',
    'Tentang Brand',
    null,
    'Cerita singkat tentang brand dan posisi kami di industri.',
    '{"image_path": null}'::jsonb,
    false,
    20
  ),
  (
    'advantages',
    'Keunggulan Kami',
    null,
    null,
    '{"items": []}'::jsonb,
    false,
    30
  ),
  (
    'featured_categories',
    'Kategori Unggulan',
    null,
    null,
    '{"category_ids": []}'::jsonb,
    false,
    40
  ),
  (
    'featured_products',
    'Produk Pilihan',
    null,
    null,
    '{"product_ids": []}'::jsonb,
    false,
    50
  ),
  (
    'testimonials',
    'Proyek & Testimonial',
    null,
    null,
    '{"items": []}'::jsonb,
    false,
    60
  ),
  (
    'cta',
    'Butuh konsultasi produk?',
    'Tim kami siap membantu memilih produk yang tepat.',
    null,
    '{"cta_label": "Tanya Harga via WhatsApp", "cta_href": "whatsapp"}'::jsonb,
    false,
    70
  )
on conflict (section_key) do nothing;
