/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WhatsApp Service using Fonnte API
 * Documentation: https://docs.fonnte.com/api-send-message/
 */

export interface WhatsAppMessage {
  target: string; // Phone number (e.g., '628123456789')
  message: string; // Message content (max 60,000 characters)
  countryCode?: string; // Country code (default: '62' for Indonesia)
  delay?: string; // Delay in seconds (e.g., '1-5' for random delay)
  typing?: boolean; // Show typing indicator
}

export interface WhatsAppResponse {
  status: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface WhatsAppConfig {
  apiToken: string;
  adminNumber: string;
  countryCode: string;
  testMode: boolean;
}

/**
 * Send WhatsApp message using Fonnte API
 * @param messageData - Message configuration
 * @param apiToken - Fonnte API token
 * @returns Promise with API response
 */
export async function sendWhatsAppMessage(
  messageData: WhatsAppMessage,
  apiToken: string
): Promise<WhatsAppResponse> {
  try {
    if (!apiToken || apiToken.trim() === '') {
      throw new Error('API token is required');
    }

    if (!messageData.target || messageData.target.trim() === '') {
      throw new Error('Target phone number is required');
    }

    if (!messageData.message || messageData.message.trim() === '') {
      throw new Error('Message content is required');
    }

    // Prepare form data for Fonnte API
    const formData = new FormData();
    formData.append('target', messageData.target);
    formData.append('message', messageData.message);
    formData.append('countryCode', messageData.countryCode || '62');
    
    if (messageData.delay) {
      formData.append('delay', messageData.delay);
    }
    
    if (messageData.typing !== undefined) {
      formData.append('typing', messageData.typing.toString());
    }

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return {
      status: true,
      message: 'WhatsApp message sent successfully',
      data: result,
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send test WhatsApp message to verify connection
 * @param config - WhatsApp configuration
 * @returns Promise with test result
 */
export async function testWhatsAppConnection(
  config: WhatsAppConfig
): Promise<WhatsAppResponse> {
  const testMessage: WhatsAppMessage = {
    target: config.adminNumber,
    message: `🧪 Test WhatsApp dari Vapor POS\n\nWaktu: ${new Date().toLocaleString('id-ID')}\n\nJika Anda menerima pesan ini, integrasi WhatsApp berhasil!`,
    countryCode: config.countryCode,
    typing: true,
  };

  if (config.testMode) {
    // In test mode, don't actually send the message
    return {
      status: true,
      message: 'Test mode: Message would be sent successfully',
      data: { test_mode: true },
    };
  }

  return sendWhatsAppMessage(testMessage, config.apiToken);
}

/**
 * Send low stock alert via WhatsApp
 * @param config - WhatsApp configuration
 * @param productName - Name of the product
 * @param currentStock - Current stock level
 * @param minStock - Minimum stock threshold
 * @returns Promise with send result
 */
export async function sendLowStockAlert(
  config: WhatsAppConfig,
  productName: string,
  currentStock: number,
  minStock: number
): Promise<WhatsAppResponse> {
  const message = `🚨 *PERINGATAN STOK MENIPIS*\n\n` +
    `Produk: ${productName}\n` +
    `Stok Saat Ini: ${currentStock}\n` +
    `Minimum Stok: ${minStock}\n\n` +
    `Segera lakukan restocking untuk menghindari kehabisan stok.\n\n` +
    `_Pesan otomatis dari Vapor POS_`;

  const messageData: WhatsAppMessage = {
    target: config.adminNumber,
    message,
    countryCode: config.countryCode,
    typing: true,
  };

  if (config.testMode) {
    console.log('Test mode - Low stock alert:', message);
    return { status: true, message: 'Test mode: Low stock alert logged' };
  }

  return sendWhatsAppMessage(messageData, config.apiToken);
}

/**
 * Send daily sales report via WhatsApp
 * @param config - WhatsApp configuration
 * @param reportData - Sales report data
 * @returns Promise with send result
 */
export async function sendDailySalesReport(
  config: WhatsAppConfig,
  reportData: {
    date: string;
    totalSales: number;
    totalTransactions: number;
    topProduct: string;
    revenue: number;
  }
): Promise<WhatsAppResponse> {
  const message = `📊 *LAPORAN PENJUALAN HARIAN*\n\n` +
    `Tanggal: ${reportData.date}\n` +
    `Total Transaksi: ${reportData.totalTransactions}\n` +
    `Total Penjualan: ${reportData.totalSales} item\n` +
    `Produk Terlaris: ${reportData.topProduct}\n` +
    `Revenue: Rp ${reportData.revenue.toLocaleString('id-ID')}\n\n` +
    `_Laporan otomatis dari Vapor POS_`;

  const messageData: WhatsAppMessage = {
    target: config.adminNumber,
    message,
    countryCode: config.countryCode,
    typing: true,
  };

  if (config.testMode) {
    console.log('Test mode - Daily sales report:', message);
    return { status: true, message: 'Test mode: Daily sales report logged' };
  }

  return sendWhatsAppMessage(messageData, config.apiToken);
}

/**
 * Validate WhatsApp phone number format
 * @param phoneNumber - Phone number to validate
 * @param countryCode - Country code
 * @returns boolean indicating if number is valid
 */
export function validateWhatsAppNumber(
  phoneNumber: string,
  countryCode: string = '62'
): boolean {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false;
  }

  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Check if number starts with country code
  if (cleanNumber.startsWith(countryCode)) {
    // For Indonesia (62), number should be 10-13 digits after country code
    if (countryCode === '62') {
      return cleanNumber.length >= 12 && cleanNumber.length <= 15;
    }
    // For other countries, basic length check
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }

  // If doesn't start with country code, check if it's a valid local number
  if (countryCode === '62') {
    // Indonesian local number should start with 8 and be 9-12 digits
    return cleanNumber.startsWith('8') && cleanNumber.length >= 9 && cleanNumber.length <= 12;
  }

  return false;
}

/**
 * Format phone number for WhatsApp
 * @param phoneNumber - Raw phone number
 * @param countryCode - Country code
 * @returns Formatted phone number
 */
export function formatWhatsAppNumber(
  phoneNumber: string,
  countryCode: string = '62'
): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // If already starts with country code, return as is
  if (cleanNumber.startsWith(countryCode)) {
    return cleanNumber;
  }

  // If starts with 0, replace with country code
  if (cleanNumber.startsWith('0')) {
    return countryCode + cleanNumber.substring(1);
  }

  // If starts with 8 (for Indonesia), add country code
  if (countryCode === '62' && cleanNumber.startsWith('8')) {
    return countryCode + cleanNumber;
  }

  // Otherwise, just add country code
  return countryCode + cleanNumber;
}