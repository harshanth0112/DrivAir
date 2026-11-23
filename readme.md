DRIVAIR --- MVP Project README
Purpose: Build a B2B marketplace that connects companies directly
with verified drivers and vehicle owners for short- and long-term
transport/service contracts.

MVP principle: Ship the smallest reliable product that proves the
core marketplace workflow: company posts a requirement → providers
bid OR company hires directly → users negotiate in chat → company and
provider agree → contract is created.

1. Project Overview
DRIVAIR is a web-based contract marketplace for companies that need
drivers and/or vehicles. It removes the need for brokers by allowing
companies to:
1. Publish service and contract requirements.
2. Receive competitive bids from drivers and vehicle owners.
3. Search providers and vehicles and send direct hiring offers.
4. Communicate through an in-app messenger.
5. Accept an offer and create a contract record.
Drivers and vehicle owners can create profiles, upload relevant
documents, discover opportunities, submit bids, receive direct offers,
negotiate, and manage accepted contracts.

An administrator reviews accounts and documents, manages categories and
document requirements, and handles reports.
1.1 MVP outcomes
The MVP is successful when:
- A user can register, sign in, and access only their permitted
  portal.
- A company can create and publish a contract post.
- An eligible driver or vehicle owner can discover the post and submit
  a bid.
- A company can review bids and accept one (or the permitted number of
  bids).
- A company can search providers and send a direct offer.
- The provider can accept, reject, or counter/negotiate an offer.
- Participants can chat only with authorised conversation members.
- An accepted bid or direct offer can produce one final contract.
- An admin can review users and uploaded documents.
- Important actions are validated and recorded on the backend.
1.2 Out of scope for the first MVP
Do not implement these until the core marketplace is working:
- AI matching, AI price recommendations, or predictive analytics.
- Live GPS tracking and background location tracking.
- Trip dispatch, route optimisation, fuel tracking, or maintenance
  prediction.
- Integrated payment gateway, escrow, automatic settlements, or
  refunds.
- Native Android/iOS apps.
- Complex invoicing, accounting, and advanced analytics.
- Multi-branch enterprise workflows.
- Automated government verification integrations.
Keep the architecture extensible so these can be added later.
2. User Roles and Permissions
Use role-based access control (RBAC). The role is assigned and validated
by the backend; never trust a role sent by the browser.
  Role                                Main responsibilities
  company                           Manage company profile, publish
contract posts, browse providers,
review bids, send direct offers,
chat, manage contracts

  driver                            Manage driver profile and
documents, browse posts, submit
bids, receive direct offers, chat,
view contracts

  vehicleOwner                      Manage owner profile and vehicles,
upload vehicle documents, browse
posts, submit bids, receive direct
offers, chat, view contracts
admin                             Review users and documents, manage
document requirements/categories,
handle reports, inspect audit
activity
A vehicle owner may manage multiple vehicles. A driver may be associated
with a vehicle only if the product later supports that relationship; do
not assume every driver owns a vehicle.
2.1 Access rules
- A company can edit only its own profile and posts.
- A bidder can edit or withdraw only their own bid, and only while the
  post permits it.
- Only the company that owns a post can shortlist, reject, or accept
  its bids.
- A provider can respond only to direct offers addressed to them.
- Only participants in a conversation can read or send messages in it.
- Only authorised admins can verify documents or change verification
  status.
- A contract can be viewed or changed only by its participants and
  authorised admins.
- A user cannot promote themselves to admin.
- Suspended or blocked users cannot create new posts, bids, or offers.
3. Recommended Technology Stack
Use a modular monolith for the MVP: one frontend application, one
Express API, and one MongoDB database. Keep modules separated in code
without introducing microservices.
  Layer                   Technology              Responsibility
  Frontend                React + Vite            Single-page web
application

  Language                JavaScript initially;   Application code
TypeScript is
recommended if the team
is comfortable          

  Styling                 Tailwind CSS            Responsive UI

  Routing                 React Router            Portal and page
navigation

  HTTP                    Axios or fetch          API communication

  Server state            TanStack Query          Fetching, caching,
(recommended)           mutation states

  Backend                 Node.js + Express       REST API and business
rules

  Validation              Zod or                  Validate request data
express-validator       

  Database                MongoDB Atlas +         Persistent application
Mongoose                data

  Authentication          Firebase Authentication Email/password or
supported sign-in

  Token verification      Firebase Admin SDK      Verify Firebase ID
tokens on backend

  Real-time messaging     Socket.IO               Chat delivery and
online presence

  File storage            Cloudinary or private   Profile images and
object storage          document files

  Maps                    Leaflet + OpenStreetMap Location display
(later if needed)       
Deployment              Vercel (frontend) +     Hosting
Render or equivalent
(API)
3.1 Important implementation decisions
- Firebase handles identity/sign-in. MongoDB stores the application's
  user profile, role, and business data.
- Every protected API request sends a Firebase ID token. The backend
  verifies it using Firebase Admin SDK and loads the corresponding
  MongoDB user.
- Use MongoDB ObjectIds for internal relationships. Do not use email
  addresses as foreign keys.
- Store document metadata in MongoDB and files in private storage. Do
  not store large file contents in MongoDB.
- Use Socket.IO for chat, but persist each message through the
  backend/database. A socket event alone is not durable storage.
- Use environment variables for secrets. Never commit .env.
- Use UTC timestamps in the database and display dates in the user's
  local timezone.
- Store currency as an amount in the smallest currency unit (for INR,
  paise) or use Decimal128 consistently. Do not use floating-point
  arithmetic for money. The schemas below use amountPaise as an
  integer.
- Use soft status changes for business records rather than deleting
  accepted contracts or audit-relevant records.
