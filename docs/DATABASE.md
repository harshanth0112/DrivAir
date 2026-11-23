# DRIVAIR Database Schema & Models

DRIVAIR uses MongoDB with Mongoose ODM. All models include timestamps (`createdAt`, `updatedAt`).

---

## 1. Core Collections Overview
1. **`users`**: Root identity record synced with Firebase Authentication UID.
2. **`companies`**: Company profiles with business registration, GST, and address details.
3. **`drivers`**: Driver profiles with experience, license details, preferred routes, and verification.
4. **`vehicleOwners`**: Fleet owner details.
5. **`vehicles`**: Vehicle specifications, registration, capacity, fuel type, and availability.
6. **`documents`**: Metadata for private compliance files stored in Cloudinary/S3.
7. **`documentRequirements`**: Admin-configurable mandatory document checklist by state and category.
8. **`contractPosts`**: Requirements published by companies inviting provider bids.
9. **`bids`**: Bids submitted by drivers or vehicle owners against open posts.
10. **`contractRequests`**: Direct hiring contract offers sent by companies to specific providers.
11. **`contracts`**: Final binding agreement records (`CNT-xxx`) produced from bids or direct offers.
12. **`conversations`**: Chat rooms linking two or more participants to context (posts, offers, contracts).
13. **`messages`**: Durable in-app chat messages.
14. **`notifications`**: User event notifications.
15. **`auditLogs`**: Security audit log tracking admin moderation and critical events.

---

## 2. Invariant Rules
- **Monetary Fields**: Always stored in `amountPaise` (integers) in INR to eliminate floating-point calculation errors.
- **Relational Integrity**: Uses MongoDB `ObjectId` references (not emails or strings).
- **Document Access**: Private documents are referenced via secure, short-lived URLs or authorized access endpoints; URLs are never exposed in public profile lookups.
