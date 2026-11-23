import { connectDB } from './src/config/database.js';
import dotenv from 'dotenv';
dotenv.config();

import User from './src/modules/users/users.model.js';
import Company from './src/modules/companies/companies.model.js';
import Driver from './src/modules/drivers/drivers.model.js';
import VehicleOwner from './src/modules/vehicleOwners/vehicleOwners.model.js';
import Vehicle from './src/modules/vehicles/vehicles.model.js';
import ContractPost from './src/modules/marketplace/marketplace.model.js';
import Bid from './src/modules/bids/bids.model.js';
import ContractRequest from './src/modules/directHiring/directHiring.model.js';
import Contract from './src/modules/contracts/contracts.model.js';
import Document from './src/modules/documents/documents.model.js';
import Trip from './src/modules/trips/trips.model.js';
import LiveLocation from './src/modules/tracking/liveLocation.model.js';
import mongoose from 'mongoose';

async function seedDatabase() {
  console.log('🌱 Connecting to MongoDB for DRIVAIR seed injection...');
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  // 1. Create or Find Realistic Seed Users
  console.log('👤 Seeding Users & Role Profiles...');

  // Company: BlueDart Logistics Enterprise
  let companyUser = await User.findOne({ email: 'logistics@bluedart-demo.com' });
  if (!companyUser) {
    companyUser = await User.create({
      firebaseUid: 'seed_company_bluedart_001',
      email: 'logistics@bluedart-demo.com',
      fullName: 'Sunil Mehta (BlueDart Logistics)',
      phone: '+91 9820011223',
      role: 'company',
      accountStatus: 'active',
      emailVerified: true,
    });
  }

  const company = await Company.findOneAndUpdate(
    { userId: companyUser._id },
    {
      userId: companyUser._id,
      companyName: 'BlueDart Express Freight Ltd',
      registrationNumber: 'CIN-U63090MH2002PLC135400',
      gstNumber: '27AAACB1234F1Z5',
      businessType: 'Inter-City Supply Chain & FMCG Delivery',
      address: {
        line1: 'Plot 45, MIDC Industrial Area, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400093',
        country: 'India',
      },
      contactPerson: 'Sunil Mehta',
      verificationStatus: 'verified',
    },
    { upsert: true, new: true }
  );

  // Driver 1: Rajesh Sharma (Heavy Commercial Vehicle Specialist)
  let driverUser1 = await User.findOne({ email: 'rajesh.driver@demo.com' });
  if (!driverUser1) {
    driverUser1 = await User.create({
      firebaseUid: 'seed_driver_rajesh_002',
      email: 'rajesh.driver@demo.com',
      fullName: 'Rajesh Kumar Sharma',
      phone: '+91 9876543210',
      role: 'driver',
      accountStatus: 'active',
      emailVerified: true,
    });
  }

  await Driver.findOneAndUpdate(
    { userId: driverUser1._id },
    {
      userId: driverUser1._id,
      experienceYears: 8,
      licenceNumber: 'MH-0420160089123',
      licenceCategory: 'HMV_TRANS',
      city: 'Mumbai',
      state: 'Maharashtra',
      availabilityStatus: 'available',
      verificationStatus: 'verified',
    },
    { upsert: true }
  );

  // Driver 2: Amit Verma (Express Container Specialist)
  let driverUser2 = await User.findOne({ email: 'amit.verma@demo.com' });
  if (!driverUser2) {
    driverUser2 = await User.create({
      firebaseUid: 'seed_driver_amit_003',
      email: 'amit.verma@demo.com',
      fullName: 'Amit Kumar Verma',
      phone: '+91 9123456780',
      role: 'driver',
      accountStatus: 'active',
      emailVerified: true,
    });
  }

  await Driver.findOneAndUpdate(
    { userId: driverUser2._id },
    {
      userId: driverUser2._id,
      experienceYears: 5,
      licenceNumber: 'DL-0120190045678',
      licenceCategory: 'HMV',
      city: 'Delhi NCR',
      state: 'Delhi',
      availabilityStatus: 'available',
      verificationStatus: 'verified',
    },
    { upsert: true }
  );

  // Vehicle Owner: Vikram Singh (National Fleet Transport)
  let ownerUser = await User.findOne({ email: 'vikram.fleet@demo.com' });
  if (!ownerUser) {
    ownerUser = await User.create({
      firebaseUid: 'seed_owner_vikram_004',
      email: 'vikram.fleet@demo.com',
      fullName: 'Vikram Singh (Singhania Fleets)',
      phone: '+91 9988776655',
      role: 'vehicleOwner',
      accountStatus: 'active',
      emailVerified: true,
    });
  }

  await VehicleOwner.findOneAndUpdate(
    { userId: ownerUser._id },
    {
      userId: ownerUser._id,
      businessName: 'Singhania Heavy Haulage Fleet',
      fleetSize: 18,
      panNumber: 'ABCPS1234K',
      city: 'Pune',
      state: 'Maharashtra',
      verificationStatus: 'verified',
    },
    { upsert: true }
  );

  // 2. Seed Commercial Vehicles
  console.log('🚛 Seeding Commercial Vehicles...');
  const v1 = await Vehicle.findOneAndUpdate(
    { vehicleNumber: 'MH-12-RN-8899' },
    {
      ownerId: ownerUser._id,
      vehicleNumber: 'MH-12-RN-8899',
      vehicleType: 'truck',
      capacity: { value: 16, unit: 'tons' },
      status: 'active',
    },
    { upsert: true, new: true }
  );

  const v2 = await Vehicle.findOneAndUpdate(
    { vehicleNumber: 'DL-01-AX-4321' },
    {
      ownerId: ownerUser._id,
      vehicleNumber: 'DL-01-AX-4321',
      vehicleType: 'tempo',
      capacity: { value: 3.5, unit: 'tons' },
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // 3. Seed Open Marketplace Tender Opportunities
  console.log('📦 Seeding Open Marketplace Contract Tenders...');
  const postsData = [
    {
      title: 'Dedicated 16-Ton HCV Freight Corridor (Mumbai - Pune Express Route)',
      description: 'Daily scheduled cargo transit between Bhiwandi Logistics Hub and Chakan Industrial corridor. Driver must possess valid HMV license with 5+ years experience. FastTag, fuel surcharge, and monthly retention bonus included.',
      serviceCategory: 'Freight & Heavy Transport',
      budget: { minAmountPaise: 6500000, maxAmountPaise: 8000000, pricePeriod: 'monthly' },
      location: { city: 'Mumbai', state: 'Maharashtra', district: 'Thane' },
      requiredDrivers: 2,
      requiredVehicles: 1,
      contractType: 'monthly',
      status: 'open',
    },
    {
      title: 'FMCG Temperature-Controlled Cold Chain Transit (Delhi NCR to Jaipur)',
      description: 'Refrigerated transit for dairy and fresh confectionery logistics. Strict GPS telemetry compliance required. 6 trips per week with turnaround time guarantees.',
      serviceCategory: 'Cold Chain Logistics',
      budget: { minAmountPaise: 7500000, maxAmountPaise: 9500000, pricePeriod: 'monthly' },
      location: { city: 'Delhi', state: 'Delhi', district: 'North Delhi' },
      requiredDrivers: 1,
      requiredVehicles: 1,
      contractType: 'monthly',
      status: 'open',
    },
    {
      title: 'Corporate Passenger Transit Fleet (Bengaluru Tech Park - Whitefield)',
      description: 'Dedicated air-conditioned 32-seater coaches for morning and evening employee commuting. Verified commercial passenger endorsement mandatory.',
      serviceCategory: 'Corporate Passenger Transit',
      budget: { minAmountPaise: 11000000, maxAmountPaise: 13000000, pricePeriod: 'monthly' },
      location: { city: 'Bengaluru', state: 'Karnataka', district: 'Whitefield' },
      requiredDrivers: 3,
      requiredVehicles: 3,
      contractType: 'yearly',
      status: 'open',
    },
  ];

  for (const p of postsData) {
    await ContractPost.findOneAndUpdate(
      { title: p.title },
      {
        companyId: company._id,
        createdBy: companyUser._id,
        ...p,
      },
      { upsert: true, new: true }
    );
  }

  // 4. Seed Binding Canonical Contracts
  console.log('📜 Seeding Active Commercial Contract...');
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sampleContractNumber = `CNT-${todayStr}-7788`;

  let activeContract = await Contract.findOne({ contractNumber: sampleContractNumber });
  if (!activeContract) {
    activeContract = await Contract.create({
      contractNumber: sampleContractNumber,
      title: 'Commercial Haulage Agreement: Mumbai Port to Bhiwandi Hub',
      companyId: company._id,
      providerId: driverUser1._id,
      providerType: 'driver',
      vehicleId: v1._id,
      agreedAmountPaise: 7500000, // ₹75,000 / month
      pricePeriod: 'monthly',
      sourceType: 'directHire',
      status: 'active',
      startDate: new Date(),
      termsAndConditions: 'Continuous GPS broadcast required during transit. Bi-weekly settlement upon proof of delivery.',
    });
  }

  // 5. Seed Compliance Documents for Verification Queue
  console.log('📄 Seeding Compliance Verification Queue Documents...');
  await Document.findOneAndUpdate(
    { documentNumber: 'MH-04-2016-89123' },
    {
      ownerId: driverUser1._id,
      ownerType: 'driver',
      documentType: 'drivingLicence',
      documentNumber: 'MH-04-2016-89123',
      secureUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000',
      status: 'pending',
      originalFileName: 'rajesh_commercial_licence.pdf',
    },
    { upsert: true }
  );

  await Document.findOneAndUpdate(
    { documentNumber: 'RC-MH12-RN-8899' },
    {
      ownerId: ownerUser._id,
      ownerType: 'vehicleOwner',
      documentType: 'registrationCertificate',
      documentNumber: 'RC-MH12-RN-8899',
      vehicleId: v1._id,
      secureUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1000',
      status: 'pending',
      originalFileName: 'hcv_16ton_rc_book.pdf',
    },
    { upsert: true }
  );

  // 6. Seed Active GPS Trip with Live Coordinates
  console.log('🛰️ Seeding Active Real-Time GPS Tracking Session...');
  const activeTrip = await Trip.findOneAndUpdate(
    { contractId: activeContract._id, status: 'inProgress' },
    {
      contractId: activeContract._id,
      companyId: company._id,
      driverId: driverUser1._id,
      status: 'inProgress',
      startLocation: {
        latitude: 19.0760,
        longitude: 72.8777,
        recordedAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      lastLocation: {
        latitude: 19.1136,
        longitude: 72.9982,
        speed: 54, // 54 km/h
        heading: 75,
        recordedAt: new Date(),
      },
      startedAt: new Date(Date.now() - 3600000),
    },
    { upsert: true, new: true }
  );

  // Breadcrumb Trail from Mumbai Port towards Bhiwandi
  const trailWaypoints = [
    { lat: 19.0760, lng: 72.8777, speed: 35 },
    { lat: 19.0920, lng: 72.9150, speed: 48 },
    { lat: 19.1050, lng: 72.9550, speed: 62 },
    { lat: 19.1136, lng: 72.9982, speed: 54 },
  ];

  for (let i = 0; i < trailWaypoints.length; i++) {
    const wp = trailWaypoints[i];
    await LiveLocation.create({
      tripId: activeTrip._id,
      contractId: activeContract._id,
      companyId: company._id,
      driverId: driverUser1._id,
      latitude: wp.lat,
      longitude: wp.lng,
      speed: wp.speed,
      accuracy: 6,
      heading: 75,
      recordedAt: new Date(Date.now() - (trailWaypoints.length - i) * 600000),
    });
  }

  console.log(`
🎉 DRIVAIR TEST SEED INJECTION COMPLETED SUCCESSFULLY!

Summary of Populated Data:
──────────────────────────────────────────────────────────────────
🏢 Company User:     logistics@bluedart-demo.com   (BlueDart Express Freight Ltd)
🚚 Driver User 1:    rajesh.driver@demo.com        (Rajesh Kumar Sharma - HMV Certified)
🚚 Driver User 2:    amit.verma@demo.com           (Amit Kumar Verma - Express Delivery)
🚛 Fleet Owner:      vikram.fleet@demo.com         (Singhania Heavy Haulage Fleet)
🚚 Commercial Fleet: MH-12-RN-8899 (16 Tons), DL-01-AX-4321 (3.5 Tons)
📦 Open Tenders:     3 High-Value Enterprise Logistics Contracts
📜 Active Contract:  ${activeContract.contractNumber} (Agreed: ₹75,000/mo)
🛰️ Live Trip:        Active en-route on Mumbai-Bhiwandi corridor (54 km/h)
📄 Compliance Queue: 2 Documents awaiting Admin Adjudication
──────────────────────────────────────────────────────────────────
You can now log in or view the marketplace, contracts, live radar, and compliance tabs immediately.
`);

  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('❌ Error executing DRIVAIR seed script:', err);
  process.exit(1);
});
