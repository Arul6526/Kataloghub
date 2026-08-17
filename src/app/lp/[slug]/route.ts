import { type NextRequest, NextResponse } from "next/server";
import {
  fetchCustomLandingPageBySlug,
  fetchLinkedProducts,
} from "@/lib/actions/custom-landing-actions";
import { publicUrl } from "@/lib/storage-url";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildProductCard(
  product: {
    name: string;
    slug: string;
    summary: string | null;
    main_image_path: string | null;
  },
  imgUrl: string | null,
): string {
  const img = imgUrl
    ? `<img src="${imgUrl}" alt="${escapeHtml(product.name)}" style="width:100%;height:220px;object-fit:cover;">`
    : `<div style="width:100%;height:220px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;">Tidak ada gambar</div>`;

  return `<div class="product-card" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif;max-width:300px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  ${img}
  <div style="padding:16px;">
    <h3 style="margin:0 0 6px;font-size:17px;font-weight:700;line-height:1.3;color:#111827;">${escapeHtml(product.name)}</h3>
    ${product.summary ? `<p style="margin:0 0 12px;font-size:14px;color:#6b7280;line-height:1.5;">${escapeHtml(product.summary)}</p>` : ""}
    <a href="/products/${product.slug}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Lihat Produk →</a>
  </div>
</div>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await fetchCustomLandingPageBySlug(slug).catch(() => null);

  if (!page || !page.is_active) {
    return new NextResponse("<h1>404 – Halaman tidak ditemukan</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const products = await fetchLinkedProducts(page.product_ids).catch(() => []);

  let html = page.html_source;

  for (const product of products) {
    const imgUrl = publicUrl("product-images", product.main_image_path);
    const card = buildProductCard(product, imgUrl);
    const re = (field: string) =>
      new RegExp(`\\{\\{product:${escapeRegExp(product.slug)}:${field}\\}\\}`, "g");

    html = html
      .replace(re("card"), card)
      .replace(re("name"), escapeHtml(product.name))
      .replace(re("image"), imgUrl ?? "")
      .replace(re("link"), `/products/${product.slug}`)
      .replace(re("description"), escapeHtml(product.summary ?? product.name));
  }

  // Legacy support: inject separate css/js if they exist (from old data)
  const cssInject = page.css_source?.trim()
    ? `<style>${page.css_source}</style>`
    : "";
  const jsInject = page.js_source?.trim()
    ? `<script>${page.js_source}<\/script>`
    : "";

  if (cssInject || jsInject) {
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${cssInject}${jsInject}</body>`);
    } else {
      html += cssInject + jsInject;
    }
  }

  const isFullDoc =
    html.trim().toLowerCase().startsWith("<!doctype") ||
    html.trim().toLowerCase().startsWith("<html");

  if (!isFullDoc) {
    html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.meta_title ?? page.title)}</title>
  ${page.meta_description ? `<meta name="description" content="${escapeHtml(page.meta_description)}">` : ""}
</head>
<body>
${html}
</body>
</html>`;
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