4. Main MVP Workflows
4.1 Registration and onboarding
1. User registers/signs in through Firebase Authentication.
2. Frontend obtains Firebase ID token.
3. Frontend calls POST /api/v1/auth/sync.
4. Backend verifies token and creates/updates a users record.
5. User completes the role-specific profile.
6. Admin reviews profile/documents where required.
7. User sees verification status and can correct rejected information.
Do not let the client choose admin. For normal registration, accept
only company, driver, or vehicleOwner; admin accounts must be
provisioned securely.
4.2 Company contract posting and bidding
1. Company creates a draft contract post.
2. Company fills title, service category, location, contract duration,
   required quantity, budget, requirements, and deadline.
3. Company publishes the post.
4. Eligible providers view open posts.
5. A provider submits a proposed price, price period, and proposal
   message.
6. Company compares bids using price, provider profile, verification
   status, experience, and suitability.
7. Company may shortlist, reject, negotiate, or accept a bid.
8. On acceptance, backend atomically marks the selected bid accepted,
   updates the post, and creates a contract.
9. Notify both parties and create/open a conversation linked to the
   post/bid/contract.
Important: The lowest bid must not be automatically selected. The
company makes the decision. The backend must prevent multiple awards
beyond the number of available positions/vehicles.
4.3 Direct hiring
1. Company searches verified/eligible driver or vehicle-owner profiles.
2. Company opens a profile and selects a provider and, if relevant, a
   vehicle.
3. Company sends a direct offer with service details, dates, proposed
   price, price period, location, and message.
4. Provider accepts, rejects, or counters the offer.
5. Both parties negotiate through chat.
6. When an offer is accepted, backend creates the contract exactly
   once.
7. Both parties can view the resulting contract.
Use contractRequests with requestType: "directHire" for direct
offers. Do not create a second collection for the same workflow unless a
later requirement justifies it.
4.4 Chat and messaging
- A conversation has two or more authorised participants, but MVP UI
  can start with one-to-one conversations.
- A conversation may be linked to a contract post, bid, direct offer,
  or contract.
- Messages are stored in MongoDB.
- Socket.IO sends real-time events to authorised participants.
- Validate participant membership on every socket join and message
  operation.
- Support text messages first. File/image attachments can be enabled
  after secure upload validation.
- Add unread count/read state and last-message preview.
- Do not expose private document storage URLs in ordinary chat without
  access checks.
4.5 Document verification
1. User selects a document type and uploads a file.
2. Backend validates file size, MIME type, extension, and owner
   permissions.
3. File is uploaded to private storage.
4. MongoDB stores metadata and private storage reference.
5. Admin reviews it and marks it verified, rejected, or
   resubmissionRequired.
6. Rejected documents include a reason.
7. Users can upload a replacement; retain the previous verification
   history where practical.
Document requirements depend on vehicle class, service, state, and
applicable law. Do not treat every possible document listed below as
mandatory for every provider. Admin-configurable requirements determine
applicability.
5. Application Pages and Navigation
5.1 Public pages
- Landing page
- How it works
- Sign up / sign in
- Forgot password (Firebase-supported flow)
- Terms and privacy pages
5.2 Company portal
- Dashboard
- Company Profile
- Create Contract Post
- My Contract Posts
- View Post Details
- Received Bids
- Search Drivers
- Search Vehicle Owners / Vehicles
- Provider Profile
- Direct Offer Details
- Conversations / Chat
- My Contracts
- Notifications
- Account Settings
5.3 Driver portal
- Dashboard
- My Profile
- My Documents
- Browse Contract Posts
- Contract Post Details
- My Bids
- Direct Offers
- Conversations / Chat
- My Contracts
- Notifications
- Account Settings
5.4 Vehicle owner portal
- Dashboard
- Owner Profile
- My Vehicles
- Add/Edit Vehicle
- Vehicle Documents
- Vehicle Listings (basic)
- Browse Contract Posts
- My Bids
- Direct Offers
- Conversations / Chat
- My Contracts
- Notifications
- Account Settings
5.5 Admin portal
- Admin Dashboard
- User Management
- Company Review
- Driver Review
- Vehicle Owner Review
- Document Verification Queue
- Document Requirements
- Contract Post Moderation
- Reported Users / Content
- Audit Log
6. MongoDB Data Structure
Use Mongoose schemas. All collections should include createdAt and
updatedAt where applicable (timestamps: true). The examples below
describe the recommended fields; adjust names consistently in code.
6.1 Entity relationship overview
users
 ├── companies (userId -> users._id)
 ├── drivers (userId -> users._id)
 └── vehicleOwners (userId -> users._id) [optional separate profile]
       └── vehicles (ownerId -> users._id)

users
 └── documents (ownerId -> users._id, optional vehicleId -> vehicles._id)

companies
 └── contractPosts (companyId -> companies._id)
       └── bids (contractPostId -> contractPosts._id)
              └── contracts (sourceBidId -> bids._id)

companies
 └── contractRequests (companyId -> companies._id, requestType=directHire)
       └── contracts (sourceRequestId -> contractRequests._id)

conversations
 └── messages (conversationId -> conversations._id)

contracts
 └── conversations (contextType=contract, contextId -> contracts._id)
