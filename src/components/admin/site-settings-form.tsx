"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import {
  Loader2, Save, MessageCircle, CheckCircle2, Trash2, Upload,
  Building2, Phone, Globe, Megaphone, Store, ImageIcon, AlertCircle, X, Share2,
  LayoutTemplate, ChevronRight, Eye
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  saveSiteSettingsAction, 
  uploadBrandLogoAction, 
  removeBrandLogoAction, 
  uploadAnnouncementBannerAction, 
  removeAnnouncementBannerAction,
  uploadHeroBannerImageAction,
  saveHeroBannersConfigAction
} from "@/lib/actions/site-settings-actions";
import { applyCategoryTemplateAction } from "@/lib/actions/landing-actions";
import { CATEGORY_TEMPLATES, CATEGORY_TEMPLATE_SLUGS, type CategoryTemplateSlug } from "@/lib/category-templates";
import { buildWhatsAppUrl, isValidWhatsAppNumber } from "@/lib/whatsapp";
import { publicUrl } from "@/lib/storage-url";
import { PageHeader } from "@/components/admin/page-header";
import { StoreQrModal } from "./store-qr-modal";
import { QrCode } from "lucide-react";
import type { SiteSettings } from "@/lib/db/types";

/* ------------------------------------------------------------------ */
/*  Sidebar Navigation                                                */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { id: "brand",        label: "Identitas Brand",   icon: Building2 },
  { id: "contact",      label: "Kontak",            icon: Phone },
  { id: "social",       label: "Sosial Media",      icon: Share2 },
  { id: "whatsapp",     label: "WhatsApp & CTA",    icon: MessageCircle },
  { id: "seo",          label: "SEO",               icon: Globe },
  { id: "storefront",   label: "Tampilan Toko",     icon: Store },
  { id: "announcement", label: "Pengumuman",        icon: Megaphone },
  { id: "template",     label: "Template Kategori", icon: LayoutTemplate },
] as const;

/* ------------------------------------------------------------------ */
/*  Main Form                                                         */
/* ------------------------------------------------------------------ */

