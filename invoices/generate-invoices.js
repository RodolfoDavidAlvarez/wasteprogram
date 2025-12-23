// Generate professional invoices for Vanguard and Jack/3LAG
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://govktyrtmwzbzqkmzmrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI'
);

const VANGUARD_RATE = 45;
const OUTBOUND_RATE = 20;

// Generate invoice number (INV-YYYYMMDD-XXX)
function generateInvoiceNumber(prefix) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${dateStr}-001`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

async function generateVanguardInvoice(records) {
  const invoiceNumber = generateInvoiceNumber('INV-VNG');
  const totalTons = records.reduce((s, r) => s + r.tonnage, 0);
  const totalAmount = totalTons * VANGUARD_RATE;

  const lineItems = records
    .sort((a, b) => (a.loadNumber || 0) - (b.loadNumber || 0))
    .map((r, i) => `
      <tr>
        <td class="desc">${i + 1}. Load #${r.loadNumber || '—'} - VR ${r.vrNumber}</td>
        <td class="date">${formatDateShort(r.scheduledDate)}</td>
        <td class="qty">${r.tonnage.toFixed(2)}</td>
        <td class="rate">$${VANGUARD_RATE.toFixed(2)}</td>
        <td class="amount">$${(r.tonnage * VANGUARD_RATE).toFixed(2)}</td>
      </tr>
    `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page { size: letter; margin: 0.5in; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 11px;
      color: #1f2937;
      line-height: 1.5;
      background: white;
    }

    .container { max-width: 7.5in; margin: 0 auto; padding: 20px; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: #059669;
    }

    .company-tagline {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      text-align: right;
    }

    .invoice-number {
      font-size: 14px;
      color: #6b7280;
      text-align: right;
      margin-top: 4px;
    }

    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .address-block { width: 45%; }

    .address-label {
      font-size: 10px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .address-content {
      font-size: 12px;
      line-height: 1.6;
    }

    .address-name {
      font-weight: 600;
      font-size: 14px;
    }

    .invoice-details {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
      background: #f9fafb;
      padding: 16px 20px;
      border-radius: 8px;
    }

    .detail-item {
      flex: 1;
    }

    .detail-label {
      font-size: 10px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 13px;
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    thead {
      background: #059669;
      color: white;
    }

    th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th.qty, th.rate, th.amount { text-align: right; }
    th.date { text-align: center; }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    td.desc { font-weight: 500; }
    td.date { text-align: center; color: #6b7280; }
    td.qty, td.rate, td.amount { text-align: right; font-family: 'SF Mono', monospace; }
    td.amount { font-weight: 600; }

    .totals {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .totals-table {
      width: 280px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .totals-row.total {
      background: #059669;
      color: white;
      font-weight: 700;
      font-size: 14px;
      border-radius: 4px;
      border: none;
    }

    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .notes-title {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .notes-content {
      color: #6b7280;
      font-size: 11px;
      line-height: 1.6;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="company-name">Soil Seed & Water</div>
        <div class="company-tagline">Waste Diversion Program</div>
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoiceNumber}</div>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <div class="address-label">From</div>
        <div class="address-content">
          <div class="address-name">Soil Seed & Water</div>
          18980 Stanton Rd<br>
          Congress, AZ 85332<br>
          ralvarez@soilseedandwater.com
        </div>
      </div>
      <div class="address-block">
        <div class="address-label">Bill To</div>
        <div class="address-content">
          <div class="address-name">Vanguard Renewables</div>
          Attn: Casey Tucker<br>
          casey@vanguardrenewables.com
        </div>
      </div>
    </div>

    <div class="invoice-details">
      <div class="detail-item">
        <div class="detail-label">Invoice Date</div>
        <div class="detail-value">${formatDate(new Date())}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Due Date</div>
        <div class="detail-value">Net 30</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Service Period</div>
        <div class="detail-value">December 2025</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="desc">Description</th>
          <th class="date">Date</th>
          <th class="qty">Tons</th>
          <th class="rate">Rate</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-table">
        <div class="totals-row">
          <span>Total Loads</span>
          <span>${records.length}</span>
        </div>
        <div class="totals-row">
          <span>Total Tonnage</span>
          <span>${totalTons.toFixed(2)} tons</span>
        </div>
        <div class="totals-row">
          <span>Rate per Ton</span>
          <span>$${VANGUARD_RATE.toFixed(2)}</span>
        </div>
        <div class="totals-row total">
          <span>Amount Due</span>
          <span>$${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="notes">
      <div class="notes-title">Notes</div>
      <div class="notes-content">
        Waste diversion services for contaminated dog food product disposal.<br>
        Material processed at Congress, AZ facility for organic composting.<br><br>
        Payment Terms: Net 30 days<br>
        Please remit payment to: Soil Seed & Water
      </div>
    </div>

    <div class="footer">
      Soil Seed & Water &bull; soilseedandwater.com &bull; Thank you for your business!
    </div>
  </div>
</body>
</html>`;

  return { html, invoiceNumber, totalAmount };
}

