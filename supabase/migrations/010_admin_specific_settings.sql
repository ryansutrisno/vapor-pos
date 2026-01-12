-- Migration: Add admin-specific settings for store branding, business operations, receipt settings, and notifications
-- Created: 2024-01-20
-- Note: These settings will be tenant-specific (tenant_id will be set when created by admin users)

-- Store Branding Settings (tenant-specific, tenant_id will be NULL for now and set by application logic)
INSERT INTO settings (key, value, data_type, category, description, tenant_id) VALUES
('store_name', 'Vapor Store', 'string', 'store_branding', 'Nama toko yang akan ditampilkan di receipt', NULL),
('store_address', 'Jl. Contoh No. 123, Jakarta', 'string', 'store_branding', 'Alamat lengkap toko untuk receipt', NULL),
('store_phone', '+62 21 1234 5678', 'string', 'store_branding', 'Nomor telepon toko', NULL),
('store_email', 'info@vaporstore.com', 'string', 'store_branding', 'Email toko untuk kontak customer', NULL),
('store_logo_url', '', 'string', 'store_branding', 'URL logo toko untuk receipt header', NULL),
('receipt_footer_text', 'Terima kasih atas kunjungan Anda!', 'string', 'store_branding', 'Teks footer yang ditampilkan di receipt', NULL),
('receipt_thank_you_message', 'Selamat menikmati produk vapor Anda!', 'string', 'store_branding', 'Pesan terima kasih khusus di receipt', NULL);

-- Business Operations Settings
INSERT INTO settings (key, value, data_type, category, description, tenant_id) VALUES
('default_tax_rate', '11', 'number', 'business_operations', 'Tarif pajak default dalam persen (PPN 11%)', NULL),
('currency_symbol', 'Rp', 'string', 'business_operations', 'Simbol mata uang yang digunakan', NULL),
('receipt_print_copies', '1', 'number', 'business_operations', 'Jumlah copy receipt yang dicetak otomatis', NULL),
('auto_print_receipt', 'true', 'boolean', 'business_operations', 'Otomatis cetak receipt setelah transaksi selesai', NULL),
('loyalty_program_enabled', 'false', 'boolean', 'business_operations', 'Aktifkan program loyalty untuk customer', NULL),
('minimum_stock_alert', '10', 'number', 'business_operations', 'Minimum stok untuk memicu alert', NULL);

-- Receipt Settings
INSERT INTO settings (key, value, data_type, category, description, tenant_id) VALUES
('receipt_width', '80mm', 'string', 'receipt_settings', 'Lebar kertas receipt (58mm atau 80mm)', NULL),
('show_barcode_on_receipt', 'true', 'boolean', 'receipt_settings', 'Tampilkan barcode produk di receipt', NULL),
('receipt_language', 'ID', 'string', 'receipt_settings', 'Bahasa receipt (ID untuk Indonesia, EN untuk English)', NULL),
('include_customer_info', 'true', 'boolean', 'receipt_settings', 'Sertakan informasi customer di receipt', NULL),
('receipt_qr_code_enabled', 'false', 'boolean', 'receipt_settings', 'Tampilkan QR code untuk feedback/review di receipt', NULL);

-- Notification Settings
INSERT INTO settings (key, value, data_type, category, description, tenant_id) VALUES
('low_stock_notifications', 'true', 'boolean', 'notification_settings', 'Kirim notifikasi saat stok produk menipis', NULL),
('daily_sales_report', 'true', 'boolean', 'notification_settings', 'Kirim laporan penjualan harian via email', NULL),
('email_notifications_enabled', 'true', 'boolean', 'notification_settings', 'Aktifkan semua notifikasi via email', NULL),
('sms_notifications_enabled', 'false', 'boolean', 'notification_settings', 'Aktifkan notifikasi via SMS', NULL);

-- Grant permissions for the new settings
GRANT SELECT, INSERT, UPDATE ON settings TO authenticated;
GRANT SELECT ON settings TO anon;