export function SiteSettingsForm({ initial, templateInfo }: { initial: SiteSettings; templateInfo?: { category_slug: string | null; language: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = React.useState<string>("brand");
  const [showQrModal, setShowQrModal] = React.useState(false);

  /* ---- state ---- */
  const [brandName, setBrandName] = React.useState(initial.brand_name);
  const [brandTagline, setBrandTagline] = React.useState(initial.brand_tagline ?? "");
  const [contactEmail, setContactEmail] = React.useState(initial.contact_email ?? "");
  const [contactPhone, setContactPhone] = React.useState(initial.contact_phone ?? "");
  const [contactAddress, setContactAddress] = React.useState(initial.contact_address ?? "");
  const [socialInstagram, setSocialInstagram] = React.useState(initial.social_instagram ?? "");
  const [socialTiktok, setSocialTiktok] = React.useState(initial.social_tiktok ?? "");
  const [socialShopee, setSocialShopee] = React.useState(initial.social_shopee ?? "");
  const [waNumber, setWaNumber] = React.useState(initial.whatsapp_number ?? "");
  const [waTemplate, setWaTemplate] = React.useState(initial.whatsapp_template);
  const [seoTitle, setSeoTitle] = React.useState(initial.seo_title ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial.seo_description ?? "");
  const [showPrices, setShowPrices] = React.useState(initial.show_prices ?? false);
  const [announcementTitle, setAnnouncementTitle] = React.useState(
    initial.catalog_announcement_title?.trim() || "Eksplorasi Katalog Produk"
  );
  const [announcementMessage, setAnnouncementMessage] = React.useState(
    initial.catalog_announcement_message?.trim() || "Selamat datang di toko kami! Temukan spesifikasi produk terbaik & pesankan langsung via WhatsApp."
  );
  const [announcementEnabled, setAnnouncementEnabled] = React.useState(initial.catalog_announcement_enabled ?? true);
  const [announcementImagePath, setAnnouncementImagePath] = React.useState<string | null>(initial.catalog_announcement_image_path ?? null);
  const [brandLogoPath, setBrandLogoPath] = React.useState<string | null>(initial.brand_logo_path ?? null);
  const [saving, setSaving] = React.useState(false);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);
  const [confirmingRemoveLogo, setConfirmingRemoveLogo] = React.useState(false);
  const [confirmingRemoveBanner, setConfirmingRemoveBanner] = React.useState(false);

  /* ---- hero slide banners state (max 2) ---- */
  const [heroBanners, setHeroBanners] = React.useState<{
    id: "banner_1" | "banner_2";
    image_path: string | null;
    title: string;
    subtitle: string;
    cta_label: string;
    cta_url: string;
    is_active: boolean;
  }[]>([
    { id: "banner_1", image_path: null, title: "", subtitle: "", cta_label: "", cta_url: "", is_active: false },
    { id: "banner_2", image_path: null, title: "", subtitle: "", cta_label: "", cta_url: "", is_active: false },
  ]);
  const heroBanner1InputRef = React.useRef<HTMLInputElement>(null);
  const heroBanner2InputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingHeroBannerId, setUploadingHeroBannerId] = React.useState<string | null>(null);

  const handleUploadHeroBannerImage = async (bannerId: "banner_1" | "banner_2", file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "error", title: "Format Salah", description: "File harus berupa gambar (JPG, PNG, WebP)." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "error", title: "File Terlalu Besar", description: "Ukuran berkas banner maksimal 2 MB. Silakan kompres gambar Anda." });
      return;
    }

    setUploadingHeroBannerId(bannerId);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadHeroBannerImageAction(fd, bannerId);
    setUploadingHeroBannerId(null);

    if (res.ok) {
      setHeroBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, image_path: res.path, is_active: true } : b))
      );
      toast({ variant: "success", title: "Berhasil Upload", description: `Gambar ${bannerId === "banner_1" ? "Banner 1" : "Banner 2"} berhasil diunggah & diaktifkan.` });
    } else {
      toast({ variant: "error", title: "Upload Gagal", description: res.error });
    }
  };

  const handleSaveHeroBanners = async () => {
    setSaving(true);
    const res = await saveHeroBannersConfigAction(heroBanners);
    setSaving(false);

    if (res.ok) {
      toast({ variant: "success", title: "Pengaturan Banner Disimpan", description: "Banner Slide Hero toko berhasil diperbarui." });
    } else {
      toast({ variant: "error", title: "Gagal Menyimpan", description: res.error });
    }
  };

  /* ---- template state ---- */
  const [selectedTemplate, setSelectedTemplate] = React.useState<CategoryTemplateSlug | null>(
    (templateInfo?.category_slug as CategoryTemplateSlug) ?? null
  );
  const [templateLang, setTemplateLang] = React.useState<"id" | "su">(
    (templateInfo?.language === "su" ? "su" : "id")
  );
  const [applyingTemplate, setApplyingTemplate] = React.useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = React.useState(false);
  const [previewTemplate, setPreviewTemplate] = React.useState<CategoryTemplateSlug | null>(null);

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  /* ---- derived ---- */
  const waValid = isValidWhatsAppNumber(waNumber) && waTemplate.trim().length > 0;
  const waPreview = buildWhatsAppUrl({ whatsapp_number: waNumber, whatsapp_template: waTemplate }, "Pom Sentrifugal X-200");
  const logoUrl = publicUrl("brand-assets", brandLogoPath) || publicUrl("landing-media", brandLogoPath);
  const bannerUrl = publicUrl("landing-media", announcementImagePath);

  /* ---- file validation helper ---- */
  function validateImage(file: File, label: string): boolean {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "error", title: "Format file salah", description: `${label} harus berupa gambar (PNG, JPG, WebP).` });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      toast({ variant: "error", title: "File terlalu besar", description: `${label} (${mb} MB) melebihi batas 5 MB.` });
      return false;
    }
    return true;
  }

  /* ---- handlers ---- */
  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !validateImage(file, "Logo")) { if (logoInputRef.current) logoInputRef.current.value = ""; return; }
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadBrandLogoAction(fd);
      if (!res.ok) { toast({ variant: "error", title: "Gagal upload logo", description: res.error }); return; }
      setBrandLogoPath(res.path);
      toast({ variant: "success", title: "Logo berhasil diupload" });
    } catch (err) {
      toast({ variant: "error", title: "Gagal upload", description: err instanceof Error ? err.message : "Kesalahan jaringan" });
    } finally { setUploadingLogo(false); if (logoInputRef.current) logoInputRef.current.value = ""; }
  }

  async function handleConfirmRemoveLogo() {
    setUploadingLogo(true);
    try {
      const res = await removeBrandLogoAction();
      if (!res.ok) { toast({ variant: "error", title: "Gagal hapus logo", description: res.error }); return; }
      setBrandLogoPath(null);
      toast({ variant: "success", title: "Logo dihapus" });
    } finally { 
      setUploadingLogo(false); 
      setConfirmingRemoveLogo(false);
    }
  }

  async function handleUploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !validateImage(file, "Foto banner")) { if (bannerInputRef.current) bannerInputRef.current.value = ""; return; }
    setUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadAnnouncementBannerAction(fd);
      if (!res.ok) { toast({ variant: "error", title: "Gagal upload foto banner", description: res.error }); return; }
      setAnnouncementImagePath(res.path);
      toast({ variant: "success", title: "Foto banner berhasil diupload" });
    } catch (err) {
      toast({ variant: "error", title: "Gagal upload", description: err instanceof Error ? err.message : "Kesalahan jaringan" });
    } finally { setUploadingBanner(false); if (bannerInputRef.current) bannerInputRef.current.value = ""; }
  }

  async function handleConfirmRemoveBanner() {
    setUploadingBanner(true);
    try {
      const res = await removeAnnouncementBannerAction();
      if (!res.ok) { toast({ variant: "error", title: "Gagal hapus foto banner", description: res.error }); return; }
      setAnnouncementImagePath(null);
      toast({ variant: "success", title: "Foto banner dihapus" });
    } finally { 
      setUploadingBanner(false);
      setConfirmingRemoveBanner(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.set("brand_name", brandName);
    fd.set("brand_tagline", brandTagline);
    fd.set("contact_email", contactEmail);
    fd.set("contact_phone", contactPhone);
    fd.set("contact_address", contactAddress);
    fd.set("social_instagram", socialInstagram);
    fd.set("social_tiktok", socialTiktok);
    fd.set("social_shopee", socialShopee);
    fd.set("whatsapp_number", waNumber);
    fd.set("whatsapp_template", waTemplate);
    fd.set("seo_title", seoTitle);
    fd.set("seo_description", seoDescription);
    fd.set("show_prices", String(showPrices));
    fd.set("catalog_announcement_title", announcementTitle);
    fd.set("catalog_announcement_message", announcementMessage);
    fd.set("catalog_announcement_enabled", String(announcementEnabled));

    const res = await saveSiteSettingsAction(fd);
    setSaving(false);
    if (!res.ok) { toast({ variant: "error", title: "Gagal menyimpan", description: res.error }); return; }
    toast({ variant: "success", title: "Pengaturan disimpan" });
    router.refresh();
  }

  /* ---- template handler ---- */
  async function handleApplyTemplate() {
    if (!selectedTemplate) return;
    setApplyingTemplate(true);
    try {
      const res = await applyCategoryTemplateAction(selectedTemplate, templateLang);
      if (!res.ok) {
        toast({ variant: "error", title: "Gagal menerapkan template", description: res.error });
        return;
      }
      toast({ variant: "success", title: "Template berhasil diterapkan", description: "Landing page telah diperbarui dengan konten template." });
      router.refresh();
    } catch (err) {
      toast({ variant: "error", title: "Gagal", description: err instanceof Error ? err.message : "Kesalahan jaringan" });
    } finally {
      setApplyingTemplate(false);
      setShowTemplateConfirm(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ---- Page Header with QR Button Action ---- */}
      <PageHeader
        title="Pengaturan"
        description="Kelola identitas brand, kontak, WhatsApp, SEO, dan tampilan storefront."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQrModal(true)}
            className="gap-2 font-bold text-xs border-primary/30 text-primary hover:bg-primary/10"
          >
            <QrCode className="h-4 w-4" /> Unduh QR Code Toko
          </Button>
        }
      />

      {/* ---- Horizontal Tabs Bar (Compact Segmented Control) ---- */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur -mx-4 px-4 py-2 border-b">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 w-full bg-muted/40 p-1 rounded-xl border">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-1.5 shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm font-semibold border border-border/80"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "opacity-70"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Form body ---- */}
      <form onSubmit={onSubmit} className="space-y-6">

          {/* ═══════ BRAND ═══════ */}
          <SettingsSection id="brand" activeTab={activeSection} title="Identitas Brand" desc="Tampil di header, footer, dan metadata seluruh situs.">
            <div className="rounded-lg border bg-muted/30 p-4">
              <Label className="mb-3 block text-sm font-medium text-foreground">Logo Brand</Label>
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-background">
                  {logoUrl ? (
                    <div className="relative h-full w-full p-1.5">
                      <Image src={logoUrl} alt="Logo Brand" fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" size="sm" className="min-h-[36px] sm:min-h-0" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo || saving}>
                      {uploadingLogo ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                      {brandLogoPath ? "Ganti" : "Upload"}
                    </Button>

                    {brandLogoPath && (
                      confirmingRemoveLogo ? (
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="destructive" size="sm" className="min-h-[36px] sm:min-h-0" onClick={handleConfirmRemoveLogo} disabled={uploadingLogo || saving}>
                            Yakin Hapus?
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setConfirmingRemoveLogo(false)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive min-h-[36px] sm:min-h-0" onClick={() => setConfirmingRemoveLogo(true)} disabled={uploadingLogo || saving}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />Hapus
                        </Button>
                      )
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">PNG, JPG, atau SVG · maks 5 MB · rasio horizontal</p>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" aria-label="Upload logo brand" onChange={handleUploadLogo} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama brand" required>
                <Input value={brandName} onChange={e => setBrandName(e.target.value)} disabled={saving} required />
              </Field>
              <Field label="Tagline" hint="Satu kalimat singkat tentang brand.">
                <Input value={brandTagline} onChange={e => setBrandTagline(e.target.value)} disabled={saving} />
              </Field>
            </div>
          </SettingsSection>

          {/* ═══════ KONTAK ═══════ */}
          <SettingsSection id="contact" activeTab={activeSection} title="Kontak" desc="Informasi kontak untuk footer & halaman kontak.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" hint="Format: nama@brand.com">
                <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} disabled={saving} />
              </Field>
              <Field label="Telepon">
                <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} disabled={saving} placeholder="+62 812 ..." />
              </Field>
            </div>
            <Field label="Alamat">
              <Textarea rows={2} value={contactAddress} onChange={e => setContactAddress(e.target.value)} disabled={saving} />
            </Field>
          </SettingsSection>

          {/* ═══════ SOSIAL MEDIA ═══════ */}
          <SettingsSection id="social" activeTab={activeSection} title="Sosial Media Toko" desc="Tautan sosial media & marketplace yang akan ditampilkan pada footer toko.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Instagram URL" hint="Contoh: https://instagram.com/tokoanda">
                <Input
                  value={socialInstagram}
                  onChange={e => setSocialInstagram(e.target.value)}
                  disabled={saving}
                  placeholder="https://instagram.com/username"
                />
              </Field>
              <Field label="TikTok URL" hint="Contoh: https://tiktok.com/@tokoanda">
                <Input
                  value={socialTiktok}
                  onChange={e => setSocialTiktok(e.target.value)}
                  disabled={saving}
                  placeholder="https://tiktok.com/@username"
                />
              </Field>
              <Field label="Shopee URL" hint="Contoh: https://shopee.co.id/tokoanda">
                <Input
                  value={socialShopee}
                  onChange={e => setSocialShopee(e.target.value)}
                  disabled={saving}
                  placeholder="https://shopee.co.id/username"
                />
              </Field>
            </div>
          </SettingsSection>

          {/* ═══════ WHATSAPP ═══════ */}
          <SettingsSection id="whatsapp" activeTab={activeSection} title="WhatsApp & CTA" desc="Jalur konversi utama. Nomor harus valid agar link berfungsi.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nomor WhatsApp" required hint="Digit internasional tanpa '+'. Contoh: 62812xxxxxxxx">
                <Input value={waNumber} onChange={e => setWaNumber(e.target.value)} disabled={saving} required className="font-mono tabular-nums" placeholder="62812xxxxxxxx" />
              </Field>
            </div>
            <Field label="Template pesan default" required hint="Token [nama produk] diganti otomatis dari halaman detail.">
              <Textarea rows={3} value={waTemplate} onChange={e => setWaTemplate(e.target.value)} disabled={saving} required placeholder="Halo, saya ingin tanya harga untuk produk [nama produk]." />
            </Field>

            {/* WhatsApp preview inline */}
            <div className="rounded-lg border p-4 bg-muted/20">
              {waValid ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">Link WhatsApp valid dan siap digunakan.</p>
                    <a
                      href={waPreview ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground transition-colors hover:bg-success/90"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Preview wa.me
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p className="text-sm text-muted-foreground">
                    Nomor atau template belum valid. CTA WhatsApp belum aktif di storefront.
                  </p>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* ═══════ SEO ═══════ */}
          <SettingsSection id="seo" activeTab={activeSection} title="SEO Dasar" desc="Metadata default untuk halaman publik.">
            <Field label="Title" hint="Maks 180 karakter.">
              <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} disabled={saving} />
            </Field>
            <Field label="Meta description" hint="Maks 400 karakter.">
              <Textarea rows={3} value={seoDescription} onChange={e => setSeoDescription(e.target.value)} disabled={saving} />
            </Field>
          </SettingsSection>

          {/* ═══════ STOREFRONT ═══════ */}
          <SettingsSection id="storefront" activeTab={activeSection} title="Tampilan Toko & Banner Hero" desc="Kontrol global untuk informasi etalase publik dan banner slide promosi toko.">
            <div className="space-y-6">
              <ToggleRow
                id="show_prices"
                label="Tampilkan harga di storefront"
                description="Harga produk muncul di kartu & halaman detail. Nonaktifkan untuk menyembunyikan harga."
                checked={showPrices}
                onCheckedChange={setShowPrices}
                disabled={saving}
              />

              <div className="pt-4 border-t border-border/80 space-y-6">
                
                {/* Box Panduan Ukuran & Aturan Gambar */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <h4 className="font-space text-xs font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span>📐 Panduan Ukuran Banner Slide Hero (Rapi & Tidak Terpotong)</span>
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc leading-relaxed">
                    <li><strong>Rasio Berkas Disarankan:</strong> Landscape <strong>16:9</strong> (Ukuran ideal: <strong>1200 x 600 px</strong> atau <strong>1000 x 500 px</strong>).</li>
                    <li><strong>Batas Maksimal Ukuran File:</strong> <strong>2 MB</strong> (Gunakan format JPG, PNG, atau WebP yang terkompresi).</li>
                    <li><strong>Tips Tampilan Rapi:</strong> Posisikan teks atau objek penting di area tengah banner agar selalu tampak tajam di layar Ponsel maupun Laptop.</li>
                  </ul>
                </div>

                {/* Loop 2 Banners */}
                {heroBanners.map((banner, index) => {
                  const bannerNum = index + 1;
                  const bUrl = publicUrl("landing-media", banner.image_path);
                  const inputRef = bannerNum === 1 ? heroBanner1InputRef : heroBanner2InputRef;

                  return (
                    <div key={banner.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-space text-sm font-bold text-foreground">
                            Banner Promo #{bannerNum}
                          </span>
                          {banner.is_active && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                              Aktif Tampil
                            </span>
                          )}
                        </div>

                        {/* Toggle Button Active / Nonactive */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">Tampilkan Banner:</span>
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={(val) => {
                              setHeroBanners((prev) =>
                                prev.map((b) => (b.id === banner.id ? { ...b, is_active: val } : b))
                              );
                            }}
                          />
                        </div>
                      </div>

                      {/* Image Preview & Upload Box */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative h-28 w-full sm:w-56 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                          {bUrl ? (
                            <img src={bUrl} alt={`Banner ${bannerNum}`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-muted-foreground">
                              <ImageIcon className="h-6 w-6 mx-auto opacity-40 mb-1" />
                              <span className="text-[10px]">Belum ada gambar</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={inputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadHeroBannerImage(banner.id, file);
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploadingHeroBannerId === banner.id || saving}
                            className="gap-2 text-xs"
                          >
                            {uploadingHeroBannerId === banner.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                            {banner.image_path ? `Ganti Gambar Banner #${bannerNum}` : `Upload Gambar Banner #${bannerNum}`}
                          </Button>
                          <p className="text-[10px] text-muted-foreground">Maksimal 2 MB · Rasio 16:9 (1200 x 600 px)</p>
                        </div>
                      </div>

                      {/* Form Fields for Title, Subtitle, CTA */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Field label={`Judul Banner #${bannerNum}`} hint="Misal: Promo Diskon 20% Bulan Ini">
                          <Input
                            value={banner.title || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeroBanners((prev) =>
                                prev.map((b) => (b.id === banner.id ? { ...b, title: val } : b))
                              );
                            }}
                            placeholder="Promo Spesial Produk"
                          />
                        </Field>

                        <Field label="Teks Sub-judul" hint="Deskripsi promo singkat">
                          <Input
                            value={banner.subtitle || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeroBanners((prev) =>
                                prev.map((b) => (b.id === banner.id ? { ...b, subtitle: val } : b))
                              );
                            }}
                            placeholder="Berlaku untuk semua pembelian"
                          />
                        </Field>

                        <Field label="Teks Tombol CTA" hint="Misal: Lihat Promo / Order WA">
                          <Input
                            value={banner.cta_label || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeroBanners((prev) =>
                                prev.map((b) => (b.id === banner.id ? { ...b, cta_label: val } : b))
                              );
                            }}
                            placeholder="Lihat Promo Spesial"
                          />
                        </Field>

                        <Field label="Link URL Tombol" hint="Opsional, misal: /produk">
                          <Input
                            value={banner.cta_url || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeroBanners((prev) =>
                                prev.map((b) => (b.id === banner.id ? { ...b, cta_url: val } : b))
                              );
                            }}
                            placeholder="/produk"
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-3 flex justify-end">
                  <Button type="button" onClick={handleSaveHeroBanners} disabled={saving} className="gap-2 font-bold bg-primary text-primary-foreground">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Konfigurasi Banner Hero
                  </Button>
                </div>

              </div>
            </div>
          </SettingsSection>

          {/* ═══════ TEMPLATE KATEGORI ═══════ */}
          <SettingsSection id="template" activeTab={activeSection} title="Template Kategori" desc="Terapkan template konten landing page sesuai industri Anda. Backup otomatis dibuat sebelum perubahan.">
            {/* Language toggle */}
            <div className="flex items-center gap-3 mb-4">
              <Label className="text-sm font-medium">Bahasa Konten:</Label>
              <div className="flex rounded-lg border bg-muted/30 p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => setTemplateLang("id")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    templateLang === "id" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇮🇩 Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateLang("su")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    templateLang === "su" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏔️ Sunda
                </button>
              </div>
            </div>

            {/* Template cards grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORY_TEMPLATE_SLUGS.map((slug) => {
                const t = CATEGORY_TEMPLATES[slug];
                const isActive = selectedTemplate === slug && templateInfo?.category_slug === slug;
                const isSelected = selectedTemplate === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setSelectedTemplate(slug)}
                    className={`relative text-left rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Aktif
                      </span>
                    )}
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <h3 className="font-semibold text-sm">{t.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(slug); }}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3 w-3" /> Lihat Preview
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Preview panel */}
            {previewTemplate && CATEGORY_TEMPLATES[previewTemplate] && (
              <div className="mt-4 rounded-lg border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Preview: {CATEGORY_TEMPLATES[previewTemplate].label} ({templateLang === "su" ? "Sunda" : "Indonesia"})
                  </h4>
                  <button type="button" onClick={() => setPreviewTemplate(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(["hero", "about", "advantages", "featured_categories", "featured_products", "testimonials", "cta"] as const).map((key) => {
                    const data = CATEGORY_TEMPLATES[previewTemplate].sections[templateLang][key];
                    return (
                      <div key={key} className="rounded border bg-background p-3">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{key}</span>
                        <p className="text-sm font-semibold mt-0.5">{data.heading}</p>
                        {data.subheading && <p className="text-xs text-muted-foreground">{data.subheading}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Apply button */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                type="button"
                disabled={!selectedTemplate || applyingTemplate}
                onClick={() => setShowTemplateConfirm(true)}
                className="gap-2"
              >
                {applyingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutTemplate className="h-4 w-4" />}
                Terapkan Template
              </Button>
              {selectedTemplate && (
                <span className="text-xs text-muted-foreground">
                  Template terpilih: <strong>{CATEGORY_TEMPLATES[selectedTemplate]?.label}</strong>
                </span>
              )}
            </div>

            {/* Confirmation dialog */}
            {showTemplateConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Terapkan Template?</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ini akan <strong>menimpa konten</strong> seluruh 7 section landing page Anda dengan konten template <strong>{CATEGORY_TEMPLATES[selectedTemplate!]?.label}</strong> dalam bahasa <strong>{templateLang === "su" ? "Sunda" : "Indonesia"}</strong>.
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        ✅ Backup otomatis akan dibuat sebelum perubahan.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplateConfirm(false)} disabled={applyingTemplate}>
                      Batal
                    </Button>
                    <Button type="button" size="sm" onClick={handleApplyTemplate} disabled={applyingTemplate} className="gap-1.5">
                      {applyingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Ya, Terapkan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SettingsSection>

          {/* ---- Sticky save bar ---- */}
          <div className="sticky bottom-0 z-30 -mx-1 flex items-center gap-3 border-t bg-background/95 px-1 py-4 backdrop-blur-sm">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Pengaturan
            </Button>
            <span className="text-xs text-muted-foreground">Perubahan belum tersimpan sampai tombol diklik.</span>
          </div>
        </form>

      {/* QR Code Modal Toko */}
      <StoreQrModal
        storeSlug={initial.store_slug || ""}
        brandName={brandName ?? undefined}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function SettingsSection({
  id, title, desc, activeTab, children,
}: {
  id: string; title: string; desc?: string; activeTab?: string; children: React.ReactNode;
}) {
  const isHidden = activeTab !== undefined && activeTab !== id;
  return (
    <section id={`section-${id}`} className={isHidden ? "hidden" : "space-y-4"}>
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      <div className="space-y-4 rounded-lg border bg-card p-5">
        {children}
      </div>
    </section>
  );
}

function ToggleRow({
  id, label, description, checked, onCheckedChange, disabled,
}: {
  id: string; label: string; description: string;
  checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}