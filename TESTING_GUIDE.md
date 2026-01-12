# VaporPOS Testing Guide

Panduan untuk menguji aplikasi VaporPOS dalam mode development dengan fokus pada flow trial registration dan payment sandbox.

## Prerequisites

### 1. Database Setup
✅ Semua migrations sudah dijalankan
✅ Data seeder untuk superadmin dan settings sudah tersedia

### 2. Environment Configuration
✅ Midtrans sandbox mode aktif (`MIDTRANS_IS_PRODUCTION=false`)
✅ SendGrid configuration tersedia (perlu API key untuk testing email)

### 3. Akun Testing
- **Superadmin**: `superadmin@vaporpos.com` / `demo123`
- **Midtrans Sandbox**: Gunakan test credit cards dari dokumentasi Midtrans

## Testing Flow

### 1. Testing Trial Registration Flow

#### Step 1: Akses Halaman Home
1. Buka aplikasi di `http://localhost:5173`
2. Klik tombol "Coba Gratis 14 Hari" di hero section atau CTA section
3. Pastikan diarahkan ke halaman `/register`

#### Step 2: Registrasi Trial User
1. Isi form registrasi dengan data valid:
   - **Nama Lengkap**: Contoh "John Doe"
   - **Email**: Gunakan email valid (untuk testing)
   - **Password**: Minimal 6 karakter
   - **Konfirmasi Password**: Harus sama dengan password
   - **Nama Perusahaan**: Contoh "Vapor Store ABC"
   - **Nomor Telepon**: Contoh "081234567890"
   - **Alamat**: Opsional

2. Klik "Mulai Trial 14 Hari"
3. Pastikan muncul toast success dan diarahkan ke halaman `/verify-email`

#### Step 3: Email Verification
**Note**: Untuk testing tanpa SendGrid API key, email verification akan gagal. Untuk testing lengkap:

1. **Dengan SendGrid API Key**:
   - Tambahkan `SENDGRID_API_KEY` di file `.env`
   - Email verification akan dikirim ke email yang didaftarkan
   - Klik link verifikasi di email
   - Akun akan aktif dan trial 14 hari dimulai

2. **Tanpa SendGrid API Key** (Testing Manual):
   - Akses database dan update user secara manual:
   ```sql
   UPDATE users 
   SET email_verified = true, 
       is_active = true, 
       trial_started_at = NOW(), 
       trial_expires_at = NOW() + INTERVAL '14 days'
   WHERE email = 'email_yang_didaftarkan@example.com';
   ```

### 2. Testing Payment Flow (Sandbox)

#### Step 1: Akses Halaman Order
1. Dari halaman home, klik "Pilih Paket" pada salah satu pricing plan
2. Atau akses langsung `/order`

#### Step 2: Isi Form Order
1. Pilih paket yang diinginkan
2. Pilih billing cycle (monthly/yearly)
3. Isi informasi customer:
   - **Nama Lengkap**: Data valid
   - **Email**: Email valid
   - **Nama Perusahaan**: Nama perusahaan
   - **Nomor Telepon**: Nomor valid
   - **Alamat Lengkap**: Alamat lengkap
   - **Catatan Tambahan**: Opsional

#### Step 3: Proses Pembayaran
1. Klik "Lanjutkan Pembayaran"
2. Midtrans Snap akan terbuka
3. **Testing dengan Sandbox**:
   - **Credit Card**: `4811 1111 1111 1114`
   - **CVV**: `123`
   - **Expiry**: `01/25`
   - **OTP**: `112233`

4. Selesaikan pembayaran
5. Pastikan redirect ke halaman success

### 3. Testing Superadmin Dashboard

#### Step 1: Login Superadmin
1. Akses `/login`
2. Login dengan:
   - **Email**: `superadmin@vaporpos.com`
   - **Password**: `demo123`

#### Step 2: Monitoring Orders
1. Akses menu "Orders" di dashboard
2. Lihat daftar orders yang masuk
3. Test filter berdasarkan status, plan type, tanggal
4. Test update status order manual
5. Test create tenant account untuk order yang paid

#### Step 3: Settings Configuration
1. Akses menu "Settings"
2. **Email Settings**:
   - Tambahkan SendGrid API Key
   - Set from email dan from name
3. **Trial Settings**:
   - Atur trial duration (default 14 hari)
   - Enable/disable trial registration
   - Enable/disable auto suspend

### 4. Testing Auto Suspend (Cron Jobs)

#### Manual Testing Cron Endpoints
1. **Check Trial Expiration**:
   ```bash
   curl http://localhost:3000/api/cron/check-trial-expiration
   ```

2. **Reactivate Paid Users**:
   ```bash
   curl http://localhost:3000/api/cron/reactivate-paid-users
   ```

## Expected Results

### ✅ Successful Trial Registration
- User berhasil mendaftar
- Email verification dikirim (jika SendGrid configured)
- Trial 14 hari dimulai setelah email verified
- User dapat login dan akses dashboard

### ✅ Successful Payment Flow
- Order berhasil dibuat
- Payment gateway terbuka dengan benar
- Payment berhasil diproses
- Order status berubah menjadi "paid"
- Tenant account dibuat otomatis (jika applicable)

### ✅ Successful Auto Suspend
- Trial users yang expired otomatis disuspend
- Email notification dikirim
- Users yang melakukan payment direaktivasi otomatis

## Troubleshooting

### Common Issues

1. **Email Verification Gagal**
   - Pastikan SendGrid API key valid
   - Check logs di terminal untuk error details
   - Untuk testing, bisa manual update database

2. **Payment Gateway Error**
   - Pastikan Midtrans credentials benar
   - Pastikan `MIDTRANS_IS_PRODUCTION=false`
   - Check network connection

3. **Database Connection Error**
   - Pastikan Supabase credentials benar
   - Check migrations sudah dijalankan
   - Verify RLS policies

### Debug Commands

```bash
# Check application logs
npm run dev

# Check database tables
# Akses Supabase dashboard atau gunakan SQL editor

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/register-trial \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","company":"Test Company","phone":"081234567890"}'
```

## Production Checklist

Sebelum deploy ke production:

- [ ] Ganti Midtrans ke production mode
- [ ] Setup SendGrid API key yang valid
- [ ] Setup proper domain untuk email verification links
- [ ] Setup cron jobs untuk auto suspend
- [ ] Test semua flow dengan data real
- [ ] Setup monitoring dan logging
- [ ] Backup database

---

**Note**: Dokumentasi ini untuk testing dalam mode development. Untuk production, pastikan semua konfigurasi sudah sesuai dengan environment production.