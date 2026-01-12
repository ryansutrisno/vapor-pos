# Vapor POS

Aplikasi Point of Sales (POS) modern yang dibangun menggunakan teknologi web terkini untuk memberikan pengalaman pengguna yang cepat, responsif, dan estetis.

## 📋 Requirement (Prasyarat)

Pastikan sistem Anda memenuhi persyaratan berikut sebelum memulai:

- **Node.js**: Versi v20 atau v22 (disarankan LTS terbaru).
- **Package Manager**: PNPM (disarankan) atau NPM.
- **Docker & Docker Compose**: Diperlukan untuk menjalankan database PostgreSQL dan layanan Supabase lokal.
- **Git**: Untuk manajemen versi source code.
- **pnpm**: Package manager yang digunakan (install via `npm i -g pnpm`)

## 🛠️ Instalasi Lokal

Ikuti langkah-langkah berikut untuk menginstal aplikasi di komputer lokal Anda:

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/vapor-pos.git
cd vapor-pos
```

### 2. Install Dependencies

Gunakan PNPM untuk mengunduh semua library yang dibutuhkan:

```bash
pnpm install
```

### 3. Konfigurasi Environment Variable

Salin file contoh konfigurasi `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan nilai variabel berikut:

```env
# Supabase Configuration (Development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (for Supabase Docker)
POSTGRES_PASSWORD=postgres
JWT_SECRET=your-jwt-secret
```

### 4. Setup Database dengan Docker

Jalankan container Supabase lokal:

```bash
docker compose up -d
```

Tunggu hingga semua container berjalan (biasanya 30-60 detik). Container yang berjalan:
- **PostgreSQL**: `localhost:5432`
- **Supabase Studio**: `http://localhost:54323`
- **Kong API Gateway**: `http://localhost:8000`

### 5. Setup Database Schema

1. Buka **Supabase Studio** di `http://localhost:54323`
2. Login dengan email: `admin@supabase.io`, password: `postgres`
3. Buat Organization baru (jika diperlukan)
4. Buka menu **SQL Editor**
5. Eksekusi file migration secara berurutan:
   - `supabase/migrations/20260110_add_customer_receipt_features.sql`
6. Eksekusi seed data:
   - `docker/supabase/init-data.sql`

### 6. Jalankan Aplikasi

```bash
pnpm dev
```

Aplikasi akan berjalan di:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

## 🔧 Konfigurasi Lokal

### Struktur Environment Variables

```env
# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
PORT=3001

# ===========================================
# SUPABASE (Local Development)
# ===========================================
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# MIDTRANS (Payment Gateway - Test Mode)
# ===========================================
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_IS_PRODUCTION=false

# ===========================================
# EMAIL (SendGrid)
# ===========================================
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@vaporpos.com

# ===========================================
# WHATSAPP (Fonnte API)
# ===========================================
FONNTE_API_TOKEN=your-fonnte-token
```

### Fitur Print & WhatsApp

Untuk mengaktifkan fitur Print Struk dan WhatsApp:

