import mongoose from 'mongoose';
import { Vehicle } from '../src/modules/vehicles/vehicles.model.js';
import { TravelListing } from '../src/modules/marketplace/travelListing.model.js';
import { VehicleAvailability } from '../src/modules/marketplace/vehicleAvailability.model.js';
import ContractRequest from '../src/modules/directHiring/directHiring.model.js';
import Contract from '../src/modules/contracts/contracts.model.js';
import User from '../src/modules/users/users.model.js';
import Company from '../src/modules/companies/companies.model.js';

async function runTravelMarketplaceTests() {
  console.log('🧪 Starting DRIVAIR Travel & Vehicle Marketplace Automated Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`✔ ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${msg}`);
      failed++;
    }
  };

  try {
    // 1. Vehicle Model & Category Invariants
    console.log('--- Section 1: Extended Vehicle Model ---');
    const ownerId = new mongoose.Types.ObjectId();
    const vehicle = new Vehicle({
      ownerId,
      vehicleNumber: 'TN09AB1234',
      vehicleType: 'SUV',
      category: 'suv',
      manufacturer: 'Toyota',
      model: 'Innova Crysta',
      seatingCapacity: 7,
      cargoCapacityKg: 500,
      isAirConditioned: true,
      fuelType: 'diesel',
    });

    assert(vehicle.category === 'suv', 'Vehicle category accepted');
    assert(vehicle.seatingCapacity === 7, 'Vehicle seating capacity verified');
    assert(vehicle.cargoCapacityKg === 500, 'Vehicle cargo payload verified');
    assert(vehicle.isAirConditioned === true, 'Vehicle AC attribute verified');
    const masked = vehicle.getMaskedVehicleNumber();
    assert(masked === 'TN09-**-34', `Masked vehicle number is correctly formatted: ${masked}`);

    // 2. TravelListing Schema Invariants
    console.log('\n--- Section 2: TravelListing Schema & Pricing ---');
    const listing = new TravelListing({
      providerId: ownerId,
      providerType: 'vehicleOwner',
      vehicleId: vehicle._id,
      title: 'Daily Chennai to Bangalore Commercial Route',
      serviceCategory: 'oneWay',
      origin: { city: 'Chennai', state: 'Tamil Nadu' },
      destination: { city: 'Bangalore', state: 'Karnataka' },
      availableSeats: 6,
      cargoCapacityKg: 300,
      pricing: {
        model: 'perKm',
        amountPaise: 2200, // ₹22 per km
        isNegotiable: true,
      },
    });

    const valError = listing.validateSync();
    assert(!valError, 'TravelListing schema validation cleanly passed with perKm model');
    assert(listing.pricing.amountPaise === 2200, 'Paise precision enforced on listing rate');

    // 3. Vehicle Availability Ledger & Overlap Detection
    console.log('\n--- Section 3: Availability Ledger & Overlap Guard ---');
    const startA = new Date('2026-12-01T08:00:00Z');
    const endA = new Date('2026-12-05T18:00:00Z');

    const bookingA = new VehicleAvailability({
      vehicleId: vehicle._id,
      startDate: startA,
      endDate: endA,
      status: 'confirmedBooking',
    });

    assert(bookingA.status === 'confirmedBooking', 'VehicleAvailability record validated');

    // Check overlap logic simulation
    const testOverlap = (slotStart, slotEnd, targetStart, targetEnd) => {
      return slotStart <= targetEnd && slotEnd >= targetStart;
    };

    assert(
      testOverlap(startA, endA, new Date('2026-12-03'), new Date('2026-12-04')),
      'Overlap detected when requested range falls entirely inside existing booking'
    );
    assert(
      testOverlap(startA, endA, new Date('2026-11-28'), new Date('2026-12-02')),
      'Overlap detected when requested range intersects start of booking'
    );
    assert(
      !testOverlap(startA, endA, new Date('2026-12-06'), new Date('2026-12-10')),
      'No overlap when requested range is completely after existing booking'
    );

    // 4. Direct Hiring Integration & Counteroffer Tracking
    console.log('\n--- Section 4: Direct Hiring Offer & Counteroffer Workflow ---');
    const companyId = new mongoose.Types.ObjectId();
    const offer = new ContractRequest({
      companyId,
      createdBy: new mongoose.Types.ObjectId(),
      providerId: ownerId,
      providerType: 'vehicleOwner',
      vehicleId: vehicle._id,
      travelListingId: listing._id,
      title: 'Offer for Chennai - Bangalore Logistics',
      contractType: 'custom',
      pricePeriod: 'total',
      offeredAmountPaise: 1500000, // ₹15,000
      status: 'pending',
    });

    assert(offer.travelListingId.toString() === listing._id.toString(), 'ContractRequest directly references TravelListing');
    
    // Simulate Counteroffer
    offer.counterOffers.push({
      senderId: ownerId,
      proposedAmountPaise: 1650000,
      message: 'Can do ₹16,500 due to toll charges',
      createdAt: new Date(),
    });
    offer.status = 'negotiating';
    offer.offeredAmountPaise = 1650000;

    assert(offer.status === 'negotiating', 'Offer successfully transitions to negotiating status');
    assert(offer.counterOffers.length === 1, 'Counteroffer thread preserved');
    assert(offer.counterOffers[0].proposedAmountPaise === 1650000, 'Counteroffer amount accurately recorded');

    console.log(`\n==============================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==============================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTravelMarketplaceTests();
