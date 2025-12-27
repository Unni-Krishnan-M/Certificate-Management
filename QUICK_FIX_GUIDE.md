# Quick Fix Guide - Web Page Not Showing All Options

## Most Common Issues & Immediate Solutions

### 🚨 IMMEDIATE CHECKS

1. **Are both servers running?**
   ```bash
   # Run this command:
   netstat -an | findstr ":8080 :3000"
   
   # You should see both ports listed
   # If not, start the missing service(s)
   ```

2. **Quick restart everything:**
   ```bash
   # Use the provided script:
   start-system.bat
   
   # Or manually:
   # Terminal 1: cd backend && mvnw spring-boot:run
   # Terminal 2: cd frontend && npm start
   ```

### 🔧 STEP-BY-STEP TROUBLESHOOTING

#### Step 1: Check System Status
- Run `check-status.bat` or manually check ports
- Open http://localhost:3000 - should show login page
- Open http://localhost:8080/api/health - should show JSON response

#### Step 2: Test Authentication
1. Go to http://localhost:3000
2. Login with: `student1` / `password123`
3. Check browser console (F12) for errors
4. Look for the diagnostic panel in top-right corner

#### Step 3: Use Diagnostic Tools
1. **Browser diagnostic panel** (top-right corner of the app)
   - Shows auth status, API status, component status
   - Use "Clear & Reload" button if needed

2. **API Test Page**: http://localhost:3000/test-api.html
   - Test backend connection
   - Test authentication
   - Test API endpoints

#### Step 4: Check Browser Console
1. Press F12 to open developer tools
2. Look at Console tab for red errors
3. Look at Network tab to see if API calls are failing

### 🎯 SPECIFIC FIXES

#### Problem: "Blank dashboard" or "Missing sidebar options"
**Solution:**
```javascript
// Clear browser storage and reload
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

#### Problem: "Failed to fetch data" errors
**Solutions:**
1. Check if backend is running: `netstat -an | findstr :8080`
2. Restart backend: `cd backend && mvnw spring-boot:run`
3. Check CORS settings (already configured)

#### Problem: "401 Unauthorized" errors
**Solutions:**
1. Login again - token may have expired
2. Clear localStorage: `localStorage.clear()`
3. Check if user has correct role (STUDENT/STAFF)

#### Problem: Components not rendering
**Solutions:**
1. Check browser console for import errors
2. Verify all files exist in frontend/src/components/
3. Restart frontend: `cd frontend && npm start`

### 🚀 NUCLEAR OPTION (Reset Everything)

If nothing else works:

```bash
# 1. Stop all services (Ctrl+C in terminals)

# 2. Clear browser data
# - Open browser settings
# - Clear browsing data for localhost
# - Or use incognito/private mode

# 3. Restart everything
start-system.bat

# 4. Wait 30 seconds for services to fully start

# 5. Go to http://localhost:3000

# 6. Login with: student1 / password123
```

### 📋 VERIFICATION CHECKLIST

After fixing, verify these work:

- [ ] Login page loads at http://localhost:3000
- [ ] Can login with student1/password123
- [ ] Dashboard shows with sidebar options
- [ ] Can navigate between Dashboard, Certificates, Upload
- [ ] Diagnostic panel shows all green checkmarks
- [ ] No red errors in browser console

### 🆘 STILL NOT WORKING?

1. **Check the diagnostic panel** - it will show specific errors
2. **Use the API test page** - test each component individually
3. **Check browser console** - look for specific error messages
4. **Try different browser** - rule out browser-specific issues
5. **Check the troubleshooting guide** - TROUBLESHOOTING_GUIDE.md

### 📞 COMMON ERROR MESSAGES

| Error | Meaning | Fix |
|-------|---------|-----|
| "Network Error" | Backend not accessible | Start backend, check port 8080 |
| "401 Unauthorized" | Not logged in or token expired | Login again |
| "Failed to fetch" | API call failed | Check backend status |
| "Cannot read property" | Component error | Check browser console |
| Blank page | JavaScript error | Check browser console |

### 🎯 MOST LIKELY CAUSE

Based on the symptoms "not showing all options", the most likely causes are:

1. **User not properly authenticated** (90% of cases)
2. **Backend API not responding** (5% of cases)  
3. **Frontend component error** (5% of cases)

**Quick test:** Open browser console (F12) and look for red error messages. This will immediately tell you what's wrong.