1. Buka **Settings** → **WhatsApp Integration**
2. Masukkan **Fonnte API Token** (dapatkan dari [fonnte.com](https://fonnte.com))
3. Aktifkan toggle "Gunakan Fonnte"
4. Konfigurasi ukuran kertas (58mm/80mm) sesuai printer thermal Anda

## 🚀 Running Local Development

### Perintah Utama

```bash
# Jalankan aplikasi dengan hot reload
pnpm dev

# Jalankan dengan mock database (tanpa Docker)
pnpm dev:mock
```

### Perintah Pendukung

```bash
# Lint kode
pnpm lint

# Check TypeScript
pnpm check

# Jalankan tests
pnpm test

# Build untuk production
pnpm build
```

### Akses Layanan Lokal

| Service | URL | Keterangan |
|---------|-----|------------|
| App Frontend | http://localhost:5173 | Aplikasi Vapor POS |
| API Server | http://localhost:3001 | Backend Express.js |
| Supabase Studio | http://localhost:54323 | Database management |
| PostgreSQL | localhost:5432 | Database connection |
| Kong Dashboard | http://localhost:8001 | API Gateway |

## 📁 Struktur Proyek

```
vapor-pos/
├── api/                    # Backend (Express.js)
│   ├── routes/            # API endpoints
│   ├── lib/               # Utilities & configs
│   ├── services/          # Business logic
│   └── *.test.ts          # API tests
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── stores/            # State management (Zustand)
│   ├── utils/             # Utility functions
│   └── *.test.tsx         # Component tests
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── config/            # Supabase configs
├── docker/
│   └── supabase/          # Docker setup
├── coverage/              # Test coverage reports
├── dist/                  # Production build
└── *.config.*             # Configuration files
```

## 🧪 Testing

### Menjalankan Tests

```bash
# Semua tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# E2E tests dengan Playwright
pnpm test:e2e
```

### Struktur Testing

- **Unit Tests**: `*.test.ts` / `*.test.tsx` - Testing fungsi/unit komponen
- **API Tests**: `api/routes/*.test.ts` - Testing endpoint API
- **E2E Tests**: `e2e/*.spec.ts` - Testing alur lengkap pengguna

## 🏭 Production Deployment

### Persiapan Production

#### 1. Environment Variables Production

Buat file `.env.production` dengan konfigurasi production:

```env
NODE_ENV=production
PORT=3001

# Production Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key

# Production Midtrans
MIDTRANS_SERVER_KEY=your-prod-midtrans-key
MIDTRANS_IS_PRODUCTION=true

# Production Email
SENDGRID_API_KEY=SG.your-prod-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com

# Production WhatsApp
FONNTE_API_TOKEN=your-fonnte-token
```

#### 2. Build Aplikasi

```bash
pnpm build
```

Hasil build akan tersimpan di folder `dist/`:
- `dist/index.html` - Entry point
- `dist/assets/*.js` - JavaScript bundles
- `dist/assets/*.css` - Stylesheets

#### 3. Database Migration Production

Jalankan migration di Supabase Cloud SQL Editor:

```bash
# Apply migrations
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/migrations/*.sql
```

### Opsi Deployment

#### A. Deploy ke Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Hubungkan repository ke Vercel
2. Set root directory: `/`
3. Build command: `pnpm build`
4. Output directory: `dist`
5. Environment variables: Masukkan semua `VITE_*` variables

**Backend (Railway):**
1. Buat project baru di Railway
2. Connect GitHub repository
3. Set root directory: `/`
4. Build command: `pnpm install && pnpm build`
5. Start command: `node api/index.js`
6. Environment variables: Masukkan semua variables kecuali `VITE_*`

#### B. Deploy ke VPS (Single Server)

```bash
# 1. Clone repository
git clone your-repo
cd vapor-pos

# 2. Install dependencies
pnpm install --production=false

# 3. Build
pnpm build

# 4. Setup PM2 untuk process manager
pm2 start api/index.js --name vapor-pos-api

# 5. Setup Nginx
sudo nano /etc/nginx/sites-available/vapor-pos
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/vapor-pos/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 6. Enable site dan restart Nginx
sudo ln -s /etc/nginx/sites-available/vapor-pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Setup SSL dengan Certbot
sudo certbot --nginx -d your-domain.com
```

### Database Production

Gunakan **Supabase Cloud** untuk production:

1. Buat project di [supabase.com](https://supabase.com)
2. Apply migrations melalui SQL Editor
3. Update environment variables dengan production credentials
4. Enable Row Level Security (RLS) policies

## 📋 Checklist Production

- [ ] Environment variables production sudah dikonfigurasi
- [ ] Database migration sudah diapply
- [ ] Build sukses (`pnpm build`)
- [ ] SSL certificate terinstall (HTTPS)
- [ ] Monitoring/Logging aktif
- [ ] Backup database terconfigure
- [ ] Rate limiting aktif
- [ ] CORS dikonfigurasi untuk domain production

## 🆘 Troubleshooting

### Docker tidak berjalan

```bash
# Check Docker status
docker ps

# Restart Docker
sudo systemctl restart docker

# Check container logs
docker compose logs
```

### Database connection error

```bash
# Check PostgreSQL port
nc -zv localhost 5432

# Reset database
docker compose down -v
docker compose up -d
```

### Build error

```bash
# Clear cache dan rebuild
rm -rf node_modules .pnpm-store dist
pnpm install
pnpm build
```

### API tidak响应

```bash
# Check API logs
docker compose logs api

# Restart services
docker compose restart
```

---

**Catatan**: Pastikan seluruh environment variable untuk production sudah dikonfigurasi di platform hosting Anda. Jangan commit file `.env` ke repository.
