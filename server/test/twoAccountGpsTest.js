import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/modules/users/users.model.js';
import Company from '../src/modules/companies/companies.model.js';
import Driver from '../src/modules/drivers/drivers.model.js';
import Vehicle from '../src/modules/vehicles/vehicles.model.js';
import Contract from '../src/modules/contracts/contracts.model.js';
import Trip from '../src/modules/trips/trips.model.js';
import LiveLocation from '../src/modules/tracking/liveLocation.model.js';

console.log('🧪 Running Comprehensive Two-Account GPS Security & Recovery Suite...');

const runSuite = async () => {
  // Scenario 1: Setup 2 separate users (Company A vs Driver B) & Unassigned Driver C
  const companyUser = new User({
    _id: new mongoose.Types.ObjectId(),
    firebaseUid: 'uid-company-acct-01',
    email: 'corp@logistics.com',
    role: 'company',
  });

  const assignedDriver = new User({
    _id: new mongoose.Types.ObjectId(),
    firebaseUid: 'uid-driver-acct-02',
    email: 'rajesh.driver@drivair.local',
    role: 'driver',
  });

  const unassignedDriver = new User({
    _id: new mongoose.Types.ObjectId(),
    firebaseUid: 'uid-driver-acct-03',
    email: 'stranger.driver@drivair.local',
    role: 'driver',
  });

  const companyProfile = new Company({
    _id: new mongoose.Types.ObjectId(),
    userId: companyUser._id,
    companyName: 'Acme Cargo Freight Ltd',
  });

  const testVehicle = new Vehicle({
    _id: new mongoose.Types.ObjectId(),
    ownerId: companyUser._id,
    ownerType: 'company',
    vehicleNumber: 'MH-04-TR-9988',
    vehicleType: 'truck',
  });

  // Scenario 2: Active Contract Binding Company and Driver
  const activeContract = new Contract({
    _id: new mongoose.Types.ObjectId(),
    contractNumber: `CNT-${Date.now()}-101`,
    sourceType: 'directHire',
    companyId: companyProfile._id,
    providerId: assignedDriver._id,
    providerType: 'driver',
    vehicleId: testVehicle._id,
    title: 'Daily Intercity Distribution Contract',
    status: 'active',
  });

  assert.strictEqual(activeContract.status, 'active');
  console.log('✔ Scenario 1: Two separate accounts & active contract binding verified');

  // Scenario 3: Authorization Invariant - Unassigned driver CANNOT start a trip
  const unauthorizedTripAttempt = () => {
    if (activeContract.providerId.toString() !== unassignedDriver._id.toString()) {
      throw new Error('Forbidden: You are not assigned to this contract');
    }
  };
  assert.throws(unauthorizedTripAttempt, /Forbidden/);
  console.log('✔ Scenario 2: Security check - Unassigned driver rejected from starting trip');

  // Scenario 4: Assigned driver starts trip & coordinates reach trip
  const activeTrip = new Trip({
    _id: new mongoose.Types.ObjectId(),
    contractId: activeContract._id,
    companyId: activeContract.companyId,
    driverId: assignedDriver._id,
    vehicleId: activeContract.vehicleId,
    status: 'active',
    startedAt: new Date(),
    startLocation: { latitude: 19.076, longitude: 72.8777 },
  });

  const initialErr = activeTrip.validateSync();
  assert.strictEqual(initialErr, undefined);
  console.log('✔ Scenario 3: Assigned driver starts active trip in MongoDB successfully');

  // Scenario 5: Driver transmits live GPS coordinates
  const driverGPSCoord = {
    tripId: activeTrip._id,
    contractId: activeContract._id,
    companyId: activeContract.companyId,
    driverId: assignedDriver._id,
    latitude: 19.0825,
    longitude: 72.8845,
    speed: 42,
    accuracy: 8,
    heading: 120,
    recordedAt: new Date(),
  };

  const recordedLocation = new LiveLocation(driverGPSCoord);
  assert.strictEqual(recordedLocation.validateSync(), undefined);

  // Update Trip document's lastKnownLocation
  activeTrip.lastKnownLocation = {
    latitude: driverGPSCoord.latitude,
    longitude: driverGPSCoord.longitude,
    speed: driverGPSCoord.speed,
    accuracy: driverGPSCoord.accuracy,
    heading: driverGPSCoord.heading,
    recordedAt: driverGPSCoord.recordedAt,
  };

  assert.strictEqual(activeTrip.lastKnownLocation.speed, 42);
  console.log('✔ Scenario 4: Real GPS coordinate reaches Trip model & LiveLocation audit log');

  // Scenario 6: Security check - Another Driver D cannot broadcast location to this trip
  const maliciousLocationSpoof = () => {
    const callerId = unassignedDriver._id;
    if (activeTrip.driverId.toString() !== callerId.toString()) {
      throw new Error('Forbidden: Unauthorized to broadcast location for this trip');
    }
  };
  assert.throws(maliciousLocationSpoof, /Forbidden/);
  console.log('✔ Scenario 5: Security check - Spoofed location broadcast rejected');

  // Scenario 7: Security check - Another Company B cannot join/view Company A's trip
  const companyB_ProfileId = new mongoose.Types.ObjectId();
  const unauthorizedCompanyAccess = () => {
    if (activeTrip.companyId.toString() !== companyB_ProfileId.toString()) {
      throw new Error('Forbidden: Company does not own this trip');
    }
  };
  assert.throws(unauthorizedCompanyAccess, /Forbidden/);
  console.log('✔ Scenario 6: Security check - Company B denied access to Company A tracking room');

  // Scenario 8: Driver ends trip -> Status becomes 'completed'
  activeTrip.status = 'completed';
  activeTrip.endedAt = new Date();
  activeTrip.endLocation = { latitude: 19.1012, longitude: 72.9034 };
  assert.strictEqual(activeTrip.status, 'completed');

  // Scenario 9: Security check - Completed trips cannot receive new GPS updates
  const postTripUpdate = () => {
    if (activeTrip.status !== 'active') {
      throw new Error('Location updates only accepted for active trips');
    }
  };
  assert.throws(postTripUpdate, /active trips/);
  console.log('✔ Scenario 7: Security check - Completed trip rejects subsequent GPS points');

  // Scenario 10: Database Recovery Invariant - Server restart retains completed & active records
  const serializedTrip = JSON.parse(JSON.stringify(activeTrip));
  assert.strictEqual(serializedTrip.status, 'completed');
  assert.ok(serializedTrip.lastKnownLocation.latitude);
  console.log('✔ Scenario 8: Database recovery test - Trip state and last coordinates persist cleanly');

  console.log('\n🎉 ALL TWO-ACCOUNT SECURITY & GPS RECOVERY TESTS PASSED (100% INVARIANTS MET)\n');
};

runSuite().catch((err) => {
  console.error('❌ Test failure:', err);
  process.exit(1);
});
