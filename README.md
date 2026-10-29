# MotoCare — Smart Vehicle Maintenance Management Platform

**MotoCare** is a production-grade, secure, database-driven vehicle maintenance management SaaS platform engineered specifically for motorcycle and car owners.

Built for the **Bangladesh** automotive landscape:
- **Default Currency:** BDT (৳)
- **Distance Unit:** Kilometers (KM)
- **Timezone:** Asia/Dhaka
- **Compliance:** BRTA Tax Token, Fitness Certificate, Registration, and Insurance tracking

---

## 🌟 Key Features & Engineering Highlights

### 1. Smart Maintenance Record Replacement
- **Storage-Saving Architecture:** Avoids database bloat by maintaining one active, authoritative maintenance state per vehicle component and maintenance task (`vehicleId` + `partId` + `maintenanceTaskId`).
- Uses MongoDB compound unique index and upsert operations.
- Simultaneously logs to an immutable historical collection for complete audit trails.

### 2. Dedicated Engine Oil Management Module
- Tracks brand, product name, viscosity grade (e.g. 10W-40, 5W-30), composition (Fully Synthetic, Semi-Synthetic, Mineral), oil quantity, and filter replacements.
- **Dual Limit Date Prediction:** Algorithmically analyzes your rolling daily driving rate to predict your next oil change date, while comparing against your manufacturer calendar deadline (e.g. 3 months). The platform automatically selects whichever limit occurs first!
- Interactive visual progress bar displaying real-time oil life depletion percentage.

### 3. Smart Odometer & Rolling Average Tracking
- Manual log entry with date timestamping.
- Calculates your **rolling average daily distance (KM/day)** without fabricating false statistics.
- **Controlled Correction Workflow:** Detects if an entered odometer reading is lower than the vehicle's current recorded odometer, requiring explicit confirmation and an audit reason (e.g., speedo console swap under warranty).

### 4. Comprehensive Parts & Components Catalog
- Pre-loaded with categorized parts for **motorcycles** (Engine Oil, Oil Filter, Air Filter, Spark Plug, Valve Clearance, Clutch Plates, Drive Chain Cleaning & Lubrication, Fork Oil, Brake Pads) and **cars** (Cabin AC Filter, Coolant, ATF/CVT Transmission Fluid, Tyre Rotation, Shocks, etc.).
- Complete support for user-defined **custom parts**.

### 5. BRTA Tax Token & Document Expiry Tracking
- Color-coded validity countdowns:
  - **GREEN:** More than 30 days validity remaining.
  - **YELLOW:** 30 days or fewer remaining (approaching renewal).
  - **RED:** Expired (high risk of traffic fines).
- Estimated renewal fees in BDT (৳).

### 6. Expense Analytics & Cost Per Kilometer
- Visualized using **Recharts**:
  - Monthly spending trends.
  - Proportional category cost splits.
  - Real-time calculation of **Maintenance Cost per Kilometer (৳/KM)**.

### 7. Multi-Step Onboarding Wizard
- Seamless 5-step registration:
  1. Vehicle Type (Motorcycle vs Car)
  2. Manufacturer (Yamaha, Honda, Suzuki, Bajaj, TVS, Toyota, Nissan, Hyundai, etc.)
  3. Dynamic Model selection (tailored to selected brand with custom entry)
  4. Vehicle Details (Reg number, CC, fuel type, odometer)
  5. Document Expiry configuration

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router, Server Components & Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Automotive fleet/SaaS aesthetic, light & dark theme variables)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Database:** MongoDB Atlas with Mongoose ODM (includes seamless zero-config fallback mode for instant local evaluation)
- **Authentication:** Firebase Authentication (Google Sign-In, Email/Password, Password Recovery) & Firebase Admin SDK
- **Testing:** Vitest for critical calculation unit tests
- **Deployment:** Vercel

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd Vehicle-maintain
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/motocare?retryWrites=true&w=majority

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Note:** MotoCare includes an intelligent zero-config developer fallback mode. If you don't immediately configure cloud credentials, you can click **"Sign In as Demo Pilot"** on `/login` to test the entire SaaS platform with pre-seeded data right away!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

### 4. Run Unit Tests
```bash
npm test
```
Executes the Vitest test suite covering:
- Rolling daily average distance calculations & timestamp deduplication
- Distance driven & remaining kilometer calculations
- Oil usage percentage & clamp rules
- Dual-limit date predictions (distance-first vs calendar-first)
- Status badge rules (GREEN, YELLOW, RED, GRAY)
- Financial analytics and category rollups

---

## 📦 Database Seeding

You can seed realistic data at any time via:
1. **Web Dashboard:** Click the "Load Sample Yamaha R15" button if your garage is empty, or call `POST /api/seed`.
2. **Terminal:**
```bash
npx tsx scripts/seed.ts
```

---

## 🌐 Vercel Deployment Instructions

1. Push your code to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), click **"Add New Project"** and select this repository.
3. In **Environment Variables**, add:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. Click **Deploy**. Vercel will automatically run `next build` and deploy all serverless API Route Handlers and optimized frontend pages.

---

## 🔒 Security Architecture

- **Token Verification:** All protected backend API routes verify Firebase ID tokens via the Firebase Admin SDK.
- **Client Identity Immunity:** Backend APIs derive user identity (`ownerId`) strictly from the verified server token—client-submitted `userId` fields are never trusted.
- **Strict Data Isolation:** Multi-tenant vehicle and maintenance records are isolated by `ownerId` across all queries and indexes.
- **Input Sanitization:** Every API payload is validated against strict **Zod** schemas.
