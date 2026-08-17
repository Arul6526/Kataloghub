import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KatalogHub — Digital Catalog & E-Catalog",
    short_name: "KatalogHub",
    description: "Platform Katalog Produk Digital, Spesifikasi Teknis & Order WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#1d4ed8",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
