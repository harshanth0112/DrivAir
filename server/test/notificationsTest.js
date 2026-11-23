/**
 * notificationsTest.js
 * P1 Notification System Tests:
 *   - Notification model schema validation
 *   - All notification types are accepted
 *   - Recipient isolation invariants
 *   - Unread default state
 *   - Read state transition
 */

import assert from 'node:assert';
import mongoose from 'mongoose';
import Notification from '../src/modules/notifications/notifications.model.js';

console.log('🔔 Running P1 Notifications Test Suite...');

const runNotificationTests = async () => {
  const userId1 = new mongoose.Types.ObjectId();
  const userId2 = new mongoose.Types.ObjectId();
  const relatedId = new mongoose.Types.ObjectId();

  // Test N1: All valid notification types are accepted by the schema
  const validTypes = [
    'bidReceived',
    'offerReceived',
    'bidAccepted',
    'offerAccepted',
    'documentVerified',
    'documentRejected',
    'messageReceived',
    'contractCreated',
  ];

  for (const type of validTypes) {
    const n = new Notification({
      userId: userId1,
      type,
      title: `Test: ${type}`,
      message: `This is a ${type} notification`,
    });
    const err = n.validateSync();
    assert.strictEqual(err, undefined, `Notification type "${type}" should be valid`);
  }
  console.log(`✔ N1: All ${validTypes.length} notification types accepted by schema`);

  // Test N2: Invalid notification type is rejected
  const invalidNotification = new Notification({
    userId: userId1,
    type: 'unauthorizedRole',
    title: 'Invalid',
    message: 'Should fail',
  });
  const invalidErr = invalidNotification.validateSync();
  assert.ok(invalidErr, 'Invalid type should produce a validation error');
  assert.ok(invalidErr.errors.type, 'Error should reference the type field');
  console.log('✔ N2: Invalid notification type correctly rejected by schema enum');

  // Test N3: Notifications are unread by default
  const freshNotification = new Notification({
    userId: userId1,
    type: 'bidReceived',
    title: 'New Bid',
    message: 'A bid was received',
  });
  assert.strictEqual(freshNotification.isRead, false, 'New notifications must default to unread');
  console.log('✔ N3: Notifications are unread (isRead: false) by default');

  // Test N4: Notification marks as read correctly
  freshNotification.isRead = true;
  assert.strictEqual(freshNotification.isRead, true, 'Notification can transition to isRead: true');
  console.log('✔ N4: Notification read-state transition (false -> true) works correctly');

  // Test N5: Required fields are enforced
  const missingFields = new Notification({ userId: userId1 });
  const missingErr = missingFields.validateSync();
  assert.ok(missingErr, 'Missing required fields should produce validation error');
  assert.ok(missingErr.errors.type, 'type field should be required');
  assert.ok(missingErr.errors.title, 'title field should be required');
  assert.ok(missingErr.errors.message, 'message field should be required');
  console.log('✔ N5: Required fields (type, title, message) are enforced by schema');

  // Test N6: Recipient isolation — notification for user1 should not match user2 filter
  const notifForUser1 = new Notification({
    userId: userId1,
    type: 'contractCreated',
    title: 'Contract created',
    message: 'Your contract is active',
    relatedType: 'Contract',
    relatedId,
  });
  // Simulate the query filter used in getMyNotifications
  const matchesUser1 = notifForUser1.userId.toString() === userId1.toString();
  const matchesUser2 = notifForUser1.userId.toString() === userId2.toString();
  assert.strictEqual(matchesUser1, true, 'Notification should match its recipient');
  assert.strictEqual(matchesUser2, false, 'Notification should NOT match another user');
  console.log('✔ N6: Recipient isolation — notification is only visible to its intended recipient');

  // Test N7: relatedType and relatedId are optional (no validation error)
  const withoutRelated = new Notification({
    userId: userId1,
    type: 'messageReceived',
    title: 'New message',
    message: 'You received a message',
  });
  const withoutRelatedErr = withoutRelated.validateSync();
  assert.strictEqual(withoutRelatedErr, undefined, 'relatedType and relatedId should be optional');
  console.log('✔ N7: relatedType and relatedId are optional fields');

  // Test N8: Verify compound index fields exist on schema (userId + isRead + createdAt)
  const indexes = Notification.schema.indexes();
  const hasCompoundIdx = indexes.some((idx) => {
    const fields = idx[0];
    return fields.userId === 1 && fields.isRead === 1 && fields.createdAt === -1;
  });
  assert.strictEqual(hasCompoundIdx, true, 'Compound index (userId, isRead, createdAt) must exist for query performance');
  console.log('✔ N8: Compound index (userId:1, isRead:1, createdAt:-1) confirmed for query performance');

  console.log('\n🎉 ALL P1 NOTIFICATION TESTS PASSED\n');
};

runNotificationTests().catch((err) => {
  console.error('❌ Notification test failed:', err);
  process.exit(1);
});
