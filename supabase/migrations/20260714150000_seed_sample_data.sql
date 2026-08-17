-- ============================================================
-- Migration: seed sample data untuk evaluasi backoffice
-- ============================================================

-- ------------------------------------------------------------
-- 1. Site settings: brand info lengkap
-- ------------------------------------------------------------
update public.site_settings set
  brand_name        = 'Cakra Teknik',
  brand_tagline     = 'Solusi Presisi untuk Kebutuhan Industri Anda',
  contact_email     = 'info@cakrateknik.co.id',
  contact_phone     = '+62 21 5555 1234',
  contact_address   = 'Jl. Industri Raya No. 88, Tangerang, Banten 15132',
  whatsapp_number   = '6281234567890',
  whatsapp_template = 'Halo Cakra Teknik, saya tertarik dengan produk {{name}} di katalog Anda. Mohon info harga dan ketersediaan.',
  seo_title         = 'Cakra Teknik — Katalog Produk Teknikal Industri',
  seo_description   = 'Katalog produk teknis industri: pompa, valve, filter, alat ukur. Spesifikasi lengkap, harga kompetitif, pengiriman seluruh Indonesia.'
where id = 1;

-- ------------------------------------------------------------
-- 2. Kategori produk
-- ------------------------------------------------------------
insert into public.categories (id, name, slug, description, is_visible, sort_order) values
  ('a1000000-0000-0000-0000-000000000001', 'Pompa Sentrifugal',  'pompa-sentrifugal',
   'Pompa industri untuk transfer cairan korosif, panas, dan abrasive. Tersedia berbagai kapasitas dan material.',
   true, 10),
  ('a1000000-0000-0000-0000-000000000002', 'Katup Industri',     'katup-industri',
   'Gate valve, ball valve, butterfly valve, dan globe valve untuk sistem perpipaan tekanan tinggi.',
   true, 20),
  ('a1000000-0000-0000-0000-000000000003', 'Filter & Saringan',  'filter-saringan',
   'Sistem filtrasi untuk air, oli, gas, dan bahan kimia. Cartridge filter, bag filter, dan housing.',
   true, 30),
  ('a1000000-0000-0000-0000-000000000004', 'Alat Ukur Teknikal', 'alat-ukur-teknikal',
   'Instrumen presisi: pressure gauge, flow meter, temperature sensor, dan calibrator.',
   true, 40),
  ('a1000000-0000-0000-0000-000000000005', 'Pipa & Fittings',    'pipa-fittings',
   'Pipa baja carbon steel, stainless steel, PVC, dan HDPE beserta fittings lengkap.',
   false, 50)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. Spec templates (1 per kategori)
-- ------------------------------------------------------------
insert into public.category_spec_templates (id, category_id, is_active) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', true),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', true),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', true),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4. Spec fields — Pompa Sentrifugal
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Kapasitas',       'kapasitas',        'number',   '[]'::jsonb, 'm³/jam',  true,  true,  10),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Head (Total)',     'head_total',       'number',   '[]'::jsonb, 'meter',   true,  true,  20),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Daya Motor',      'daya_motor',       'number',   '[]'::jsonb, 'kW',      true,  false, 30),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Material Wetted',  'material_wetted',  'select',   '["SS316","SS304","Cast Iron","CD4MCu","Hastelloy"]'::jsonb, null, true,  true,  40),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'Kecepatan Putaran','kecepatan_putaran','number',   '[]'::jsonb, 'RPM',     false, false, 50),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'Tahan Korosi',    'tahan_korosi',     'boolean',  '[]'::jsonb, null,      false, true,  60);

-- ------------------------------------------------------------
-- 5. Spec fields — Katup Industri
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Tipe Katup',       'tipe_katup',       'select',   '["Gate","Ball","Butterfly","Globe","Check","Needle"]'::jsonb, null, true,  true,  10),
  ('c2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Ukuran DN',         'ukuran_dn',        'number',   '[]'::jsonb, 'mm',      true,  true,  20),
  ('c2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Tekanan Maks',     'tekanan_maks',     'number',   '[]'::jsonb, 'bar',     true,  true,  30),
  ('c2000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Material Body',    'material_body',    'select',   '["Carbon Steel","SS316","SS304","Bronze","Ductile Iron"]'::jsonb, null, true,  true,  40),
  ('c2000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Sertifikasi',      'sertifikasi',      'select',   '["API 600","API 602","BS EN 12516","WRAS","ATEX"]'::jsonb, null, false, true,  50);

