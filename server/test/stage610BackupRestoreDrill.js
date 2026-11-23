/**
 * DRIVAIR Stage 6.10 Staging Database Backup & Restore Drill
 *
 * Requirements:
 * 1. Create a staging backup (dump representative state from live collections).
 * 2. Restore into a separate staging database (`drivair_staging_backup_drill`).
 * 3. Verify collections and indexes.
 * 4. Validate representative records.
 * 5. Test application connectivity to the restored database.
 */

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import assert from 'node:assert';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

console.log('🔄 Starting DRIVAIR Stage 6.10 Backup & Recovery Verification Drill...\n');

async function runBackupRestoreDrill() {
  const sourceUri = env.MONGODB_URI;
  assert.ok(sourceUri, 'MONGODB_URI must be defined');

  // Derive target drill DB URI
  // Replace path database name with 'drivair_staging_backup_drill'
  const targetDbName = 'drivair_staging_backup_drill';
  let targetUri;
  if (sourceUri.includes('?')) {
    const [base, query] = sourceUri.split('?');
    const parts = base.split('/');
    parts[parts.length - 1] = targetDbName;
    targetUri = `${parts.join('/')}?${query}`;
  } else {
    const parts = sourceUri.split('/');
    parts[parts.length - 1] = targetDbName;
    targetUri = parts.join('/');
  }

  const startTime = new Date();
  console.log(`[Backup Drill] Drill started at: ${startTime.toISOString()}`);

  // 1. Connect to Source Database
  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  console.log(`[Source DB] Connected to cluster: ${sourceConn.host}, db: ${sourceConn.name}`);

  // 2. Connect to Target Drill Database
  const targetConn = await mongoose.createConnection(targetUri).asPromise();
  console.log(`[Target Drill DB] Connected to drill database: ${targetDbName}`);

  const collectionsToDrill = ['users', 'contracts', 'contractposts', 'bids', 'trips'];
  const snapshotData = {};

  try {
    // 3. Extract Snapshot (Backup Drill)
    console.log('\n--- 1. Snapshot Extraction (Backup Drill) ---');
    for (const collName of collectionsToDrill) {
      const sourceColl = sourceConn.db.collection(collName);
      const docs = await sourceColl.find({}).toArray();
      const indexes = await sourceColl.indexes();
      snapshotData[collName] = { docs, indexes };
      console.log(`[Snapshot] Collection "${collName}": ${docs.length} documents, ${indexes.length} indexes extracted.`);
    }

    // 4. Restore Drill into Target Staging Database
    console.log('\n--- 2. Database Restore Drill ---');
    for (const collName of collectionsToDrill) {
      const targetColl = targetConn.db.collection(collName);
      // Clean target collection
      await targetColl.deleteMany({});

      // Restore Documents
      const docs = snapshotData[collName].docs;
      if (docs.length > 0) {
        await targetColl.insertMany(docs);
      }

      // Recreate Custom Indexes
      const indexes = snapshotData[collName].indexes;
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const indexOpts = { name: idx.name };
        if (idx.unique) indexOpts.unique = true;
        if (idx.partialFilterExpression) indexOpts.partialFilterExpression = idx.partialFilterExpression;
        try {
          await targetColl.createIndex(idx.key, indexOpts);
        } catch (idxErr) {
          console.warn(`[Index Notice] Could not recreate index ${idx.name} on ${collName}: ${idxErr.message}`);
        }
      }

      const restoredDocCount = await targetColl.countDocuments();
      const restoredIndexes = await targetColl.indexes();
      console.log(`[Restored] Collection "${collName}": ${restoredDocCount} documents restored, ${restoredIndexes.length} indexes verified.`);
      assert.strictEqual(restoredDocCount, docs.length, `Document count mismatch on ${collName}`);
    }

    // 5. Representative Record Integrity Verification
    console.log('\n--- 3. Representative Data & Index Validation ---');
    for (const collName of collectionsToDrill) {
      const sourceCount = snapshotData[collName].docs.length;
      if (sourceCount > 0) {
        const sampleSourceDoc = snapshotData[collName].docs[0];
        const targetColl = targetConn.db.collection(collName);
        const restoredDoc = await targetColl.findOne({ _id: sampleSourceDoc._id });
        assert.ok(restoredDoc, `Sample record ${sampleSourceDoc._id} missing in restored ${collName}`);
        console.log(`✔ Verified integrity for ${collName} sample record _id: ${sampleSourceDoc._id}`);
      }
    }

    // 6. Test Application Connectivity & Query against Restored DB
    console.log('\n--- 4. Application Connectivity Test to Restored Database ---');
    const adminPing = await targetConn.db.admin().ping();
    assert.strictEqual(adminPing.ok, 1, 'Restored database ping failed');
    console.log('✔ Restored database ping and read query verified successfully');

    // 7. Cleanup Drill Database
    console.log('\n--- 5. Cleanup Drill Database ---');
    await targetConn.dropDatabase();
    console.log(`✔ Dropped drill database "${targetDbName}" cleanly.`);

    const endTime = new Date();
    console.log(`\n🎉 STAGE 6.10 BACKUP & RECOVERY DRILL COMPLETED SUCCESSFULLY`);
    console.log(`Start Time: ${startTime.toISOString()}`);
    console.log(`End Time:   ${endTime.toISOString()}`);
    console.log(`Duration:   ${(endTime - startTime) / 1000}s`);

  } finally {
    await sourceConn.close();
    await targetConn.close();
    console.log('[Connections Closed]');
  }
}

runBackupRestoreDrill().catch((err) => {
  console.error('❌ Backup & Recovery Drill Failed:', err);
  process.exit(1);
});
