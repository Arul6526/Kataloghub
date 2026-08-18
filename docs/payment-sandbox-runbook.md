# Payment Sandbox Runbook

Runbook ini menguji alur pembayaran end-to-end tanpa uang sungguhan.

## Environment

Gunakan kredensial sandbox Sumopod:

```env
SUMOPOD_PAY_BASE_URL=https://api-pay-sandbox.sumopod.com/api/v1
SUMOPOD_PAY_API_KEY=your-sandbox-api-key
SUMOPOD_WEBHOOK_SECRET=whsec_your-signing-secret
SUMOPOD_SANDBOX_SIMULATION_ENABLED=false
```

`SUMOPOD_WEBHOOK_SECRET` adalah Webhook Signing Secret, bukan Webhook Token.

## Webhook URL

Production:

```text
https://kataloghub.vercel.app/api/payments/sumopod/webhook
```

Local dengan tunnel:

```bash
ngrok http 3000
```

```text
https://your-tunnel.ngrok.app/api/payments/sumopod/webhook
```

Masukkan URL tersebut pada Settings > Webhook Sumopod, simpan, lalu salin signing secret ke environment yang sama dengan server yang menerima webhook.

## Test Flow

1. Buat atau gunakan akun yang sudah verified.
2. Buka `/admin/subscription`.
3. Pilih paket Starter atau Pro.
4. Klik `Bayar Instan QRIS`.
5. Pastikan record `subscription_payments` dibuat dengan status `pending`.
6. Buka checkout sandbox Sumopod.
7. Selesaikan pembayaran menggunakan skenario sandbox Sumopod.
8. Pastikan webhook menerima response HTTP `200`.
9. Pastikan status payment menjadi `completed`.
10. Pastikan subscription user menjadi `active`.
11. Kirim webhook completed yang sama dua kali dan pastikan tidak membuat aktivasi ganda.
12. Jalankan `Cek Status Live API` jika webhook belum masuk.

## Negative Tests

- Signature tidak valid harus menghasilkan `401`.
- Payload JSON rusak harus menghasilkan `400`.
- `order_id` tidak dikenal harus menghasilkan `404`.
- Nominal berbeda dari database harus menghasilkan `400`.
- Currency selain `IDR` harus menghasilkan `400`.
- Event gagal setelah payment completed harus diabaikan.

## Production Switch

Jangan mengubah ke production sebelum sandbox flow berhasil. Saat siap production, ganti secara bersamaan:

- `SUMOPOD_PAY_BASE_URL` ke base URL production.
- `SUMOPOD_PAY_API_KEY` ke production key.
- `SUMOPOD_WEBHOOK_SECRET` ke signing secret production.
- Webhook URL tetap menggunakan domain production.
- Pastikan `SUMOPOD_SANDBOX_SIMULATION_ENABLED=false`.
