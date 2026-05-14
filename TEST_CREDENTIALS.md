# Test Credentials (Development Only)

## Quick Access

### Regular User
- **NIC:** `123456789V`
- **Password:** `test123`
- **Role:** user
- **Status:** approved

### Admin User
- **NIC:** `987654321V`
- **Password:** `admin123`
- **Role:** admin
- **Status:** approved

---

## How to Use

1. **Start Backend & Frontend:**
   ```bash
   # Terminal 1
   cd F:\NGJA\Invoice Backend
   go run cmd/server/main.go

   # Terminal 2
   cd f:\NGJA\Invoice Frontend
   npm run dev
   ```

2. **Go to Login Page:**
   ```
   http://localhost:5173/auth/login
   ```

3. **Click on Test Credentials:**
   - The login page shows two buttons to auto-fill test credentials
   - Click "User" or "Admin" button
   - Fields auto-populate
   - Click "Login"

4. **Or Manually Enter:**
   - NIC: `123456789V` and Password: `test123` (user)
   - NIC: `987654321V` and Password: `admin123` (admin)

---

## What You Can Test

### As Regular User (123456789V / test123)
- ✅ Dashboard
- ✅ Dealer Registration (upload documents)
- ✅ Create Invoice
- ✅ View My Invoices
- ✅ Edit Profile

### As Admin (987654321V / admin123)
- ✅ Admin Dashboard
- ✅ View Pending Registrations
- ✅ Approve/Reject Dealers
- ✅ View All Users
- ✅ View Approved/Rejected Dealers

---

## Notes

- **Development Only:** Remove test credentials before production
- **No Database Required:** Test users bypass database, work instantly
- **Pre-approved Status:** Test accounts are already marked as "approved"
- **Real Users:** You can still create real users via signup - they'll be saved to MongoDB

---

## Remove Credentials Before Production

To remove test logins, delete/comment out the `testUsers` map in:
```
F:\NGJA\Invoice Backend\internal\services\auth_service.go
```

And remove the credentials display box from:
```
f:\NGJA\Invoice Frontend\src\pages\auth\Login.jsx
```
