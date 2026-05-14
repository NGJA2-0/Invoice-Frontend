# Quick Fix: 401 Error with Hardcoded Credentials

## Problem
Backend is returning 401 even with correct hardcoded credentials (987654321V / admin123)

## Solution: Restart Backend Process

### Step 1: Kill Current Backend
In your **Terminal 1** (backend):
```
Ctrl+C
```
Wait 2 seconds for it to fully stop.

### Step 2: Clear Go Build Cache (Important!)
```powershell
go clean -cache
go clean -testcache
```

### Step 3: Start Backend Fresh
```bash
cd F:\NGJA\Invoice Backend
go run cmd/server/main.go
```

### Step 4: Watch for Startup Messages
You should see:
```
NGJA Invoice API running on :8080
created collection users
created collection dealer_verifications
created collection invoices
created indexes for users collection
created indexes for dealer_verifications collection
created indexes for invoices collection
```

### Step 5: Try Login Again
- Go to http://localhost:5173/auth/login
- NIC: `987654321V`
- Password: `admin123`
- Click Login

### Step 6: Watch Backend Console
You should see:
```
attempting login for NIC: 987654321V
test user login successful: Admin User (role: admin)
login successful for NIC: 987654321V
```

---

## If Still Failing

Check backend console output:
- Does it say `attempting login for NIC`? If not, request isn't reaching backend
- Does it say `test user login successful`? If yes, frontend issue
- Does it say `password mismatch`? Check exact password

---

## Also Restart Frontend (Just in Case)
Terminal 2:
```
Ctrl+C
npm run dev
```

Then try login again.