The users collection is the identity/role root. Profiles hold
role-specific fields. Use references rather than embedding large or
independently updated records.
6.2 Collection 1 --- users
Purpose: shared account, identity, role, and account status.
{
  _id: ObjectId,
  firebaseUid: String,        // required, unique
  email: String,              // normalised, indexed where present
  phone: String,
  fullName: String,
  role: "company" | "driver" | "vehicleOwner" | "admin",
  profileImage: String,       // safe image URL or storage reference
  accountStatus: "pending" | "active" | "suspended" | "blocked",
  emailVerified: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
Indexes: - Unique { firebaseUid: 1 } - Optional unique/partial
{ email: 1 } if email uniqueness is required. -
{ role: 1, accountStatus: 1 }
6.3 Collection 2 --- companies
{
  _id: ObjectId,
  userId: ObjectId,            // ref users, unique
  companyName: String,
  registrationNumber: String,
  gstNumber: String,
  businessType: String,
  address: {
    line1: String,
    line2: String,
    city: String,
    district: String,
    state: String,
    postalCode: String,
    country: String
  },
  contactPerson: String,
  verificationStatus: "notSubmitted" | "pending" | "verified" | "rejected",
  rejectionReason: String
}
Indexes: - Unique { userId: 1 } -
{ companyName: "text", "address.city": 1, "address.state": 1 } as
appropriate.
6.4 Collection 3 --- drivers
{
  _id: ObjectId,
  userId: ObjectId,            // ref users, unique
  dateOfBirth: Date,
  address: { city: String, district: String, state: String, postalCode: String },
  experienceYears: Number,
  licence: {
    number: String,            // sensitive; restrict access
    categories: [String],
    issuingAuthority: String,
    issueDate: Date,
    expiryDate: Date
  },
  skills: [String],
  preferredLocations: [{ city: String, state: String }],
  availabilityStatus: "available" | "busy" | "unavailable",
  verificationStatus: "notSubmitted" | "pending" | "verified" | "rejected"
}
Indexes: - Unique { userId: 1 } -
{ availabilityStatus: 1, verificationStatus: 1 } - Search indexes for
location and experience as needed.
6.5 Collection 4 --- vehicleOwners (recommended)
{
  _id: ObjectId,
  userId: ObjectId,            // ref users, unique
  ownerName: String,
  address: { city: String, district: String, state: String, postalCode: String },
  verificationStatus: "notSubmitted" | "pending" | "verified" | "rejected"
}
This profile is useful when an owner manages multiple vehicles. If the
MVP intentionally uses only the shared user profile, this collection can
be omitted; keep vehicle ownerId referencing users._id.
6.6 Collection 5 --- vehicles
{
  _id: ObjectId,
  ownerId: ObjectId,           // ref users
  vehicleNumber: String,       // sensitive; restrict exposure
  vehicleType: String,         // e.g. car, taxi, bus, truck
  manufacturer: String,
  model: String,
  manufactureYear: Number,
  capacity: { value: Number, unit: String },
  fuelType: String,
  description: String,
  photos: [String],
  registration: {
    rcNumber: String,
    issuingState: String,
    registrationDate: Date
  },
  availabilityStatus: "available" | "booked" | "unavailable",
  verificationStatus: "notSubmitted" | "pending" | "verified" | "rejected"
}
Indexes: - { ownerId: 1 } -
{ vehicleType: 1, availabilityStatus: 1, verificationStatus: 1 } -
Unique vehicle number only after normalisation and with appropriate
access controls.
6.7 Collection 6 --- documents
Purpose: metadata for driver, owner, company, or vehicle documents.
Files live in private storage.
{
  _id: ObjectId,
  ownerId: ObjectId,           // ref users
  ownerType: "company" | "driver" | "vehicleOwner" | "vehicle",
  vehicleId: ObjectId,         // optional ref vehicles
  documentType: String,
  documentNumber: String,      // sensitive; mask in UI
  storageProvider: "cloudinary" | "s3" | "other",
  storageKey: String,          // private key/reference; do not expose publicly
  secureUrl: String,           // only if private delivery/access control is configured
  originalFileName: String,
  mimeType: String,
  fileSizeBytes: Number,
  issueDate: Date,
  expiryDate: Date,
  issuingAuthority: String,
  verificationStatus: "pending" | "verified" | "rejected" | "expired" | "resubmissionRequired",
  rejectionReason: String,
  verifiedBy: ObjectId,         // ref users/admin
  verifiedAt: Date,
  replacedDocumentId: ObjectId // optional ref documents
}
Suggested document type values (not a universal mandatory checklist): -
Driver: drivingLicence, identityProof, addressProof,
medicalFitness, policeVerification, transportAuthorisation,
psvBadge - Vehicle: registrationCertificate, vehicleInsurance,
nationalPermit, statePermit, fitnessCertificate,
pollutionCertificate, roadTaxReceipt, interstatePermit,
ownershipProof, leaseAgreement - Company: businessRegistration,
gstCertificate, addressProof - other

Indexes: - { ownerId: 1, documentType: 1 } -
{ verificationStatus: 1, expiryDate: 1 } - { vehicleId: 1 }
6.8 Collection 7 --- documentRequirements
Purpose: admin-configurable document checklist by provider type, vehicle
category, and state.
{
  _id: ObjectId,
  category: String,            // driver, car, taxi, bus, truck, goodsVehicle, etc.
  documentType: String,
  applicableFor: "driver" | "vehicle" | "company" | "both",
  isMandatory: Boolean,
  applicableState: String,     // optional; "ALL" or state code/name
  validityRequired: Boolean,
  reminderDays: [Number],     // e.g. [30, 15, 7]
  isActive: Boolean
}
Do not hardcode every listed document as mandatory. Actual legal
requirements vary by vehicle class, service, state, and current
regulations. Admins should configure the checklist after checking
authoritative requirements.
6.9 Collection 8 --- serviceListings
Purpose: optional basic discovery listing for available
drivers/vehicles. For MVP, search may query verified profiles and
vehicles directly; create this collection only if providers need
multiple separate listings.
{
  _id: ObjectId,
  providerId: ObjectId,        // ref users
  providerType: "driver" | "vehicleOwner",
  vehicleId: ObjectId,         // optional ref vehicles
  title: String,
  serviceCategory: String,
  location: { city: String, district: String, state: String },
  price: { amountPaise: Number, currency: "INR", period: "weekly" | "monthly" | "yearly" },
  description: String,
  status: "draft" | "published" | "paused" | "closed"
}
6.10 Collection 9 --- contractPosts
Purpose: company-published requirements that invite bids.
{
  _id: ObjectId,
  companyId: ObjectId,         // ref companies
  createdBy: ObjectId,         // ref users
  title: String,
  description: String,
  serviceCategory: String,     // configurable category
  providerTypes: ["driver", "vehicleOwner"],
  vehicleCategory: String,     // optional
  requiredDrivers: Number,
  requiredVehicles: Number,
  location: {
    city: String,
    district: String,
    state: String,
    postalCode: String,
    addressText: String
  },
  contractType: "weekly" | "monthly" | "yearly" | "custom",
  startDate: Date,
  endDate: Date,
  budget: {
    minAmountPaise: Number,
    maxAmountPaise: Number,
    currency: "INR",
    pricePeriod: "weekly" | "monthly" | "yearly" | "total"
  },
  requirements: {
    minimumExperienceYears: Number,
    licenceCategories: [String],
    vehicleTypes: [String],
    minimumCapacity: Number,
    requiredDocumentTypes: [String],
    notes: String
  },
  applicationDeadline: Date,
  status: "draft" | "open" | "partiallyAwarded" | "awarded" | "closed" | "cancelled",
  awardedBidIds: [ObjectId],   // refs bids; supports multiple positions if required
  createdAt: Date,
  updatedAt: Date
}
Indexes: - { status: 1, applicationDeadline: 1 } -
{ companyId: 1, createdAt: -1 } -
{ serviceCategory: 1, "location.city": 1, "location.state": 1, status: 1 }
6.11 Collection 10 --- bids
Purpose: provider proposal against a contract post.
{
  _id: ObjectId,
  contractPostId: ObjectId,    // ref contractPosts
  bidderId: ObjectId,          // ref users
  bidderType: "driver" | "vehicleOwner",
  vehicleId: ObjectId,         // optional ref vehicles
  proposedAmountPaise: Number,
  currency: "INR",
  pricePeriod: "weekly" | "monthly" | "yearly" | "total",
  proposalMessage: String,
  status: "pending" | "shortlisted" | "negotiating" | "accepted" | "rejected" | "withdrawn",
  submittedAt: Date,
  updatedAt: Date,
  acceptedAt: Date
}
Indexes and rules: - Unique
{ contractPostId: 1, bidderId: 1, vehicleId: 1 } with a carefully
designed partial index if multiple vehicles/bids are supported. For the
simplest MVP, enforce one active bid per provider per post in
application logic and a unique { contractPostId: 1, bidderId: 1 }. -
{ contractPostId: 1, status: 1, proposedAmountPaise: 1 } -
{ bidderId: 1, status: 1, submittedAt: -1 } - Validate that the post
is open and deadline has not passed. - Do not let a bidder bid on their
own company post. - Do not expose other bidders' private information to
providers.
6.12 Collection 11 --- contractRequests
Purpose: direct hiring offer from a company to a driver or vehicle
owner.
{
  _id: ObjectId,
  requestType: "directHire",
  companyId: ObjectId,         // ref companies
  createdBy: ObjectId,         // ref users
  providerId: ObjectId,        // ref users
  providerType: "driver" | "vehicleOwner",
  vehicleId: ObjectId,         // optional ref vehicles
  title: String,
  description: String,
  location: { city: String, district: String, state: String, addressText: String },
  contractType: "weekly" | "monthly" | "yearly" | "custom",
  startDate: Date,
  endDate: Date,
  offeredAmountPaise: Number,
  currency: "INR",
  pricePeriod: "weekly" | "monthly" | "yearly" | "total",
  status: "pending" | "negotiating" | "accepted" | "rejected" | "withdrawn" | "expired",
  responseMessage: String,
  respondedAt: Date
}
Indexes: - { providerId: 1, status: 1, createdAt: -1 } -
{ companyId: 1, status: 1, createdAt: -1 }
6.13 Collection 12 --- contracts
Purpose: final accepted agreement. This is the canonical record after a
bid or direct offer is accepted.
{
  _id: ObjectId,
  contractNumber: String,      // unique generated human-readable reference
  sourceType: "bid" | "directHire",
  sourceBidId: ObjectId,       // optional ref bids
  sourceRequestId: ObjectId,   // optional ref contractRequests
  companyId: ObjectId,         // ref companies
  providerId: ObjectId,        // ref users
  providerType: "driver" | "vehicleOwner",
  vehicleId: ObjectId,         // optional ref vehicles
  title: String,
  description: String,
  location: { city: String, district: String, state: String, addressText: String },
  contractType: "weekly" | "monthly" | "yearly" | "custom",
  startDate: Date,
  endDate: Date,
  agreedAmountPaise: Number,
  currency: "INR",
  pricePeriod: "weekly" | "monthly" | "yearly" | "total",
  terms: String,
  status: "active" | "completed" | "cancelled" | "terminated",
  acceptedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
Indexes: - Unique { contractNumber: 1 } -
{ companyId: 1, status: 1, createdAt: -1 } -
{ providerId: 1, status: 1, createdAt: -1 } - Unique source reference
where appropriate to prevent duplicate contract creation.

Create the contract in the same MongoDB transaction as the
acceptance/status updates when the deployment supports transactions
(replica set). Otherwise use an idempotent service and unique indexes to
prevent duplicates.
6.14 Collection 13 --- conversations
{
  _id: ObjectId,
  participants: [{
    userId: ObjectId,
    role: "company" | "driver" | "vehicleOwner" | "admin",
    joinedAt: Date
  }],
  contextType: "direct" | "contractPost" | "bid" | "directHire" | "contract",
  contextId: ObjectId,
  lastMessageId: ObjectId,
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
Indexes: - { "participants.userId": 1, lastMessageAt: -1 } -
{ contextType: 1, contextId: 1 } - Consider a deterministic
participant-pair key for preventing duplicate one-to-one conversations.
6.15 Collection 14 --- messages
{
  _id: ObjectId,
  conversationId: ObjectId,    // ref conversations
  senderId: ObjectId,          // ref users
  messageType: "text" | "image" | "file" | "offer" | "system",
  messageText: String,
  attachment: {
    storageKey: String,
    originalFileName: String,
    mimeType: String,
    fileSizeBytes: Number
  },
  offerDetails: {
    amountPaise: Number,
    currency: "INR",
    pricePeriod: String
  },
  readBy: [{ userId: ObjectId, readAt: Date }],
  createdAt: Date
}
Indexes: - { conversationId: 1, createdAt: -1 } -
{ senderId: 1, createdAt: -1 }

For large-scale messaging, move read receipts to a separate collection
later. For MVP, a small readBy array is sufficient for one-to-one
conversations.
6.16 Collection 15 --- notifications (recommended MVP support)
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,                // bidReceived, offerReceived, bidAccepted, messageReceived, etc.
  title: String,
  message: String,
  relatedType: String,
  relatedId: ObjectId,
  isRead: Boolean,
  createdAt: Date
}
Indexes: - { userId: 1, isRead: 1, createdAt: -1 }
6.17 Collection 16 --- auditLogs (admin/security support)
{
  _id: ObjectId,
  actorId: ObjectId,           // ref users
  action: String,
  targetType: String,
  targetId: ObjectId,
  metadata: Object,
  ipAddress: String,
  createdAt: Date
}
Do not store passwords, Firebase tokens, full identity-document
contents, or other secrets in audit metadata.
6.18 Optional later collections
Add only when those modules are implemented: - trips -
liveLocations - locationHistory - payments - reviews -
disputes - documentVerificationHistory (if a separate immutable
history collection becomes necessary)
7. API Design
Prefix all backend routes with /api/v1. Return consistent JSON
responses and HTTP status codes.
7.1 Authentication and user
  Method            Endpoint                      Access                   Purpose
  POST              /auth/sync                  Authenticated Firebase   Create/sync
user                     MongoDB user

  GET               /users/me                   Authenticated            Current user and
role

  PATCH             /users/me                   Authenticated            Update allowed
shared profile
fields
GET               /users/:id/public-profile   Authenticated/eligible   Public-safe
profile data
7.2 Role profiles and vehicles
  Method            Endpoint               Access            Purpose
  GET/PUT           /companies/me        Company           Read/update
company profile

  GET/PUT           /drivers/me          Driver            Read/update
driver profile

  GET/PUT           /vehicle-owners/me   Vehicle owner     Read/update owner
profile

  POST              /vehicles            Vehicle owner     Add vehicle

  GET               /vehicles/mine       Vehicle owner     List own vehicles

  PATCH             /vehicles/:id        Vehicle owner     Update own
vehicle

  DELETE            /vehicles/:id        Vehicle owner     Archive own
vehicle

  GET               /providers/search    Company           Search eligible
providers
GET               /vehicles/search     Company           Search eligible
vehicles
7.3 Documents
  Method            Endpoint                        Access            Purpose
  POST              /documents/upload             Authenticated     Upload document

  GET               /documents/mine               Authenticated     List own documents

  GET               /documents/:id/access         Authorised        Obtain secure short-lived
access

  GET               /admin/documents              Admin             Verification queue
PATCH             /admin/documents/:id/verify   Admin             Approve/reject/resubmission
7.4 Contract marketplace and bids
  Method            Endpoint                        Access            Purpose
  POST              /contract-posts               Company           Create draft post

  GET               /contract-posts               Authenticated     Browse open posts
eligible provider 

  GET               /contract-posts/:id           Authorised        Post details

  PATCH             /contract-posts/:id           Owning company    Edit draft/open
post under rules

  POST              /contract-posts/:id/publish   Owning company    Publish post

  POST              /contract-posts/:id/close     Owning company    Close post

  POST              /contract-posts/:id/bids      Driver/vehicle    Submit bid
owner             

  GET               /contract-posts/:id/bids      Owning company    View bids

  GET               /bids/mine                    Provider          View own bids

  PATCH             /bids/:id                     Bid owner         Edit/withdraw bid
if permitted

  POST              /bids/:id/shortlist           Owning company    Shortlist

  POST              /bids/:id/reject              Owning company    Reject
POST              /bids/:id/accept              Owning company    Accept and create
contract
7.5 Direct hiring
  Method            Endpoint                       Access              Purpose
  POST              /direct-offers               Company             Send direct
hiring offer

  GET               /direct-offers/received      Provider            View received
offers

  GET               /direct-offers/sent          Company             View sent offers

  POST              /direct-offers/:id/accept    Offer recipient     Accept offer and
create contract

  POST              /direct-offers/:id/reject    Offer recipient     Reject offer
POST              /direct-offers/:id/counter   Offer               Submit
recipient/company   counter-offer
7.6 Contracts, chat, notifications, admin
  Method            Endpoint                        Access              Purpose
  GET               /contracts/mine               Contract            List own contracts
participant         

  GET               /contracts/:id                Contract            Contract details
participant/admin   

  PATCH             /contracts/:id/status         Participant under   Update contract
allowed rules/admin status

  GET               /conversations                Participant         List conversations

  POST              /conversations                Authenticated       Create/find
authorised
conversation

  GET               /conversations/:id/messages   Participant         Paginated messages

  POST              /conversations/:id/messages   Participant         Persist message

  PATCH             /conversations/:id/read       Participant         Mark messages read

  GET               /notifications                Authenticated       List notifications

  PATCH             /notifications/:id/read       Owner               Mark notification
read

  GET               /admin/users                  Admin               Search/manage
users

  PATCH             /admin/users/:id/status       Admin               Suspend/activate
GET               /admin/audit-logs             Admin               Inspect audit
records
API conventions - Use 201 Created for successful creation. - Use
400 Bad Request for invalid input, 401 Unauthorized,
403 Forbidden, 404 Not Found, 409 Conflict, and
500 Internal Server Error. - Use pagination (page, limit, cursor
where useful) for lists. - Never return private document storage keys,
sensitive licence numbers, password hashes, or Firebase tokens in public
responses. - Validate ObjectIds and all body/query parameters. - Add
request IDs and structured server-side logs.
8. Backend Architecture and Folder Structure
Recommended repository layout:
drivair/
├── README.md
├── .gitignore
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── app/
│       │   ├── App.jsx
│       │   ├── router.jsx
│       │   └── providers.jsx
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── forms/
│       │   ├── layout/
│       │   └── feedback/
│       ├── features/
│       │   ├── auth/
│       │   ├── company/
│       │   ├── driver/
│       │   ├── vehicle-owner/
│       │   ├── vehicles/
│       │   ├── documents/
│       │   ├── marketplace/
│       │   ├── bids/
│       │   ├── direct-hiring/
│       │   ├── contracts/
│       │   ├── chat/
│       │   ├── notifications/
│       │   └── admin/
│       ├── hooks/
│       ├── lib/
│       │   ├── api.js
│       │   └── firebase.js
│       ├── styles/
│       └── main.jsx
├── server/
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── database.js
│       │   ├── firebaseAdmin.js
│       │   └── env.js
│       ├── middleware/
│       │   ├── authenticate.js
│       │   ├── authorize.js
│       │   ├── validate.js
│       │   ├── errorHandler.js
│       │   └── rateLimiter.js
│       ├── models/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── companies/
│       │   ├── drivers/
│       │   ├── vehicleOwners/
│       │   ├── vehicles/
│       │   ├── documents/
│       │   ├── marketplace/
│       │   ├── bids/
│       │   ├── directHiring/
│       │   ├── contracts/
│       │   ├── chat/
│       │   ├── notifications/
│       │   └── admin/
│       ├── sockets/
│       │   └── chat.socket.js
│       ├── utils/
│       ├── app.js
│       └── server.js
└── docs/
    ├── API.md
    ├── DATABASE.md
    └── SECURITY.md
Within each backend module, use a consistent pattern:
module-name/
├── module.model.js
├── module.routes.js
├── module.controller.js
├── module.service.js
└── module.validation.js
Keep business logic in services, not route files. Controllers should
handle HTTP input/output. Models define persistence. Middleware handles
authentication, role checks, validation, and errors.
9. Frontend Implementation Rules
- Build reusable layouts: PublicLayout, CompanyLayout,
  DriverLayout, VehicleOwnerLayout, and AdminLayout.
- Protect routes using the authenticated user's role, but remember
  frontend route guards are not security; backend middleware is
  mandatory.
- Build responsive pages for desktop and mobile.
- Use loading, empty, error, success, and disabled states on every
  data-driven page.
- Use reusable components for status badges, profile cards, document
  cards, bid cards, offer cards, tables, and confirmation dialogs.
- Do not store Firebase secrets or service-account credentials in
  frontend environment variables.
- Keep API calls in feature service files, not scattered across page
  components.
- Use optimistic updates carefully; never show a bid/offer as accepted
  until the backend confirms it.
- Add confirmation dialogs before accepting bids, rejecting offers,
  closing posts, or terminating contracts.
10. Security, Privacy, and Business Rules
Security is part of the MVP, not a later enhancement.
Authentication and authorisation
- Verify Firebase ID tokens on every protected API request.
- Load user role and account status from MongoDB.
- Apply role-based middleware and record ownership checks.
- Reject suspended/blocked users.
- Protect admin routes with server-side admin checks.
Data protection
- Keep identity, licence, registration, and insurance numbers private
  or masked.
- Restrict document access to the owner, relevant contract parties
  where justified, and authorised admins.
- Use private file storage or signed, short-lived URLs.
- Validate upload MIME type, extension, file size, and content where
  feasible.
- Never accept arbitrary storage URLs from the client as proof of
  upload.
- Use HTTPS in production.
- Keep secrets in environment variables and rotate exposed
  credentials.
Marketplace integrity
- A company can accept only bids on its own post.
- A provider can submit only permitted bids.
- Enforce post deadline and open status on the backend.
- Prevent duplicate bid submissions according to the chosen policy.
- Prevent accepting a bid twice.
- Enforce available position/vehicle quantity when awarding multiple
  bids.
- Use database transactions or idempotent operations with unique
  constraints for acceptance.
- A direct offer can create only one contract.
- A contract must identify its source bid or direct offer.
- Do not automatically select the lowest bid.
Chat security
- Authenticate Socket.IO connections using Firebase ID token
  verification.
- Verify conversation membership before joining a room.
- Verify membership before sending, reading, or retrieving messages.
- Rate-limit message sending and validate message size/type.
- Escape/render message text safely in the frontend.
- Validate and scan attachments; use private storage.
Operational safety
- Add rate limiting to authentication sync, search, messaging, and
  upload endpoints.
- Use Helmet and restrictive CORS configuration.
- Validate all input with schemas.
- Avoid logging access tokens, passwords, full document numbers, or
  private file URLs.
- Maintain audit logs for admin verification and account-status
  changes.
- Back up production database data.
11. Environment Variables
Create server/.env locally and add it to .gitignore.
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

JWT_SECRET_FOR_APP_ONLY=
Use Firebase Admin SDK credentials securely. If using a service-account
private key in an environment variable, handle newline escaping
correctly. Prefer the hosting provider's secret manager or workload
identity where available.

Create client/.env:
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
Firebase web configuration values are intended for client configuration,
but protect the project with Firebase security rules, authorised
domains, and appropriate restrictions. Never put Firebase Admin
credentials or Cloudinary API secrets in the client.
12. Local Development Setup
Prerequisites
- Node.js LTS
- npm
- Git
- MongoDB Atlas account or local MongoDB
- Firebase project with Authentication enabled
- Private file storage account for document uploads
Create the project
mkdir drivair
cd drivair
mkdir client server docs
Frontend
cd client
npm create vite@latest . -- --template react
npm install
npm install react-router-dom axios firebase lucide-react
npm install @tanstack/react-query
npm install -D tailwindcss @tailwindcss/vite
Follow the current Tailwind CSS + Vite setup instructions for the
installed Tailwind version.
Backend
cd ../server
npm init -y
npm install express mongoose cors dotenv firebase-admin socket.io helmet express-rate-limit zod bcryptjs
npm install -D nodemon
Use Firebase Authentication for user passwords; do not store or hash a
second password in MongoDB unless a separate authentication method is
deliberately introduced. bcryptjs can be omitted if not otherwise
needed.

Add scripts to server/package.json:
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
Start the backend and frontend in separate terminals:
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
Recommended initial health endpoint: GET /api/v1/health returns
{ "status": "ok" }.
13. MVP Implementation Plan --- Build in Milestones
Implement one milestone at a time. Keep the app runnable after every
milestone. Do not ask an IDE agent to generate the entire application in
one unreviewed step.
Milestone 0 --- Repository and foundation
Tasks - Create client/server/docs structure. - Configure Vite,
React, Express, environment loading. - Connect MongoDB. - Add
/api/v1/health. - Configure CORS, Helmet, central error handling, and
logging. - Add .gitignore and example environment files.

Acceptance criteria - Frontend loads locally. - Backend starts
without errors. - Health endpoint responds. - MongoDB connection is
confirmed. - No secrets are committed.
Milestone 1 --- Authentication and role-based access
Tasks - Configure Firebase Authentication. - Implement backend
Firebase token verification. - Implement users model and
/auth/sync. - Build sign-up, sign-in, sign-out, and session
persistence. - Add role onboarding for company, driver, and vehicle
owner. - Add protected layouts and role-based navigation. - Add admin
provisioning instructions.

Acceptance criteria - Each role can sign in and see the correct
portal. - Unauthenticated users cannot access protected APIs. - Users
cannot change their own role to admin. - Suspended users are denied
protected actions.
Milestone 2 --- Profiles, vehicles, and documents
Tasks - Build company, driver, and vehicle-owner profile forms. -
Build vehicle create/edit/list pages. - Implement private document
upload and metadata records. - Build document status UI. - Build admin
verification queue and approve/reject workflow. - Add configurable
document requirements.

Acceptance criteria - Users can manage only their own profile,
vehicles, and documents. - Admin can review and change document
status. - Rejection reason is visible to the owner. - Unauthorised users
cannot access private files. - Expired mandatory documents are clearly
flagged.
Milestone 3 --- Contract marketplace and bidding
Tasks - Build company create/edit/publish/close post flow. - Build
provider browse/search/filter pages. - Build contract post detail
page. - Build bid submission, edit, and withdrawal. - Build company bid
comparison and shortlist/reject actions. - Implement safe bid acceptance
and contract creation. - Add notifications for bid events.

Acceptance criteria - Company sees only its own management controls
and bids. - Providers see only eligible open posts. - Providers can
view/manage only their own bids. - Closed/expired posts reject new
bids. - Accepting a bid creates one contract and cannot be duplicated. -
Multiple awards never exceed the post's configured quantity.
Milestone 4 --- Direct hiring
Tasks - Build provider and vehicle search for companies. - Add
filters for location, provider type, experience, licence category,
vehicle type, capacity, availability, and verification status. - Build
public-safe provider profile views. - Implement direct offer creation
and received/sent offer pages. - Implement accept, reject, and
counter-offer. - Create contract exactly once when an offer is accepted.

Acceptance criteria - Company can send offers only to eligible
providers. - Provider can respond only to their own offers. - Invalid or
expired offers cannot be accepted. - Acceptance creates one contract.
Milestone 5 --- Chat messenger
Tasks - Build conversation list and chat window. - Implement
conversation creation/find with context. - Persist messages through REST
service. - Add authenticated Socket.IO delivery. - Add unread/read state
and last-message preview. - Add text-only chat first; add secure file
attachments after core chat works.

Acceptance criteria - Only conversation participants can read or
send messages. - Messages remain available after refresh/relogin. -
Real-time messages appear for connected participants. - Unread/read
state is consistent with backend data.
Milestone 6 --- Contracts, notifications, and admin completion
Tasks - Build contract list and detail pages for both parties. - Add
allowed contract status transitions. - Add in-app notifications for
bids, offers, chat, verification, and contracts. - Complete admin user
management and audit logs. - Add report/block workflow if required for
pilot safety.

Acceptance criteria - Both parties can view the same agreed
contract. - Users cannot alter another party's contract. - Notifications
link to the correct resource. - Admin actions are auditable.
Milestone 7 --- QA, deployment, and pilot
Tasks - Add unit tests for services and validation. - Add API
integration tests for permissions and workflows. - Test mobile and
desktop layouts. - Test upload limits and private access. - Configure
production secrets, CORS, domains, database backups, and logs. - Deploy
frontend and backend. - Run a small pilot with a limited number of
companies and providers. - Collect feedback before adding advanced
features.

Acceptance criteria - Core workflows pass end-to-end tests. - No
critical authorisation or data-leak issues remain. - Production
deployment is stable. - Pilot users can complete a post/bid or
direct-hire workflow.
14. Testing Checklist
Authentication and permissions
- [ ] Sign up and sign in for each role.
- [ ] Invalid/expired Firebase token is rejected.
- [ ] User cannot access another user's private records.
- [ ] User cannot elevate their role.
- [ ] Suspended user cannot create bids/offers.
Contract posts and bids
- [ ] Company can create, edit, publish, and close its own post.
- [ ] Another company cannot edit or view private management data.
- [ ] Provider can submit one permitted bid.
- [ ] Provider cannot bid after deadline or on a closed post.
- [ ] Company can shortlist/reject/accept only bids on its post.
- [ ] Lowest bid is not automatically accepted.
- [ ] Concurrent acceptance attempts cannot create duplicate
  contracts.
- [ ] Award quantity is enforced.
Direct hiring
- [ ] Company can search eligible providers.
- [ ] Company can send a direct offer.
- [ ] Only the recipient can accept/reject.
- [ ] Counter-offer updates are validated.
- [ ] Duplicate contract creation is prevented.
Documents
- [ ] Unsupported file types and oversized files are rejected.
- [ ] Private document URLs are not exposed publicly.
- [ ] Only owner/admin/authorised party can access documents.
- [ ] Admin decision and rejection reason are stored.
- [ ] Expired documents show the correct status.
Chat
- [ ] Non-participant cannot join a conversation room.
- [ ] Non-participant cannot retrieve messages through REST.
- [ ] Message is persisted before/with delivery.
- [ ] Unread count/read receipts update correctly.
- [ ] Message length and attachment size are limited.
15. MVP Release Definition
The MVP is ready for a controlled pilot when all of the following are
true:
- [ ] Authentication and all four roles work.
- [ ] Role-specific profiles can be completed.
- [ ] Vehicle owners can register and manage vehicles.
- [ ] Users can upload documents and admins can verify them.
- [ ] Companies can publish contract posts.
- [ ] Providers can submit and manage bids.
- [ ] Companies can compare and accept bids safely.
- [ ] Companies can search and send direct hiring offers.
- [ ] Providers can accept/reject/counter direct offers.
- [ ] Both workflows create a final contract.
- [ ] Participants can chat securely.
- [ ] Notifications cover important marketplace events.
- [ ] Core permission and security tests pass.
- [ ] Production deployment and backups are configured.
16. Future Roadmap (After MVP)
Release 2 --- Operations
- Trip creation and assignment.
- Trip status updates.
- GPS sharing with explicit driver consent and trip-based access.
- Location history and map view.
- Payment records and invoice generation.
- Reviews and ratings.
- Dispute handling.
Release 3 --- Intelligence and scale
- AI-assisted provider matching.
- Price comparison and market insights.
- Route optimisation.
- Fuel and maintenance tracking.
- Driver and vehicle performance analytics.
- WhatsApp/email notification integrations.
- Android/iOS applications.
- Multi-industry configuration and enterprise branches.
GPS limitation: Browser-based location sharing may stop when a
mobile browser is backgrounded or the device is locked. Do not promise
reliable background tracking from a normal website. A dedicated mobile
app and appropriate permissions may be required.
17. Instructions for an AI IDE Agent
Copy the following instructions into your IDE agent after adding this
README to the repository:
You are the senior full-stack engineer for DRIVAIR.

Read the entire README.md before writing code. Treat it as the project specification.

Development rules:
1. Implement the project milestone by milestone. Start with Milestone 0 only unless I explicitly ask for the next milestone.
2. First inspect the existing repository. Do not overwrite working files or regenerate the project unnecessarily.
3. Before coding, explain the files you will create/change and the implementation approach.
4. Use the agreed stack: React + Vite + Tailwind, Node.js + Express, MongoDB + Mongoose, Firebase Authentication/Admin SDK, and Socket.IO for chat.
5. Keep a modular monolith structure. Separate routes, controllers, services, models, validation, and middleware.
6. Enforce authentication, role-based access, and record ownership on the backend. Frontend route protection is not sufficient.
7. Validate all incoming data. Use consistent API responses and central error handling.
8. Never expose secrets, Firebase Admin credentials, private document URLs, or sensitive identity numbers.
9. Use amountPaise integer values for INR money fields.
10. Do not implement GPS, payment gateway, AI matching, trips, or advanced analytics in the MVP unless explicitly requested.
11. Write maintainable, readable code. Avoid unnecessary abstractions and unused dependencies.
12. Add tests for important business rules and authorisation.
13. Keep README and docs updated when implementation decisions change.
14. Do not fabricate environment values. Create .env.example with placeholders.
15. After each milestone, provide:
    - files created/changed,
    - commands to run,
    - environment variables required,
    - API endpoints implemented,
    - tests performed and results,
    - known limitations,
    - exact next step.

Important business rules:
- Lowest bid is not automatically the winner.
- Only the owning company can manage bids for its post.
- Only the intended provider can respond to a direct offer.
- A bid/offer can create a contract only once.
- Enforce the number of positions/vehicles that can be awarded.
- Only conversation participants can access messages.
- Document requirements vary by vehicle/service/state; do not assume every document is mandatory.

Begin by inspecting the repository and implementing Milestone 0. Do not jump ahead.
18. Project Development Principle
Build DRIVAIR in this order:

Secure foundation → verified profiles → contract marketplace → bidding
→ direct hiring → chat → contracts → pilot launch.

Do not start GPS, payments, or AI before the main hiring workflow works
reliably. The core differentiator of DRIVAIR's MVP is that companies can
choose between open competitive bidding and direct hiring, then
negotiate and finalise the agreement in one platform.