-- ------------------------------------------------------------
-- 6. Spec fields — Filter & Saringan
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c3000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'Tipe Filter',      'tipe_filter',      'select',   '["Cartridge","Bag","Basket","Membrane","Activated Carbon"]'::jsonb, null, true,  true,  10),
  ('c3000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'Ukuran Micron',     'ukuran_micron',    'number',   '[]'::jsonb, 'μm',      true,  true,  20),
  ('c3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Flow Rate Maks',   'flow_rate_maks',   'number',   '[]'::jsonb, 'L/min',   true,  false, 30),
  ('c3000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'Media Filtrasi',   'media_filtrasi',   'select',   '["Polypropylene","Polyester","Fiberglass","Stainless Steel Mesh"]'::jsonb, null, true,  true,  40),
  ('c3000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Tahan Suhu',       'tahan_suhu',       'number',   '[]'::jsonb, '°C',      false, true,  50);

-- ------------------------------------------------------------
-- 7. Spec fields — Alat Ukur
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c4000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'Tipe Instrumen',   'tipe_instrumen',   'select',   '["Pressure Gauge","Flow Meter","Temperature Sensor","Level Sensor","Calibrator"]'::jsonb, null, true,  true,  10),
  ('c4000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'Range Ukur',       'range_ukur',       'text',     '[]'::jsonb, null,      true,  true,  20),
  ('c4000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 'Akurasi',          'akurasi',          'select',   '["±0.1%","±0.25%","±0.5%","±1.0%","±1.5%"]'::jsonb, null, true,  true,  30),
  ('c4000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Output Signal',    'output_signal',    'select',   '["4-20mA","0-10V","HART","Modbus","Pulse"]'::jsonb, null, false, true,  40),
  ('c4000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 'Material Probe',   'material_probe',   'select',   '["SS316","SS304","Inconel","Titanium","PTFE Lined"]'::jsonb, null, false, true,  50);

-- ------------------------------------------------------------
-- 8. Produk — Pompa Sentrifugal
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Pompa Sentrifugal CS-200',
   'pompa-sentrifugal-cs-200',
   'Pompa sentrifugal heavy duty untuk aplikasi korosif, kapasitas 200 m³/jam.',
   'Pompa sentrifugal CS-200 dirancang untuk aplikasi transfer cairan korosif dan abrasive di industri petrokimia, pertambangan, dan pengolahan limbah. Body cast iron dengan impeller SS316L untuk ketahanan optimal.',
   ARRAY['pompa','korosif','heavy-duty','centrifugal']::text[],
   true, 10),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'Pompa Sentrifugal CS-50',
   'pompa-sentrifugal-cs-50',
   'Pompa industri kompak untuk kapasitas 50 m³/jam, material SS304.',
   'Solusi ringkas untuk aplikasi transfer cairan bersih di industri makanan, farmasi, dan HVAC. Desain sanitary grade dengan finishing mirror polish.',
   ARRAY['pompa','sanitary','food-grade','ss304']::text[],
   true, 20),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'Pompa Sentrifugal CH-500',
   'pompa-sentrifugal-ch-500',
   'Pompa high-capacity 500 m³/jam untuk aplikasi water treatment dan cooling tower.',
   'Pompa berkapasitas tinggi dengan efficiency mencapai 82%. Dilengkapi mechanical seal type D04 untuk mencegah kebocoran pada tekanan tinggi.',
   ARRAY['pompa','high-capacity','water-treatment','cooling']::text[],
   false, 30);

-- ------------------------------------------------------------
-- 9. Produk — Katup Industri
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002',
   'Gate Valve API 600 DN100',
   'gate-valve-api-600-dn100',
   'Gate valve berstandar API 600, DN100, tekanan 150#.',
   'Gate valve rugged untuk layanan on-off di refinery dan power plant. Rising stem design dengan bonnet bolted untuk kemudahan maintenance.',
   ARRAY['valve','gate','api-600','refinery']::text[],
   true, 10),
  ('d2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
   'Ball Valve Full Bore DN50',
   'ball-valve-full-bore-dn50',
   'Ball valve stainless steel full bore, DN50, tekanan 100 bar.',
   'Ball valve full bore untuk minimize pressure drop. Trunnion mounted untuk ukuran DN50 ke atas. Sertifikasi ATEX untuk area berbahaya.',
   ARRAY['valve','ball','stainless','atex']::text[],
   true, 20),
  ('d2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002',
   'Butterfly Valve EN 593 DN200',
   'butterfly-valve-en-593-dn200',
   'Butterfly valve lug type, DN200, untuk water treatment dan HVAC.',
   'Butterfly valve dengan desain lug type yang memungkinkan penggunaan pada sistem bongkar pasang (dead-end service). Disc SS316, seat EPDM.',
   ARRAY['valve','butterfly','water-treatment','hvac']::text[],
   true, 30),
  ('d2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002',
   'Check Valve Swing DN80',
   'check-valve-swing-dn80',
   'Check valve swing type untuk mencegah backflow, DN80.',
   'Check valve dengan mekanisme swing yang minim pressure loss. Cocok untuk aplikasi pump discharge dan sistem piping vertikal.',
   ARRAY['valve','check','backflow','pump-discharge']::text[],
   false, 40);

