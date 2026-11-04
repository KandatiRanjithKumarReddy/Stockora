import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  User,
  Retailer,
  Product,
  Scheme,
  RetailerAlias,
  RetailerPrice,
  Order,
} from '../models/index.js';

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  await connectDB();

  console.log('[Seed] Cleaning up existing demo data...');
  await Promise.all([
    User.deleteMany({}),
    Retailer.deleteMany({}),
    Product.deleteMany({}),
    Scheme.deleteMany({}),
    RetailerAlias.deleteMany({}),
    RetailerPrice.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log('[Seed] Seeding Retailers in Jabalpur (M.P.)...');
  const retailer1 = await Retailer.create({
    storeName: 'M/s Gupta Kirana Bhandar',
    ownerName: 'Ramesh Gupta',
    phone: '9826012345',
    address: {
      street: 'Shop No. 12, Main Road',
      locality: 'Wright Town',
      city: 'Jabalpur',
      pincode: '482002',
      state: 'Madhya Pradesh',
    },
    gstin: '23AABCG1234F1Z8',
    creditLimit: 60000,
    outstandingBalance: 12400,
    creditStatus: 'GOOD',
    priceTier: 'DEFAULT',
    isActive: true,
  });

  const retailer2 = await Retailer.create({
    storeName: 'Verma Super Daily Needs',
    ownerName: 'Sunil Verma',
    phone: '9826054321',
    address: {
      street: '45, Gol Bazar Chowk',
      locality: 'Gorakhpur',
      city: 'Jabalpur',
      pincode: '482001',
      state: 'Madhya Pradesh',
    },
    gstin: '23XYZPV9876M2Z1',
    creditLimit: 40000,
    outstandingBalance: 38500, // Approaching credit limit for testing Credit Hold
    creditStatus: 'WATCH',
    priceTier: 'DEFAULT',
    isActive: true,
  });

  console.log('[Seed] Seeding Users with secure bcrypt password hashes...');
  const salt = await bcrypt.genSalt(10);
  const retailerPasswordHash = await bcrypt.hash('retailer123', salt);
  const deskPasswordHash = await bcrypt.hash('desk123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  const userRetailer1 = await User.create({
    name: 'Ramesh Gupta',
    phone: '9826012345',
    email: 'ramesh.gupta@kirana.stockora.in',
    passwordHash: retailerPasswordHash,
    role: 'RETAILER',
    status: 'ACTIVE',
    retailerId: retailer1._id,
    authProvider: 'LOCAL',
  });

  const userRetailer2 = await User.create({
    name: 'Sunil Verma',
    phone: '9826054321',
    email: 'sunil.verma@kirana.stockora.in',
    passwordHash: retailerPasswordHash,
    role: 'RETAILER',
    status: 'ACTIVE',
    retailerId: retailer2._id,
    authProvider: 'LOCAL',
  });

  const userDesk = await User.create({
    name: 'Pooja Sharma (Order Desk)',
    phone: '9425099881',
    email: 'orderdesk@distributor.stockora.in',
    passwordHash: deskPasswordHash,
    role: 'ORDER_DESK',
    status: 'ACTIVE',
    authProvider: 'LOCAL',
  });

  const userAdmin = await User.create({
    name: 'Rajesh Agarwal (Distributor Principal)',
    phone: '9425000001',
    email: 'rajesh.agarwal@distributor.stockora.in',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    status: 'ACTIVE',
    authProvider: 'LOCAL',
  });

  console.log('[Seed] Seeding FMCG Product Catalog (Pack & Case prices with HSN)...');
  const productsData = [
    {
      sku: 'SKU-BS-075',
      name: 'Glucose Biscuit 75g (Case of 96)',
      brand: 'Parle',
      category: 'Packaged Food',
      packSize: '75g',
      hsnCode: '19053100',
      unitsPerCase: 96,
      caseWeightKg: 7.2,
      mrp: 10.0,
      dealerPricePerPack: 8.1,
      calculatedCasePrice: 777.6, // 8.10 * 96
      gstRatePercent: 5.0,
      isGstIncluded: false,
      stockCasesAvailable: 340,
      stockCasesReserved: 0,
      lowStockThresholdCases: 20,
      imageUrl: '/images/products/sku-bs-075.svg',
      isActive: true,
    },
    {
      sku: 'SKU-DT-1KG',
      name: 'Detergent Powder 1kg (Case of 20)',
      brand: 'HomeCare Pro',
      category: 'Home Care',
      packSize: '1kg',
      hsnCode: '34022090',
      unitsPerCase: 20,
      caseWeightKg: 20.0,
      mrp: 125.0,
      dealerPricePerPack: 101.5,
      calculatedCasePrice: 2030.0, // 101.50 * 20
      gstRatePercent: 18.0,
      isGstIncluded: false,
      stockCasesAvailable: 85,
      stockCasesReserved: 0,
      lowStockThresholdCases: 15,
      imageUrl: '/images/products/sku-dt-1kg.svg',
      isActive: true,
    },
    {
      sku: 'SKU-TE-250',
      name: 'Premium CTC Tea Leaf 250g (Case of 40)',
      brand: 'Chai Gold',
      category: 'Packaged Food',
      packSize: '250g',
      hsnCode: '09024020',
      unitsPerCase: 40,
      caseWeightKg: 10.0,
      mrp: 140.0,
      dealerPricePerPack: 118.0,
      calculatedCasePrice: 4720.0, // 118.00 * 40
      gstRatePercent: 5.0,
      isGstIncluded: false,
      stockCasesAvailable: 0, // Out of Stock Sample
      stockCasesReserved: 0,
      lowStockThresholdCases: 10,
      imageUrl: '/images/products/sku-te-250.svg',
      isActive: true,
    },
    {
      sku: 'SKU-BS-120',
      name: 'Glucose Biscuit Family Pack 120g (Case of 60)',
      brand: 'Parle',
      category: 'Packaged Food',
      packSize: '120g',
      hsnCode: '19053100',
      unitsPerCase: 60,
      caseWeightKg: 7.2,
      mrp: 20.0,
      dealerPricePerPack: 16.5,
      calculatedCasePrice: 990.0,
      gstRatePercent: 5.0,
      isGstIncluded: false,
      stockCasesAvailable: 150,
      stockCasesReserved: 0,
      lowStockThresholdCases: 25,
      imageUrl: '/images/products/sku-bs-120.svg',
      isActive: true,
    },
    {
      sku: 'SKU-ND-070',
      name: 'Instant Masala Noodles 70g (Case of 96)',
      brand: 'FoodFest',
      category: 'Packaged Food',
      packSize: '70g',
      hsnCode: '19023010',
      unitsPerCase: 96,
      caseWeightKg: 6.72,
      mrp: 14.0,
      dealerPricePerPack: 11.2,
      calculatedCasePrice: 1075.2,
      gstRatePercent: 12.0,
      isGstIncluded: false,
      stockCasesAvailable: 210,
      stockCasesReserved: 0,
      lowStockThresholdCases: 30,
      imageUrl: '/images/products/sku-nd-070.svg',
      isActive: true,
    },
  ];

  const createdProducts = await Product.insertMany(productsData);
  const pGlucose = createdProducts.find((p) => p.sku === 'SKU-BS-075')!;
  const pDetergent = createdProducts.find((p) => p.sku === 'SKU-DT-1KG')!;
  const pTea = createdProducts.find((p) => p.sku === 'SKU-TE-250')!;

  console.log('[Seed] Seeding Active Schemes...');
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 90); // 90 days validity

  await Scheme.create([
    {
      name: 'Glucose 10+1 Peti Bonanza',
      schemeType: 'BUY_X_GET_Y_FREE',
      primaryProductId: pGlucose._id,
      buyQuantity: 10, // 10 cases
      freeProductId: pGlucose._id,
      freeQuantity: 1, // 1 free case
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
    {
      name: 'Detergent 3% Off on 5+ Cases',
      schemeType: 'SLAB_PERCENT_DISCOUNT',
      primaryProductId: pDetergent._id,
      minSlabQuantity: 5, // 5 cases
      discountPercentage: 3.0, // 3%
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
  ]);

  console.log('[Seed] Seeding Retailer Aliases for AI Few-Shot Context...');
  await RetailerAlias.create([
    {
      retailerId: retailer1._id,
      rawKeyword: 'biscuit chhota',
      mappedProductId: pGlucose._id,
      mappedSku: pGlucose.sku,
      preferredUnit: 'CASE',
      confidenceScore: 1.0,
      createdFrom: 'ORDER_DESK_CORRECTION',
    },
    {
      retailerId: retailer1._id,
      rawKeyword: 'washing powder 1 kilo',
      mappedProductId: pDetergent._id,
      mappedSku: pDetergent.sku,
      preferredUnit: 'CASE',
      confidenceScore: 1.0,
      createdFrom: 'ORDER_DESK_CORRECTION',
    },
    {
      retailerId: retailer1._id,
      rawKeyword: 'chai patti 250',
      mappedProductId: pTea._id,
      mappedSku: pTea.sku,
      preferredUnit: 'CASE',
      confidenceScore: 1.0,
      createdFrom: 'ORDER_DESK_CORRECTION',
    },
  ]);

  console.log('------------------------------------------------------------');
  console.log('✅ Stockora Database Seeding Completed Successfully!');
  console.log('------------------------------------------------------------');
  console.log('Demo Login Accounts:');
  console.log('1. Kirana Retailer (Standard):');
  console.log('   Phone: 9826012345 | Password: retailer123');
  console.log('   Store: M/s Gupta Kirana Bhandar (Credit Limit: ₹60,000)');
  console.log('2. Kirana Retailer (Near Credit Limit):');
  console.log('   Phone: 9826054321 | Password: retailer123');
  console.log('   Store: Verma Super Daily Needs (Balance: ₹38,500 / ₹40,000)');
  console.log('3. Order Desk Staff:');
  console.log('   Phone: 9425099881 | Password: desk123');
  console.log('   Role: ORDER_DESK (Can triage orders, edit lines, export Tally CSV)');
  console.log('4. Distributor Admin:');
  console.log('   Phone: 9425000001 | Password: admin123');
  console.log('   Role: ADMIN');
  console.log('------------------------------------------------------------');

  await mongoose.disconnect();
  console.log('[Seed] Disconnected from MongoDB Atlas.');
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});

