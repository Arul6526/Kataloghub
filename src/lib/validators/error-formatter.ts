import { ZodError } from "zod";

/**
 * Converts Zod validation errors into user-friendly Indonesian error messages.
 */
export function formatZodError(error: ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) return "Data tidak valid";

  const fieldLabel = (path: string): string => {
    const labels: Record<string, string> = {
      name: "Nama",
      slug: "Slug URL",
      email: "Email",
      password: "Kata Sandi",
      category_id: "Kategori",
      price: "Harga",
      summary: "Ringkasan",
      description: "Deskripsi",
      main_image_path: "Foto Utama",
      brand_name: "Nama Toko",
      whatsapp_number: "Nomor WhatsApp",
    };
    return labels[path] || path;
  };

  const pathStr = firstIssue.path.join(".");
  const fieldName = fieldLabel(pathStr);

  if (firstIssue.message && !firstIssue.message.includes("String must contain")) {
    return firstIssue.message;
  }

  switch (firstIssue.code) {
    case "invalid_type":
      return `"${fieldName}" wajib diisi dengan benar`;
    case "too_small":
      if (firstIssue.type === "string") {
        return `"${fieldName}" minimal ${firstIssue.minimum} karakter`;
      }
      return `"${fieldName}" minimal ${firstIssue.minimum}`;
    case "too_big":
      if (firstIssue.type === "string") {
        return `"${fieldName}" maksimal ${firstIssue.maximum} karakter`;
      }
      return `"${fieldName}" maksimal ${firstIssue.maximum}`;
    default:
      return `Format "${fieldName}" tidak valid`;
  }
}