-- ------------------------------------------------------------
-- 10. Produk — Filter & Saringan
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003',
   'Cartridge Filter Housing CF-10',
   'cartridge-filter-housing-cf-10',
   'Housing cartridge filter 10 inch, SS316, 5 cartridge elements.',
   'Housing stainless steel untuk 5 elemen cartridge 10 inch. Max tekanan 10 bar, suhu kerja maks 120°C. Dilengkapi pressure gauge dan drain valve.',
   ARRAY['filter','cartridge','ss316','housing']::text[],
   true, 10),
  ('d3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003',
   'Bag Filter BF-200',
   'bag-filter-bf-200',
   'Bag filter size 2, flow rate 200 L/min, housing carbon steel.',
   'Bag filter untuk aplikasi high-flow dengan 200 mesh stainless steel basket. Housing carbon steel dengan epoxy coating untuk ketahanan korosi.',
   ARRAY['filter','bag','high-flow','carbon-steel']::text[],
   true, 20),
  ('d3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003',
   'Activated Carbon Filter ACF-44',
   'activated-carbon-filter-acf-44',
   'Filter karbon aktif untuk removal klorin, VOC, dan bau.',
   'Vertical pressure vessel dengan media karbon aktif coconut shell. Capacity 44 liter media. Ideal untuk pre-treatment RO dan dechlorination.',
   ARRAY['filter','carbon','dechlorination','voc']::text[],
   true, 30);

-- ------------------------------------------------------------
-- 11. Produk — Alat Ukur
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004',
   'Pressure Gauge SS316 PG-200',
   'pressure-gauge-ss316-pg-200',
   'Pressure gauge bourdon tube, range 0-200 bar, akurasi ±0.5%.',
   'Pressure gauge dengan casing dan socket SS316 untuk aplikasi korosif. Bourdon tube Monel untuk media agresif. Dilengkapi blow-out safety back.',
   ARRAY['pressure','gauge','ss316','bourdon']::text[],
   true, 10),
  ('d4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004',
   'Magnetic Flow Meter MF-150',
   'magnetic-flow-meter-mf-150',
   'Electromagnetic flow meter DN150, output 4-20mA + HART.',
   'Flow meter tanpa bagian moving part untuk akurasi tinggi pada cairan导电. Lining PTFE untuk chemical resistance. Sertifikasi SIL2.',
   ARRAY['flow-meter','magnetic','hart','sil2']::text[],
   true, 20),
  ('d4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004',
   'Temperature Transmitter TT-100',
   'temperature-transmitter-tt-100',
   'RTD Pt100 temperature transmitter, range -50°C s/d 400°C, output 4-20mA.',
   'Head-mount temperature transmitter dengan sensor Pt100 class A. Accuracy ±0.15°C. Housing aluminium explosion-proof Ex d IIC T6.',
   ARRAY['temperature','rtd','pt100','explosion-proof']::text[],
   true, 30);

-- ------------------------------------------------------------
-- 12. Spec values untuk produk visible
-- ------------------------------------------------------------
-- Pompa CS-200
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 200),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 35),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 45),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 2900);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'SS316');

insert into public.product_spec_values (product_id, field_id, value_boolean) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000006', true);

-- Pompa CS-50
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 50),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 18),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 11),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 2900);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'SS304');

-- Gate Valve
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 100),
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000003', 20);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Gate'),
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000004', 'Carbon Steel'),
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000005', 'API 600');

-- Ball Valve
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 50),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000003', 100);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'Ball'),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000004', 'SS316'),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000005', 'ATEX');

-- Butterfly Valve
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 200),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000003', 10);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001', 'Butterfly'),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000004', 'Ductile Iron'),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000005', 'BS EN 12516');

-- Cartridge Filter
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000002', 5),
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000003', 50),
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000005', 120);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Cartridge'),
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000004', 'Polypropylene');

