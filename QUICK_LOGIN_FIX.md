# 401 Login Error - Quick Fix

## Most Likely Causes (in order)

1. **User doesn't exist in database** (Most Common)
   - You may be using a different NIC than you signed up with
   - Signup may not have completed successfully
   - Check: http://localhost:8080/api/v1/debug/users

2. **Password is incorrect**
   - Password is case-sensitive
   - No spaces before/after
   - Must match exactly what you signed up with

3. **Database not saving signup**
   - MongoDB connection issue
   - Database permissions issue
   - Check backend console for "user created successfully"

---

## Immediate Fix Steps

### Step 1: Verify Backend is Logging
Restart backend:
```bash
cd F:\NGJA\Invoice Backend
go run cmd/server/main.go
```

Look for console output with the new detailed logs.

### Step 2: Check Database
```
http://localhost:8080/api/v1/debug/users
```
- If empty → users not being saved
- If has users → check if your NIC is there

### Step 3: Sign Up Fresh
1. Go to http://localhost:5173/auth/signup
2. **Use these exact values:**
   - Full Name: `TestUser`
   - NIC: `200000001V`
   - Password: `Test@123`
3. Click Sign Up
4. Check backend console for success message
5. Visit debug endpoint again - should see new user

### Step 4: Try Login
1. Go to http://localhost:5173/auth/login
2. Use same NIC and password
3. Check backend console - should see login attempt details

---

## What Each Backend Log Means

```
user created successfully: NIC=200000001V, Role=user
→ Signup worked ✅

attempting login for NIC: 200000001V
user found: TestUser, comparing password...
login successful for NIC: 200000001V
→ Login worked ✅

user not found with NIC: 200000001V
→ User doesn't exist in DB ❌

password mismatch for NIC: 200000001V
→ Wrong password ❌
```

---

## Browser Check (DevTools - F12)

### Network Tab
- Find the login request
- Status should be 401 (error) or 200 (success)
- Look at Response to see error details

### Console Tab  
- No CORS errors? ✅
- No fetch errors? ✅
- All green? Database issue likely

---

## If None of This Works

The issue is likely:
1. **MongoDB not accessible** - Check connection string in `.env`
2. **Collections not created** - Stop backend, let it reinitialize
3. **Port conflict** - Check if :8080 is in use

Try:
```bash
# Kill everything and restart fresh
Ctrl+C in both terminals
cd F:\NGJA\Invoice Backend
go run cmd/server/main.go
# Wait for "created collection users..." messages
# Then start frontend
```