async function generate3LAGInvoice(records) {
  const invoiceNumber = generateInvoiceNumber('INV-3LAG');
  const totalTons = records.reduce((s, r) => s + r.tonnage, 0);
  const totalAmount = totalTons * OUTBOUND_RATE;

  const lineItems = records.map((r, i) => `
      <tr>
        <td class="desc">${i + 1}. ${r.vrNumber}</td>
        <td class="date">${formatDateShort(r.scheduledDate)}</td>
        <td class="qty">${r.tonnage.toFixed(2)}</td>
        <td class="rate">$${OUTBOUND_RATE.toFixed(2)}</td>
        <td class="amount">$${(r.tonnage * OUTBOUND_RATE).toFixed(2)}</td>
      </tr>
    `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page { size: letter; margin: 0.5in; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 11px;
      color: #1f2937;
      line-height: 1.5;
      background: white;
    }

    .container { max-width: 7.5in; margin: 0 auto; padding: 20px; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: #2563eb;
    }

    .company-tagline {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      text-align: right;
    }

    .invoice-number {
      font-size: 14px;
      color: #6b7280;
      text-align: right;
      margin-top: 4px;
    }

    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .address-block { width: 45%; }

    .address-label {
      font-size: 10px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .address-content {
      font-size: 12px;
      line-height: 1.6;
    }

    .address-name {
      font-weight: 600;
      font-size: 14px;
    }

    .invoice-details {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
      background: #f9fafb;
      padding: 16px 20px;
      border-radius: 8px;
    }

    .detail-item { flex: 1; }

    .detail-label {
      font-size: 10px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .detail-value { font-size: 13px; font-weight: 600; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }

    thead { background: #2563eb; color: white; }

    th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th.qty, th.rate, th.amount { text-align: right; }
    th.date { text-align: center; }

    td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
    td.desc { font-weight: 500; }
    td.date { text-align: center; color: #6b7280; }
    td.qty, td.rate, td.amount { text-align: right; font-family: 'SF Mono', monospace; }
    td.amount { font-weight: 600; }

    .totals { display: flex; justify-content: flex-end; margin-top: 20px; }

    .totals-table { width: 280px; }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .totals-row.total {
      background: #2563eb;
      color: white;
      font-weight: 700;
      font-size: 14px;
      border-radius: 4px;
      border: none;
    }

    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .notes-title { font-weight: 600; margin-bottom: 8px; }
    .notes-content { color: #6b7280; font-size: 11px; line-height: 1.6; }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="company-name">Soil Seed & Water</div>
        <div class="company-tagline">Waste Diversion Program</div>
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoiceNumber}</div>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <div class="address-label">From</div>
        <div class="address-content">
          <div class="address-name">Soil Seed & Water</div>
          18980 Stanton Rd<br>
          Congress, AZ 85332<br>
          ralvarez@soilseedandwater.com
        </div>
      </div>
      <div class="address-block">
        <div class="address-label">Bill To</div>
        <div class="address-content">
          <div class="address-name">3LAG / Jack Mendoza</div>
          Robinson Calf Ranch<br>
          1001 East Hosking Avenue<br>
          Bakersfield, CA 93307
        </div>
      </div>
    </div>

    <div class="invoice-details">
      <div class="detail-item">
        <div class="detail-label">Invoice Date</div>
        <div class="detail-value">${formatDate(new Date())}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Due Date</div>
        <div class="detail-value">Net 30</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Service Period</div>
        <div class="detail-value">December 2025</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="desc">Description</th>
          <th class="date">Date</th>
          <th class="qty">Tons</th>
          <th class="rate">Rate</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-table">
        <div class="totals-row">
          <span>Total Loads</span>
          <span>${records.length}</span>
        </div>
        <div class="totals-row">
          <span>Total Tonnage</span>
          <span>${totalTons.toFixed(2)} tons</span>
        </div>
        <div class="totals-row">
          <span>Rate per Ton</span>
          <span>$${OUTBOUND_RATE.toFixed(2)}</span>
        </div>
        <div class="totals-row total">
          <span>Amount Due</span>
          <span>$${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="notes">
      <div class="notes-title">Notes</div>
      <div class="notes-content">
        Outbound waste material delivery to Robinson Calf Ranch for livestock feed use.<br>
        Origin: Congress, AZ &bull; Destination: Bakersfield, CA<br><br>
        Payment Terms: Net 30 days<br>
        Please remit payment to: Soil Seed & Water
      </div>
    </div>

    <div class="footer">
      Soil Seed & Water &bull; soilseedandwater.com &bull; Thank you for your business!
    </div>
  </div>
</body>
</html>`;

  return { html, invoiceNumber, totalAmount };
}

async function generatePDF(html, filename) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 816, height: 1056 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  const pdfPath = path.join(__dirname, filename);
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true
  });

  await browser.close();
  return pdfPath;
}

async function main() {
  console.log('📄 Generating invoices...\n');

  // Fetch delivery records
  const { data, error } = await supabase
    .from('wd_delivery_records')
    .select('vrNumber, loadNumber, scheduledDate, tonnage, status')
    .order('scheduledDate', { ascending: true })
    .order('loadNumber', { ascending: true });

  if (error) {
    console.error('Error fetching records:', error);
    return;
  }

  const vanguardRecords = data.filter(r => !r.vrNumber.startsWith('BOL-'));
  const outboundRecords = data.filter(r => r.vrNumber.startsWith('BOL-'));

  // Generate Vanguard Invoice
  console.log('Generating Vanguard invoice...');
  const vanguard = await generateVanguardInvoice(vanguardRecords);

  // Save HTML for reference
  fs.writeFileSync(path.join(__dirname, 'invoice-vanguard.html'), vanguard.html);

  // Generate PDF
  const vanguardPdf = await generatePDF(vanguard.html, `Invoice-Vanguard-${vanguard.invoiceNumber}.pdf`);
  console.log(`✅ Created: ${path.basename(vanguardPdf)}`);
  console.log(`   ${vanguardRecords.length} loads | ${vanguardRecords.reduce((s,r) => s+r.tonnage, 0).toFixed(2)} tons | $${vanguard.totalAmount.toFixed(2)}\n`);

  // Generate 3LAG Invoice
  console.log('Generating 3LAG invoice...');
  const threelag = await generate3LAGInvoice(outboundRecords);

  // Save HTML for reference
  fs.writeFileSync(path.join(__dirname, 'invoice-3lag.html'), threelag.html);

  // Generate PDF
  const threelagPdf = await generatePDF(threelag.html, `Invoice-3LAG-${threelag.invoiceNumber}.pdf`);
  console.log(`✅ Created: ${path.basename(threelagPdf)}`);
  console.log(`   ${outboundRecords.length} loads | ${outboundRecords.reduce((s,r) => s+r.tonnage, 0).toFixed(2)} tons | $${threelag.totalAmount.toFixed(2)}\n`);

  console.log('=' .repeat(60));
  console.log('INVOICE SUMMARY:');
  console.log(`  Vanguard: $${vanguard.totalAmount.toFixed(2)}`);
  console.log(`  3LAG:     $${threelag.totalAmount.toFixed(2)}`);
  console.log(`  TOTAL:    $${(vanguard.totalAmount + threelag.totalAmount).toFixed(2)}`);
}

main().catch(console.error);