-- Pressure Gauge
insert into public.product_spec_values (product_id, field_id, value_text) values
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000002', '0 – 200 bar');

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000001', 'Pressure Gauge'),
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000003', '±0.5%'),
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000005', 'SS316');

-- Magnetic Flow Meter
insert into public.product_spec_values (product_id, field_id, value_text) values
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000002', '0.3 – 12 m/s');

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000001', 'Flow Meter'),
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000003', '±0.5%'),
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000004', 'HART');

-- Temperature Transmitter
insert into public.product_spec_values (product_id, field_id, value_text) values
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000002', '-50°C – 400°C');

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000001', 'Temperature Sensor'),
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000003', '±0.1%'),
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000004', '4-20mA'),
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000005', 'Inconel');

-- ------------------------------------------------------------
-- 13. Update landing sections dengan konten realistis & visible
-- ------------------------------------------------------------
update public.landing_sections set
  is_visible = true,
  config = '{
    "image_path": null,
    "cta_label": "Lihat Katalog",
    "cta_href": "/admin/products"
  }'::jsonb
where section_key = 'hero';

update public.landing_sections set
  is_visible = true,
  heading = 'Tentang Cakra Teknik',
  body = 'Didirikan sejak 2008, Cakra Teknik telah menjadi partner terpercaya untuk ribuan industri di Indonesia. Kami menyediakan peralatan teknis berkualitas tinggi dengan sertifikasi internasional dan layanan after-sales yang responsif.',
  config = '{"image_path": null}'::jsonb
where section_key = 'about';

update public.landing_sections set
  is_visible = true,
  heading = 'Mengapa Cakra Teknik?',
  config = '{
    "items": [
      {"icon": "shield", "title": "Sertifikasi Lengkap", "description": "Semua produk memiliki sertifikasi API, ISO, dan CE sesuai standar internasional."},
      {"icon": "clock", "title": "Pengiriman Cepat", "description": "Stok ready stock untuk item populer, pengiriman ke seluruh Indonesia dalam 3-7 hari kerja."},
      {"icon": "headphones", "title": "Tech Support 24/7", "description": "Tim teknisi berpengalaman siap membantu konsultasi teknis dan troubleshooting."},
      {"icon": "wrench", "title": "After-Sales Service", "description": "Garansi resmi dan layanan maintenance berkala untuk semua produk yang kami jual."}
    ]
  }'::jsonb
where section_key = 'advantages';

update public.landing_sections set
  is_visible = true,
  config = '{
    "category_ids": [
      "a1000000-0000-0000-0000-000000000001",
      "a1000000-0000-0000-0000-000000000002",
      "a1000000-0000-0000-0000-000000000003",
      "a1000000-0000-0000-0000-000000000004"
    ]
  }'::jsonb
where section_key = 'featured_categories';

update public.landing_sections set
  is_visible = true,
  config = '{
    "product_ids": [
      "d1000000-0000-0000-0000-000000000001",
      "d2000000-0000-0000-0000-000000000001",
      "d3000000-0000-0000-0000-000000000001",
      "d4000000-0000-0000-0000-000000000001"
    ]
  }'::jsonb
where section_key = 'featured_products';

update public.landing_sections set
  is_visible = true,
  heading = 'Proyek & Testimonial',
  config = '{
    "items": [
      {"author": "Budi Santoso", "role": "Maintenance Manager, PT Semen Gresik", "quote": "Pompa CS-200 yang kami beli dari Cakra Teknik sudah berjalan 2 tahun tanpa masalah. Layanan after-sales mereka sangat responsif."},
      {"author": "Rina Wijaya", "role": "Process Engineer, PT Pertamina", "quote": "Butterfly valve dari Cakra Teknik memiliki kualitas setara import Eropa dengan harga yang lebih kompetitif. Sangat recommended."},
      {"author": "Ahmad Fauzi", "role": "Plant Manager, PT Indolakto", "quote": "Sejak berganti ke cartridge filter dari Cakra Teknik, biaya maintenance sistem filtrasi kami turun 40%. Kualitas filtration excellent."}
    ]
  }'::jsonb
where section_key = 'testimonials';

update public.landing_sections set
  is_visible = true,
  heading = 'Butuh konsultasi produk untuk proyek Anda?',
  subheading = 'Tim kami siap membantu memilih produk yang tepat sesuai kebutuhan teknis Anda.',
  config = '{
    "cta_label": "Tanya Harga via WhatsApp",
    "cta_href": "whatsapp"
  }'::jsonb
where section_key = 'cta';
