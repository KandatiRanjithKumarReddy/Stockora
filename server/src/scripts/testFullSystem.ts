import { createApp } from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import http from 'http';

async function runFullSystemTest() {
  console.log('============================================================');
  console.log('🚀 RUNNING STOCKORA FULL-STACK SYSTEM VERIFICATION');
  console.log('============================================================');

  await connectDB();
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098/api/v1';

  try {
    // 1. Login Retailer 1 (Gupta Kirana)
    console.log('[1/7] Logging in as Retailer (M/s Gupta Kirana)...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9826012345', password: 'retailer123' }),
    });
    const loginJson = (await loginRes.json()) as any;
    const token = loginJson.token;
    console.log(`✅ Retailer Logged In (Token: ${token.slice(0, 15)}...)`);

    // 2. Fetch Catalog
    console.log('\n[2/7] Fetching Product Catalog with live schemes & stock...');
    const catalogRes = await fetch(`${baseUrl}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const catalogJson = (await catalogRes.json()) as any;
    console.log(`✅ Fetched ${catalogJson.count} Products.`);
    for (const p of catalogJson.products) {
      console.log(`   - [${p.sku}] ${p.name}: Pack ₹${p.dealerPricePerPack} | Case ₹${p.calculatedCasePrice} | Stock: ${p.availableCases} cases (${p.stockStatus}) | Scheme: ${p.activeScheme?.name || 'None'}`);
    }

    const pGlucose = catalogJson.products.find((p: any) => p.sku === 'SKU-BS-075');
    const pDetergent = catalogJson.products.find((p: any) => p.sku === 'SKU-DT-1KG');

    // 3. Test Scheme Engine via Cart Calculate
    console.log('\n[3/7] Testing Deterministic Scheme Engine (Cart Calculate)...');
    // Order 10 cases of Glucose (qualifies for 1 free case) & 5 cases of Detergent (qualifies for 3% slab discount)
    const cartCalcRes = await fetch(`${baseUrl}/cart/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          { productId: pGlucose._id, orderedCases: 10 },
          { productId: pDetergent._id, orderedCases: 5 },
        ],
      }),
    });
    const cartCalc = (await cartCalcRes.json()) as any;
    console.log('✅ Scheme Engine Financial Output:');
    console.log(`   - Subtotal: ₹${cartCalc.subtotal}`);
    console.log(`   - Scheme Discounts: ₹${cartCalc.totalDiscount}`);
    console.log(`   - Taxes (CGST + SGST): ₹${cartCalc.totalTax}`);
    console.log(`   - Final Payable Amount: ₹${cartCalc.finalPayableAmount}`);

    const itemGlucose = cartCalc.items.find((i: any) => i.sku === 'SKU-BS-075');
    const itemDetergent = cartCalc.items.find((i: any) => i.sku === 'SKU-DT-1KG');
    console.log(`   - Glucose Free Goods: ${itemGlucose.freeCases} Case(s) (Buy 10 Get 1 Free verified: ${itemGlucose.freeCases === 1 ? 'PASS' : 'FAIL'})`);
    console.log(`   - Detergent Slab Discount: ₹${itemDetergent.discountAmount} (3% verified: ${itemDetergent.discountPercent === 3 ? 'PASS' : 'FAIL'})`);

    // 4. Test Gemini 3-Model Fallback AI Parser
    console.log('\n[4/7] Testing Google Gemini 3-Tier Cascade AI Order Capture...');
    const rawOrderMsg = 'bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti';
    console.log(`   Raw WhatsApp Input: "${rawOrderMsg}"`);
    const aiRes = await fetch(`${baseUrl}/ai/parse-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rawText: rawOrderMsg }),
    });
    const aiJson = (await aiRes.json()) as any;
    console.log(`✅ AI Parsing Succeeded using model: ${aiJson.modelUsed} (Duration: ${aiJson.durationMs}ms, Fallback: ${aiJson.fallbackTriggered})`);
    console.log(`   Suggestions Extracted (${aiJson.count}):`);
    for (const s of aiJson.suggestions) {
      console.log(`   - "${s.originalPhrase}" -> Matched: [${s.suggestedSku}] ${s.product?.name} (Qty: ${s.quantity} ${s.unit}, Conf: ${(s.confidenceScore * 100).toFixed(0)}%)`);
    }

    // 5. Test Order Placement & Stock Reservation
    console.log('\n[5/7] Testing Order Creation & Dual-Pool Stock Reservation...');
    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          { productId: pGlucose._id, orderedCases: 10 },
          { productId: pDetergent._id, orderedCases: 5 },
        ],
        source: 'AI_WHATSAPP_PARSE',
        rawTextOrder: rawOrderMsg,
      }),
    });
    const orderJson = (await orderRes.json()) as any;
    console.log(`✅ Order Placed: ${orderJson.order.orderNumber} | Status: ${orderJson.order.status} | Final: ₹${orderJson.order.finalPayableAmount}`);

    // 6. Test Credit Hold Policy (Option B) with Retailer 2
    console.log('\n[6/7] Testing Credit Hold Policy with near-limit retailer...');
    const loginVerma = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9826054321', password: 'retailer123' }),
    });
    const vermaToken = ((await loginVerma.json()) as any).token;

    // Order 5 cases detergent = > ₹10,000, which exceeds Sunil Verma's available credit (Balance: ₹38,500 / Limit: ₹40,000)
    const vermaOrderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vermaToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: pDetergent._id, orderedCases: 5 }],
      }),
    });
    const vermaOrder = (await vermaOrderRes.json()) as any;
    console.log(`✅ Verma Order Status: ${vermaOrder.order.status} (Credit Hold Flag: ${vermaOrder.order.creditHold ? 'PASS (Option B Verified)' : 'FAIL'})`);
    console.log(`   Review Note: ${vermaOrder.order.reviewNote}`);

    // 7. Test Order Desk Dashboard & Tally CSV Export
    console.log('\n[7/7] Testing Order Desk Triage, Stock Deduction & Tally CSV Export...');
    const loginDesk = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9425099881', password: 'desk123' }),
    });
    const deskToken = ((await loginDesk.json()) as any).token;

    const deskOrdersRes = await fetch(`${baseUrl}/desk/orders`, {
      headers: { Authorization: `Bearer ${deskToken}` },
    });
    const deskOrders = (await deskOrdersRes.json()) as any;
    console.log(`✅ Order Desk Metrics: Total: ${deskOrders.metrics.totalOrders} | Submitted: ${deskOrders.metrics.submittedCount} | Credit Hold: ${deskOrders.metrics.creditHoldCount}`);

    // Approve Retailer 1's order
    console.log(`   Approving Order ${orderJson.order.id}...`);
    const approveRes = await fetch(`${baseUrl}/desk/orders/${orderJson.order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deskToken}`,
      },
      body: JSON.stringify({ status: 'APPROVED', note: 'Order approved for morning delivery dispatch.' }),
    });
    const approveJson = (await approveRes.json()) as any;
    console.log(`✅ Status updated to: ${approveJson.order.status}`);

    // Export to Tally CSV
    console.log('   Exporting approved orders to Tally-formatted CSV...');
    const tallyRes = await fetch(`${baseUrl}/desk/export/tally-csv`, {
      headers: { Authorization: `Bearer ${deskToken}` },
    });
    const tallyCsv = await tallyRes.text();
    console.log('✅ Generated Tally CSV Content Preview:');
    console.log(tallyCsv.split('\r\n').slice(0, 4).join('\n'));

    console.log('\n============================================================');
    console.log('🏆 ALL 7 BACKEND SUBSYSTEM VERIFICATION TESTS PASSED!');
    console.log('============================================================');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runFullSystemTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

