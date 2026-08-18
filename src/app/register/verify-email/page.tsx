import type { Metadata } from "next";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verifikasi Email - KatalogHub",
  description: "Verifikasi email untuk mengaktifkan akun KatalogHub Anda.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return <VerifyEmailClient email={params.email || ""} />;
}
