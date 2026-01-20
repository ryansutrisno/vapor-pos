import PDFDocument from 'pdfkit';
import { supabase } from './supabase';

interface InvoiceData {
  invoiceNumber: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  planType: string;
  billingCycle: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: string;
  amountInWords?: string;
  dueDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  adminNotes?: string;
}

export interface InvoiceDBData {
  id: string;
  invoice_number: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_idr: number;
  plan_name: string;
  plan_type: string;
  billing_cycle: string;
  period_start: string;
  period_end: string;
  next_billing_date: string;
  payment_method: string;
  payment_reference: string;
  paid_at: string;
  status: string;
  due_date: string;
  admin_notes: string;
  created_at: string;
  sent_at: string;
  user: {
    name: string;
    email: string;
  };
  tenant?: {
    company_name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      user:users(name, email),
      tenant:tenants(company_name, address, phone, email)
    `)
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return generateInvoicePDFContent(invoice);
}

export async function generateInvoicePDFByNumber(invoiceNumber: string): Promise<Buffer> {
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      user:users(name, email),
      tenant:tenants(company_name, address, phone, email)
    `)
    .eq('invoice_number', invoiceNumber)
    .single();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return generateInvoicePDFContent(invoice);
}

function generateInvoicePDFContent(invoice: InvoiceDBData): Buffer {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Invoice ${invoice.invoice_number}`,
      Author: 'VaporPOS',
      Subject: `Invoice for ${invoice.user.name}`,
    }
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const companyName = invoice.tenant?.company_name || 'VaporPOS';
  const companyAddress = invoice.tenant?.address || 'Jakarta, Indonesia';
  const companyEmail = invoice.tenant?.email || 'support@vaporpos.com';
  const companyPhone = invoice.tenant?.phone || '+62 21 1234 5678';

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const primaryColor = '#1e40af';
  const secondaryColor = '#64748b';
  const borderColor = '#e2e8f0';

  // Header Background
  doc.rect(0, 0, 595.28, 120).fill(primaryColor);

  // Header Content
  doc.fill('#ffffff');
  doc.fontSize(28).font('Helvetica-Bold').text('INVOICE', 50, 40);
  doc.fontSize(12).font('Helvetica').text(companyName, 50, 75);
  doc.fontSize(10).fill(secondaryColor).text(companyAddress, 50, 92);
  doc.text(`${companyEmail} | ${companyPhone}`, 50, 107);
  doc.fill('#000000');

  // Invoice Details - Right Side
  doc.fontSize(10).fill('#000000');
  doc.text(`Invoice #: ${invoice.invoice_number}`, 400, 40, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.created_at)}`, 400, 55, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.due_date)}`, 400, 70, { align: 'right' });
  
  const statusColors: Record<string, string> = {
    draft: '#6b7280',
    sent: '#3b82f6',
    paid: '#10b981',
    overdue: '#ef4444',
    cancelled: '#6b7280',
    refunded: '#f59e0b'
  };
  const statusColor = statusColors[invoice.status] || '#6b7280';
  doc.fill(statusColor).text(`Status: ${invoice.status.toUpperCase()}`, 400, 85, { align: 'right' });
  doc.fill('#000000');

  // Bill To Section
  const billToY = 150;
  doc.fontSize(10).fill(secondaryColor).text('BILL TO', 50, billToY);
  doc.fill('#000000').fontSize(12).font('Helvetica-Bold').text(invoice.user.name, 50, billToY + 15);
  doc.font('Helvetica').fontSize(10).fill('#000000').text(invoice.user.email, 50, billToY + 32);

  // Subscription Details Section
  const subDetailsY = billToY + 60;
  doc.fontSize(10).fill(secondaryColor).text('SUBSCRIPTION DETAILS', 50, subDetailsY);
  
  doc.fill('#000000').fontSize(10);
  const details = [
    ['Plan', invoice.plan_name],
    ['Billing Cycle', invoice.billing_cycle.charAt(0).toUpperCase() + invoice.billing_cycle.slice(1)],
    ['Period', `${formatDateShort(invoice.period_start)} - ${formatDateShort(invoice.period_end)}`],
    ['Next Billing', formatDate(invoice.next_billing_date)],
  ];

  details.forEach(([label, value], index) => {
    const rowY = subDetailsY + 20 + (index * 18);
    doc.fill(secondaryColor).text(label, 50, rowY);
    doc.fill('#000000').text(value, 150, rowY);
  });

  // Divider
  doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 280).lineTo(545.28, 280).stroke();

  // Invoice Table Header
  const tableTop = 300;
  doc.rect(50, tableTop, 495.28, 25).fill('#f8fafc');
  
  doc.fill('#475569').fontSize(9).font('Helvetica-Bold');
  doc.text('DESCRIPTION', 55, tableTop + 8);
  doc.text('QTY', 340, tableTop + 8, { width: 50, align: 'center' });
  doc.text('UNIT PRICE', 400, tableTop + 8, { width: 70, align: 'right' });
  doc.text('AMOUNT', 490, tableTop + 8, { width: 50, align: 'right' });

  // Table Row
  const rowY = tableTop + 35;
  doc.fill('#000000').font('Helvetica').fontSize(10);
  
  const description = `${invoice.plan_name}`;
  const billingText = `${invoice.billing_cycle.charAt(0).toUpperCase() + invoice.billing_cycle.slice(1)} billing period`;
  
  doc.text(description, 55, rowY);
  doc.fill(secondaryColor).fontSize(9).text(billingText, 55, rowY + 14);
  doc.fill('#000000').fontSize(10).text('1', 340, rowY + 5, { width: 50, align: 'center' });
  doc.text(formatCurrency(invoice.amount, invoice.currency), 400, rowY + 5, { width: 70, align: 'right' });
  doc.font('Helvetica-Bold').text(formatCurrency(invoice.amount, invoice.currency), 490, rowY + 5, { width: 50, align: 'right' });
  doc.font('Helvetica');

  // Bottom Line
  doc.strokeColor(borderColor).lineWidth(1).moveTo(50, rowY + 40).lineTo(545.28, rowY + 40).stroke();

  // Totals Section
  const totalsY = rowY + 55;
  
  doc.fontSize(10).fill(secondaryColor).text('Subtotal', 400, totalsY, { width: 70, align: 'right' });
  doc.fill('#000000').font('Helvetica-Bold').fontSize(12).text(formatCurrency(invoice.amount, invoice.currency), 490, totalsY - 2, { width: 50, align: 'right' });
  doc.font('Helvetica');

  // Divider before total
  doc.strokeColor(primaryColor).lineWidth(2).moveTo(400, totalsY + 15).lineTo(545.28, totalsY + 15).stroke();

  // Total
  const totalY = totalsY + 25;
  doc.fontSize(14).font('Helvetica-Bold').fill(primaryColor).text('TOTAL DUE', 400, totalY, { width: 70, align: 'right' });
  doc.fontSize(16).text(formatCurrency(invoice.amount, invoice.currency), 490, totalY - 2, { width: 50, align: 'right' });

  // Payment Information Section
  const paymentInfoY = totalY + 60;
  doc.fill('#475569').fontSize(10).font('Helvetica-Bold').text('PAYMENT INFORMATION', 50, paymentInfoY);
  
  doc.font('Helvetica').fontSize(9).fill('#000000');
  const paymentInfo = [
    [`Payment Method: ${invoice.payment_method || 'Bank Transfer'}`],
    [`Bank: BCA (Bank Central Asia)`],
    [`Account Number: 1234567890`],
    [`Account Name: VaporPOS`],
    [`Reference: ${invoice.invoice_number}`],
  ];

  paymentInfo.forEach(([text], index) => {
    doc.text(text, 50, paymentInfoY + 20 + (index * 16));
  });

  // Notes Section
  if (invoice.admin_notes) {
    const notesY = paymentInfoY + 100;
    doc.fill('#475569').fontSize(10).font('Helvetica-Bold').text('NOTES', 50, notesY);
    doc.font('Helvetica').fontSize(9).fill('#000000').text(invoice.admin_notes, 50, notesY + 18, { width: 300 });
  }

  // Footer
  const footerY = 750;
  
  // Footer Background
  doc.rect(0, footerY - 10, 595.28, 60).fill('#f8fafc');
  
  doc.fill(primaryColor).fontSize(10).font('Helvetica-Bold').text('Thank you for your business!', 50, footerY, { align: 'center', width: 495.28 });
  
  doc.fill(secondaryColor).fontSize(8).font('Helvetica').text(
    'This is an auto-generated invoice. For questions, please contact support@vaporpos.com',
    50,
    footerY + 18,
    { align: 'center', width: 495.28 }
  );
  
  doc.text(
    `© ${new Date().getFullYear()} VaporPOS. All rights reserved.`,
    50,
    footerY + 32,
    { align: 'center', width: 495.28 }
  );

  // Watermark for unpaid invoices
  if (invoice.status === 'overdue') {
    doc.save();
    doc.rotate(45, { origin: [297.64, 420] });
    doc.fillColor('#fee2e2').fontSize(60).font('Helvetica-Bold').text('OVERDUE', 50, 300, { align: 'center', width: 495 });
    doc.restore();
  }

  doc.end();
  return Buffer.concat(chunks);
}

export function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

  if (amount === 0) return 'Zero';

  const parts = amount.toString().split('.');
  let wholeNumber = parseInt(parts[0]);
  const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, '0').substring(0, 2)) : 0;

  let words = '';
  let scaleIndex = 0;

  while (wholeNumber > 0) {
    const chunk = wholeNumber % 1000;
    if (chunk !== 0) {
      let chunkWords = '';
      const hundreds = Math.floor(chunk / 100);
      const remainder = chunk % 100;

      if (hundreds > 0) {
        chunkWords += ones[hundreds] + ' Hundred ';
      }

      if (remainder < 20) {
        chunkWords += ones[remainder];
      } else {
        chunkWords += tens[Math.floor(remainder / 10)];
        if (remainder % 10 > 0) {
          chunkWords += ' ' + ones[remainder % 10];
        }
      }

      words = chunkWords.trim() + ' ' + scales[scaleIndex] + ' ' + words;
    }

    wholeNumber = Math.floor(wholeNumber / 1000);
    scaleIndex++;
  }

  words = words.trim();

  if (decimalPart > 0) {
    words += ' and ' + decimalPart + '/100';
  }

  return words;
}
