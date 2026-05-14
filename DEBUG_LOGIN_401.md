# 401 Login Error - Diagnostic Guide

## Quick Diagnostic Steps

### 1. **Restart Backend with New Logging**
```bash
cd F:\NGJA\Invoice Backend
go run cmd/server/main.go
```

Watch the console for detailed logs about signup and login attempts.

### 2. **Check Database Contents**
Open your browser and visit:
```
http://localhost:8080/api/v1/debug/users
```

This will show you:
- How many users are in the database
- All user fields (NIC, role, status, etc.)
- Helps verify if your signup actually worked

### 3. **Test Signup First**
**Frontend:** http://localhost:5173/auth/signup

Fill in:
- Full Name: `Test User`
- NIC: `199012345V`
- Password: `TestPass123`
- Click Sign Up

**Watch backend console for:**
```
signup parse error: ...
signup validation error: ...
user created successfully: NIC=199012345V, Role=user
```

### 4. **Then Test Login**
**Frontend:** http://localhost:5173/auth/login

Use same credentials:
- NIC: `199012345V`
- Password: `TestPass123`

**Watch backend console for:**
```
login attempt with NIC: 199012345V
user found: Test User, comparing password...
login successful for NIC: 199012345V
```

---

## Common Issues & Solutions

### Issue 1: User Not Found (401)
**Console shows:** `user not found with NIC 199012345V`

**Solutions:**
- ✅ Did you complete signup first?
- ✅ Check `/debug/users` endpoint to verify user exists
- ✅ Make sure NIC exactly matches (case-sensitive)
- ✅ Check database directly in MongoDB Atlas

### Issue 2: Password Mismatch (401)
**Console shows:** `password mismatch for NIC 199012345V`

**Solutions:**
- ✅ Verify password is exactly the same (case-sensitive)
- ✅ No extra spaces before/after
- ✅ Re-signup with a new NIC if unsure

### Issue 3: Validation Error (400)
**Console shows:** `login validation error`

**Solutions:**
- ✅ Ensure NIC is not empty
- ✅ Ensure password is not empty
- ✅ Check browser DevTools Console for details

### Issue 4: Parse Error (400)
**Console shows:** `login parse error`

**Solutions:**
- ✅ Check browser DevTools Network tab
- ✅ Verify Content-Type is `application/json`
- ✅ Check request body is valid JSON

---

## Debug Endpoint Reference

### Check All Users
```
GET http://localhost:8080/api/v1/debug/users
```

**Response:**
```json
{
  "total": 2,
  "users": [
    {
      "id": "...",
      "fullName": "Test User",
      "nic": "199012345V",
      "password": "hashed...",
      "role": "user",
      "status": "not_verified",
      "createdAt": "2026-05-14T...",
      "updatedAt": "2026-05-14T..."
    }
  ]
}
```

---

## Browser DevTools Debugging

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try login
4. Click on the request to `/api/v1/auth/login`
5. Check:
   - **Status:** Should be 401 (unauthorized) or 200 (success)
   - **Request Body:** Verify NIC and password
   - **Response Body:** Check error message

### Console Tab
1. Open DevTools Console
2. Try login
3. Check for any JavaScript errors
4. Look for fetch errors or CORS issues

---

## Step-by-Step Testing Checklist

- [ ] Backend running (`go run cmd/server/main.go`)
- [ ] Frontend running (`npm run dev`)
- [ ] Checked `/debug/users` endpoint - shows database has users
- [ ] Signed up with new account (full name, NIC, password)
- [ ] Saw success message in frontend
- [ ] Checked backend logs show "user created successfully"
- [ ] Checked `/debug/users` - new user appears in list
- [ ] Tried login with same NIC and password
- [ ] Checked backend logs for login attempt
- [ ] Login successful or see specific error in logs

---

## If Still Having Issues

1. **Restart everything:**
   ```bash
   # Terminal 1: Kill backend (Ctrl+C), restart
   go run cmd/server/main.go
   
   # Terminal 2: Kill frontend (Ctrl+C), restart
   npm run dev
   ```

2. **Clear browser cache:**
   - DevTools → Application → Clear Site Data
   - Or use Incognito/Private window

3. **Check MongoDB connection:**
   - Verify connection string in `.env`
   - Check MongoDB Atlas cluster is accessible
   - Verify whitelist includes your IP

4. **Check logs carefully:**
   - Backend console output has detailed error messages
   - Frontend DevTools Console has JavaScript errors
   - Browser Network tab shows exact HTTP status

---

## Next: After Login Works

Once login is working:
1. Test dealer registration (/user/dealer-registration)
2. Test admin approval flow (/admin/pending-registrations)
3. Test invoice creation (/user/create-invoice)
4. Remove debug endpoint before production

