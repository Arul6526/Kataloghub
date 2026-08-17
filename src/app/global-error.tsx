"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#09090b", color: "#fafafa" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "420px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
              Aplikasi Mengalami Gangguan
            </h1>
            <p style={{ color: "#a1a1aa", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.5 }}>
              Maaf, terjadi kesalahan sistem pada aplikasi. Tim kami telah diberitahu mengenai kendala ini.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: "#7c3aed",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Coba Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
