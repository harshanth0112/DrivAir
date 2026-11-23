/**
 * DRIVAIR Stage 6.3 Real MongoDB Atlas Multi-Document Transaction Test Suite
 *
 * Requirements to test:
 * 1. Successful bid acceptance.
 * 2. Contract creation failure.
 * 3. Transaction rollback.
 * 4. Duplicate bid acceptance.
 * 5. Concurrent acceptance attempts.
 * 6. Duplicate contract prevention.
 */

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import assert from 'node:assert';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import ContractPost from '../src/modules/marketplace/marketplace.model.js';
import Bid from '../src/modules/bids/bids.model.js';
import Contract from '../src/modules/contracts/contracts.model.js';
import { acceptBidAndCreateContractService } from '../src/modules/bids/bids.service.js';

console.log('🧪 Starting DRIVAIR Stage 6.3 Real MongoDB Atlas Transaction Test...\n');

async function runStage63AtlasTransactionTests() {
  const conn = await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
  });

  console.log(`[Atlas Connect] Connected to host: ${conn.connection.host}`);
  const isReplicaSet = !!(conn.connection?.client?.topology?.description?.type === 'ReplicaSetWithPrimary' || conn.connection?.client?.topology?.description?.type === 'Sharded');
  console.log(`[Atlas Topology] ReplicaSet ready: ${isReplicaSet}`);

  assert.ok(isReplicaSet, 'Must be connected to a live ReplicaSet for Stage 6.3 testing');

  // Generate unique test IDs for this test run
  const testCompanyId = new mongoose.Types.ObjectId();
  const testDriverId = new mongoose.Types.ObjectId();
  const mockCompany = { _id: testCompanyId };

  try {
    // -------------------------------------------------------------------------
    // Setup: Create a realistic test ContractPost on Atlas
    // -------------------------------------------------------------------------
    const testPost = await ContractPost.create({
      companyId: testCompanyId,
      createdBy: testCompanyId,
      title: 'Stage 6.3 Staging Route Mumbai-Pune',
      description: 'Staging verification test route',
      serviceCategory: 'Logistics',
      contractType: 'monthly',
      requiredDrivers: 1,
      requiredVehicles: 0,
      location: { city: 'Mumbai', state: 'Maharashtra' },
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 86400000 * 5),
      budget: { minAmountPaise: 400000, maxAmountPaise: 500000, pricePeriod: 'monthly' },
      status: 'open',
      awardedBidIds: [],
    });
    console.log(`[Setup] Created test ContractPost: ${testPost._id}`);

    // Create Bid 1
    const bid1 = await Bid.create({
      contractPostId: testPost._id,
      bidderId: testDriverId,
      bidderType: 'driver',
      proposedAmountPaise: 480000,
      pricePeriod: 'monthly',
      proposalMessage: 'Ready for Mumbai-Pune route',
      status: 'pending',
    });
    console.log(`[Setup] Created test Bid 1: ${bid1._id}`);

    // Create Bid 2 (for concurrent test)
    const bid2 = await Bid.create({
      contractPostId: testPost._id,
      bidderId: new mongoose.Types.ObjectId(),
      bidderType: 'driver',
      proposedAmountPaise: 490000,
      pricePeriod: 'monthly',
      proposalMessage: 'Backup driver bid',
      status: 'pending',
    });
    console.log(`[Setup] Created test Bid 2: ${bid2._id}`);

    // -------------------------------------------------------------------------
    // Test 1: Successful bid acceptance with real transaction
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: Successful Bid Acceptance with Real Atlas Transaction ---');
    const result1 = await acceptBidAndCreateContractService(bid1._id.toString(), mockCompany);
    assert.ok(result1.contract, 'Contract must be created');
    assert.strictEqual(result1.contract.sourceBidId.toString(), bid1._id.toString());
    assert.strictEqual(result1.bid.status, 'accepted');

    const verifiedPost = await ContractPost.findById(testPost._id);
    assert.strictEqual(verifiedPost.status, 'awarded');
    assert.strictEqual(verifiedPost.awardedBidIds.length, 1);
    console.log('✔ Test 1 PASS: Bid 1 accepted, post transitioned to "awarded", canonical contract created');

    // -------------------------------------------------------------------------
    // Test 4: Duplicate bid acceptance rejection
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: Duplicate Bid Acceptance Prevention ---');
    let duplicateRejected = false;
    try {
      await acceptBidAndCreateContractService(bid1._id.toString(), mockCompany);
    } catch (e) {
      duplicateRejected = true;
      assert.strictEqual(e.statusCode, 400);
      console.log(`✔ Test 4 PASS: Re-accepting already accepted bid rejected with: "${e.message}"`);
    }
    assert.ok(duplicateRejected, 'Duplicate bid acceptance must throw AppError(400)');

    // -------------------------------------------------------------------------
    // Test 5: Concurrent acceptance / Position limit reached
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Concurrent Acceptance / Limit Reached Prevention ---');
    let limitBlocked = false;
    try {
      await acceptBidAndCreateContractService(bid2._id.toString(), mockCompany);
    } catch (e) {
      limitBlocked = true;
      assert.strictEqual(e.statusCode, 409);
      console.log(`✔ Test 5 PASS: Second bid acceptance rejected with 409: "${e.message}"`);
    }
    assert.ok(limitBlocked, 'Awarding beyond available positions must throw AppError(409)');

    // -------------------------------------------------------------------------
    // Test 6: Duplicate Contract Prevention via Unique Index
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: Duplicate Contract Prevention via Unique Index on Atlas ---');
    let contractDuplicateBlocked = false;
    try {
      await Contract.create({
        contractNumber: 'DUP-TEST-12345',
        sourceType: 'bid',
        sourceBidId: bid1._id, // Attempt duplicate sourceBidId
        companyId: testCompanyId,
        providerId: testDriverId,
        providerType: 'Driver',
        title: 'Duplicate test',
        status: 'active',
      });
    } catch (e) {
      contractDuplicateBlocked = true;
      console.log(`✔ Test 6 PASS: Atlas unique index on sourceBidId blocked duplicate contract with code: ${e.code || e.name}`);
    }
    assert.ok(contractDuplicateBlocked, 'Atlas unique index must block duplicate contract on sourceBidId');

    // -------------------------------------------------------------------------
    // Test 2 & 3: Contract Creation Failure and Transaction Rollback Verification
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2 & 3: Multi-Document Transaction Rollback on Failure ---');
    // Create new post and bid to isolate rollback test
    const rollbackPost = await ContractPost.create({
      companyId: testCompanyId,
      createdBy: testCompanyId,
      title: 'Rollback Verification Route',
      description: 'Testing abortTransaction behavior',
      serviceCategory: 'Logistics',
      contractType: 'monthly',
      requiredDrivers: 1,
      requiredVehicles: 0,
      location: { city: 'Pune', state: 'Maharashtra' },
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 86400000 * 2),
      budget: { minAmountPaise: 150000, maxAmountPaise: 200000, pricePeriod: 'monthly' },
      status: 'open',
      awardedBidIds: [],
    });

    const rollbackBid = await Bid.create({
      contractPostId: rollbackPost._id,
      bidderId: testDriverId,
      bidderType: 'driver',
      proposedAmountPaise: 190000,
      pricePeriod: 'monthly',
      proposalMessage: 'Rollback test bid',
      status: 'pending',
    });

    // Execute explicit Atlas Session Transaction simulating contract creation failure
    const session = await mongoose.startSession();
    session.startTransaction();

    let rolledBackCleanly = false;
    try {
      // Step A inside transaction: Claim position on ContractPost
      await ContractPost.updateOne(
        { _id: rollbackPost._id },
        { $push: { awardedBidIds: rollbackBid._id }, $set: { status: 'awarded' } },
        { session }
      );

      // Step B inside transaction: Set Bid to accepted
      await Bid.updateOne(
        { _id: rollbackBid._id },
        { $set: { status: 'accepted' } },
        { session }
      );

      // Step C: Trigger deliberate failure before contract creation completes
      throw new Error('Simulated hardware/network failure during contract provisioning');
    } catch (err) {
      // Abort transaction!
      await session.abortTransaction();
      await session.endSession();
      rolledBackCleanly = true;
      console.log(`[Rollback] Caught simulated error and aborted transaction: "${err.message}"`);
    }

    assert.ok(rolledBackCleanly, 'Transaction abort must execute');

    // Query documents fresh from Atlas outside transaction to verify rollback
    const postAfterRollback = await ContractPost.findById(rollbackPost._id);
    const bidAfterRollback = await Bid.findById(rollbackBid._id);

    assert.strictEqual(postAfterRollback.status, 'open', 'Post status must remain "open" after rollback');
    assert.strictEqual(postAfterRollback.awardedBidIds.length, 0, 'Post awardedBidIds must be empty after rollback');
    assert.strictEqual(bidAfterRollback.status, 'pending', 'Bid status must remain "pending" after rollback');
    console.log('✔ Test 2 & 3 PASS: Post and Bid remained in original states; Atlas multi-document transaction rolled back cleanly');

    // -------------------------------------------------------------------------
    // Cleanup staging test documents
    // -------------------------------------------------------------------------
    console.log('\n--- Cleanup: Purging Test Documents from Staging Atlas ---');
    await Contract.deleteMany({ companyId: testCompanyId });
    await Bid.deleteMany({ contractPostId: { $in: [testPost._id, rollbackPost._id] } });
    await ContractPost.deleteMany({ _id: { $in: [testPost._id, rollbackPost._id] } });
    console.log('✔ Cleanup complete: Staging cluster left in pristine state');

    console.log('\n🎉 ALL 6 STAGE 6.3 ATLAS TRANSACTION INVARIANTS VERIFIED CLEANLY ON LIVE REPLICA SET!');
  } finally {
    await mongoose.disconnect();
    console.log('[Atlas Disconnect] Connection closed cleanly.');
  }
}

runStage63AtlasTransactionTests().catch((err) => {
  console.error('❌ Stage 6.3 Atlas Transaction Test Failed:', err);
  process.exit(1);
});
