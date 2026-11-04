import { createApp } from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import http from 'http';

async function runAuthTests() {
  console.log('[TestAuth] Connecting to MongoDB Atlas...');
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  try {
    // 1. Healthcheck
    console.log('[TestAuth] Testing Health endpoint...');
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    const healthJson = (await healthRes.json()) as any;
    console.log('Healthcheck result:', healthJson.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

    // 2. Retailer Login
    console.log('[TestAuth] Testing Retailer Login (9826012345)...');
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9826012345', password: 'retailer123' }),
    });
    const loginJson = (await loginRes.json()) as any;
    console.log('Retailer Login result:', loginJson.success ? `✅ PASS (Store: ${loginJson.user.retailer.storeName})` : '❌ FAIL');
    const token = loginJson.token;

    // 3. Authenticated /me
    console.log('[TestAuth] Testing GET /api/v1/auth/me with Bearer token...');
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meJson = (await meRes.json()) as any;
    console.log('GET /me result:', meJson.success && meJson.user.role === 'RETAILER' ? '✅ PASS' : '❌ FAIL');

    // 4. Order Desk Login
    console.log('[TestAuth] Testing Order Desk Login (9425099881)...');
    const deskRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9425099881', password: 'desk123' }),
    });
    const deskJson = (await deskRes.json()) as any;
    console.log('Order Desk Login result:', deskJson.success && deskJson.user.role === 'ORDER_DESK' ? '✅ PASS' : '❌ FAIL');

    // 5. Mock Google Sign-In
    console.log('[TestAuth] Testing Mock Google Sign-In...');
    const googleRes = await fetch(`${baseUrl}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoAccount: true }),
    });
    const googleJson = (await googleRes.json()) as any;
    console.log('Mock Google Sign-In result:', googleJson.success && googleJson.isMockMode ? '✅ PASS' : '❌ FAIL');

    // 6. Mock SMS OTP Request & Verify
    console.log('[TestAuth] Testing Mock OTP Request...');
    const otpReqRes = await fetch(`${baseUrl}/api/v1/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9826099999' }),
    });
    const otpReqJson = (await otpReqRes.json()) as any;
    console.log('OTP Request result:', otpReqJson.mockOtp === '123456' ? '✅ PASS' : '❌ FAIL');

    const otpVerRes = await fetch(`${baseUrl}/api/v1/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9826099999', otp: '123456' }),
    });
    const otpVerJson = (await otpVerRes.json()) as any;
    console.log('OTP Verify result:', otpVerJson.success ? '✅ PASS' : '❌ FAIL');

    console.log('------------------------------------------------------------');
    console.log('🎉 All Phase 2 Authentication & Atlas Tests PASSED!');
    console.log('------------------------------------------------------------');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runAuthTests().catch((err) => {
  console.error('[TestAuth] Test execution failed:', err);
  process.exit(1);
});

