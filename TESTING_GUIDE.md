# Backend Integration Testing Checklist

## 🚀 Quick Start

### Prerequisites
- Go 1.22+ installed
- Node.js 18+ installed  
- MongoDB Atlas account (or local MongoDB)
- Both terminal windows ready

### Step 1: Start the Backend
```bash
cd F:\NGJA\Invoice Backend
go run cmd/server/main.go
```

**Expected Output:**
```
NGJA Invoice API running on :8080
created collection users
created collection dealer_verifications
created collection invoices
created indexes for users collection
created indexes for dealer_verifications collection
created indexes for invoices collection
```

### Step 2: Start the Frontend
```bash
cd f:\NGJA\Invoice Frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ Integration Testing Flow

### Test 1: Authentication (Sign Up & Login)
**Navigate:** http://localhost:5173/auth/signup

1. **Sign Up**
   - [ ] Fill full name: "Test User"
   - [ ] NIC: "199012345V"  
   - [ ] Password: "SecurePass123"
   - [ ] Click "Sign Up"
   - [ ] **Expected:** Success toast, redirected to login

2. **Login**
   - [ ] Navigate to http://localhost:5173/auth/login
   - [ ] Enter NIC: "199012345V"
   - [ ] Enter Password: "SecurePass123"
   - [ ] Click "Login"
   - [ ] **Expected:** Success toast, redirected to /user/dashboard
   - [ ] **Check MongoDB:** Users collection should have new document

### Test 2: Dealer Registration (Verification Flow)
**Navigate:** /user/dealer-registration (after login)

1. **Submit Verification Documents**
   - [ ] Upload "Gem Dealer License" (any PDF file)
   - [ ] Upload "Jewellery License" (any PDF file)
   - [ ] Enter TIN: "TIN-12345"
   - [ ] Enter VAT: "VAT-98765"
   - [ ] Upload "Customs Exporter License" (any PDF file)
   - [ ] Click "Submit for Verification"
   - [ ] **Expected:** Success toast, files uploaded to `uploads/` folder
   - [ ] **Check MongoDB:** dealer_verifications collection should have new document

### Test 3: Admin Verification (Approve/Reject)
**Navigation:** Create new admin account with role="admin", then go to /admin/dashboard

1. **View Pending Registrations**
   - [ ] Login as admin (create second account with admin role)
   - [ ] Navigate to /admin/pending-registrations
   - [ ] **Expected:** See the user's registration from Test 2
   - [ ] Click "Approve" or "Reject"
   - [ ] **Expected:** Success toast, users collection updated with status="approved"

### Test 4: Dashboard Statistics (Dynamic Data)
**Navigate:** /user/dashboard (after user approval)

1. **Check User Dashboard**
   - [ ] Invoices count should be "0" initially
   - [ ] Pending should be "0"
   - [ ] Approved should be "0"
   - [ ] Status badge shows "Approved"

2. **Check Admin Dashboard**
   - [ ] Approved count matches actual approved dealers
   - [ ] Rejected count matches actual rejected dealers
   - [ ] Pending count matches pending registrations

### Test 5: Invoice Management
**Navigate:** /user/create-invoice (after dealer approval)

1. **Create Invoice**
   - [ ] Click "Start Invoice"
   - [ ] Select Template 1
   - [ ] Fill invoice details (buyer, items, amounts, etc.)
   - [ ] Click "Save as Draft" or "Submit"
   - [ ] **Expected:** Success toast
   - [ ] **Check MongoDB:** invoices collection should have new document

2. **View Invoice**
   - [ ] Navigate to /user/my-invoices
   - [ ] **Expected:** See created invoice in list with correct status
   - [ ] Click on invoice to view details

### Test 6: Admin Operations
**Navigate:** /admin/dashboard (as admin user)

1. **View Approved Dealers**
   - [ ] Click on "Approved Dealers" tab
   - [ ] **Expected:** See list of approved users
   - [ ] List should be dynamic based on database status

2. **View Rejected Dealers**
   - [ ] Click on "Rejected Dealers" tab
   - [ ] **Expected:** See list of rejected users (if any)

---

## 🔍 Verification Checklist

### MongoDB Collections
Check MongoDB Atlas or local MongoDB:

- [ ] **users** collection
  - Contains at least 1 user document
  - Fields: _id, fullName, nic, password (hashed), role, status, tin, vat, contactInfo, createdAt, updatedAt

- [ ] **dealer_verifications** collection
  - Contains registration attempts
  - Fields: _id, userId, gemDealerLicense, jewelleryLicense, customsExporterLicense, tin, vat, status, submittedAt

- [ ] **invoices** collection
  - Empty initially (populated after invoice creation)
  - Fields: _id, invoiceNumber, templateType, exporterDetails, buyerDetails, valuationItems, totalUsd, status, createdBy, createdAt, updatedAt

### File Uploads
- [ ] Check `F:\NGJA\Invoice Backend\uploads\` folder
- [ ] Contains uploaded license files from dealer registrations

### API Network Calls
Open browser DevTools (F12) → Network tab:

- [ ] POST /auth/signup - Status 200/201
- [ ] POST /auth/login - Status 200
- [ ] POST /verifications/submit - Status 200/201
- [ ] GET /admin/registrations/pending - Status 200
- [ ] PUT /admin/dealers/{userId}/approve - Status 200
- [ ] POST /invoices - Status 201
- [ ] GET /users/{userId}/invoices - Status 200

### Frontend Behavior
- [ ] No console errors
- [ ] Dashboards show dynamic counts (not hardcoded values)
- [ ] Status updates reflect in real-time
- [ ] Toasts appear on success/error

---

## 🐛 Troubleshooting

### Issue: Backend won't start
- [ ] Check MongoDB connection string in `.env`
- [ ] Verify MongoDB Atlas cluster is accessible
- [ ] Check port 8080 is not in use

### Issue: Frontend can't connect to backend
- [ ] Check `VITE_API_BASE_URL` in `.env`
- [ ] Ensure backend is running on port 8080
- [ ] Check browser console for CORS errors
- [ ] Look for network errors in DevTools

### Issue: File uploads not working
- [ ] Verify `uploads/` folder exists at `F:\NGJA\Invoice Backend\uploads\`
- [ ] Check file permissions
- [ ] Verify `MAX_UPLOAD_SIZE_MB` is sufficient

### Issue: Data not persisting
- [ ] Verify MongoDB collections exist
- [ ] Check MongoDB connection status
- [ ] Look at backend console for database errors

---

## 📝 API Endpoints Summary

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login

### Users
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user profile
- `GET /users/{userId}/invoices` - Get user's invoices

### Verifications
- `POST /verifications/submit` - Submit dealer registration
- `GET /verifications/{userId}` - Get verification status
- `PUT /verifications/{userId}` - Update verification documents

### Invoices
- `POST /invoices` - Create new invoice
- `GET /invoices/{id}` - Get invoice by ID
- `PUT /invoices/{id}` - Update draft invoice
- `DELETE /invoices/{id}` - Delete invoice
- `GET /invoices/generate-number` - Generate next invoice number

### Admin
- `GET /admin/registrations/pending` - Get pending registrations
- `GET /admin/users` - Get all users
- `PUT /admin/dealers/{userId}/approve` - Approve dealer
- `PUT /admin/dealers/{userId}/reject` - Reject dealer

---

## ✨ What's Clean Now

✅ **No Hard-coded Mock Data**
- User credentials are fetched from database
- Invoice lists are dynamic
- Dealer registrations are stored in MongoDB
- All statistics are calculated from real data

✅ **Database Collections**
- Schema validation ensures data integrity
- Unique indexes on critical fields (NIC, invoiceNumber)
- Proper indexes for query performance

✅ **API Integration**
- All frontend forms submit to backend
- All lists load from backend database
- All updates persist to MongoDB
- Proper error handling with toast notifications

---

## 🎯 Next Steps After Testing

If all tests pass:
1. Deploy backend to production (Azure App Service, Render, etc.)
2. Update `VITE_API_BASE_URL` to production backend URL
3. Deploy frontend to production (Vercel, Netlify, etc.)
4. Set up proper database backups
5. Configure API authentication tokens (JWT recommended)
6. Add rate limiting to API endpoints
7. Set up API logging and monitoring
