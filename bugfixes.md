# Bug Fixes Log

This document tracks bugs encountered and their resolutions for the Logistics Investment Optimizer application.

## 2025-06-20

### Authentication Connection Error
**Bug**: Users experiencing "Failed to fetch" error when attempting to login, with console showing `net::ERR_CONNECTION_REFUSED` for Supabase auth endpoints.

**Root Cause**: 
- Local Supabase instance services were partially stopped after initial setup
- Database migrations had been applied but auth service was unstable
- Some Docker containers were in stopped state: `[supabase_imgproxy_logis supabase_pg_meta_logis supabase_studio_logis supabase_edge_runtime_logis supabase_pooler_logis]`

**Resolution**:
1. Performed complete Supabase restart: `npm run supabase:stop && npm run supabase:start`
2. Verified all services started properly including Studio, Edge Runtime, and Pooler
3. Confirmed test user `demo@example.com` exists in auth system
4. All auth endpoints now responding correctly on `http://127.0.0.1:54321`

**Status**: ✅ Fixed

**Test Credentials**: demo@example.com / demo123

---

### Blank White Screen After Login
**Bug**: Application displays blank white screen after successful login, appearing as if React components are not rendering.

**Root Cause**: 
- Supabase local services were partially stopped, causing authentication and data loading issues
- React app unable to complete initialization due to backend connectivity problems
- User authentication succeeded but app state couldn't be properly initialized

**Symptoms**:
- Login form works and redirects to dashboard
- White/blank screen instead of dashboard content
- No obvious console errors in browser
- Dev server running normally

**Resolution**:
1. Restart Supabase completely: `npm run supabase:stop && npm run supabase:start`
2. Verify all Docker containers are healthy
3. Confirm test user exists in authentication system
4. Clear browser cache if necessary

**Validation Steps**:
- Check that React root div contains content using browser inspector
- Verify all Supabase containers show "healthy" status in `docker ps`
- Test full login flow from login page to dashboard

**Status**: ✅ Fixed

**Prevention**: Monitor Docker container health regularly and restart Supabase if any services show as stopped

---

### Saved Shipments Not Appearing in Sidebar
**Bug**: When clicking Save button on a shipment, the save operation appears to start but the shipment doesn't appear in the sidebar folders.

**Root Cause**: 
- Authentication session was not properly established after login
- App was missing Supabase auth tokens required for database operations
- Saved shipments require proper `folder_id` assignment to appear in folders

**Symptoms**:
- Save button click shows "🚀 Saving shipment..." in console
- No errors displayed to user
- Sidebar folder counts remain (0)
- Shipment doesn't appear in any folder

**Resolution**:
1. **Auth Issue**: User needs to log out and log back in to properly establish Supabase auth session
2. **Token Storage**: Verify auth tokens are stored in localStorage under `sb-127-auth-token`
3. **Development Mode**: Added `demo@example.com` to dev account list in ShipmentHeader to bypass subscription restrictions
4. **Database**: Confirmed shipments table exists and can accept saves (tested with manual insert)

**Validation Steps**:
- Log out and log back in to establish proper auth session
- Check localStorage for `sb-127-auth-token` key with valid access token
- Verify save operation completes without console errors
- Confirm shipment appears in appropriate sidebar folder

**Status**: ✅ Fixed (Auth session issue resolved)

**Code Changes Made**:
```typescript
// In ShipmentHeader.tsx - Allow demo user to save
const isDev = user?.email === 'dev@example.com' || user?.email === 'demo@example.com';
```

**Test Procedure**: 
1. Login as demo@example.com / demo123
2. Click Save button 
3. Verify no upgrade modal appears
4. Check that shipment is saved to database