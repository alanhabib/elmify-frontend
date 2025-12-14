# Xcode Cloud CI Scripts

This directory contains scripts that run during Xcode Cloud builds.

## 📁 Files

### `ci_post_clone.sh`
**When it runs:** After Xcode Cloud clones your repository, before the Xcode build starts.

**What it does:**
1. ✅ Validates all required environment variables are present
2. 📦 Installs Node.js dependencies (`npm ci` or `npm install`)
3. 🧹 Cleans Metro bundler cache
4. 🍫 Installs CocoaPods dependencies (`pod install`)
5. ✓ Verifies the setup was successful

**Exit codes:**
- `0` - Success, Xcode build will proceed
- `1` - Failure, build will stop

---

## 🔑 Required Environment Variables

These must be configured in **App Store Connect → Xcode Cloud → Environment → Shared**:

| Variable | Type | Description | Secret? |
|----------|------|-------------|---------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | String | Clerk authentication key | ✅ Yes |
| `EXPO_PUBLIC_API_BASE_URL` | URL | Backend API base URL | ❌ No |
| `EXPO_PUBLIC_MEDIA_BASE_URL` | URL | Media server base URL | ❌ No |
| `EXPO_PUBLIC_STREAM_BASE_URL` | URL | Audio streaming base URL | ❌ No |
| `EXPO_PUBLIC_MINIO_BASE_URL` | URL | Object storage base URL | ❌ No |
| `EXPO_PUBLIC_DEBUG_API` | Boolean | Enable API debug logs | ❌ No |
| `EXPO_PUBLIC_ENVIRONMENT` | String | Environment name (production) | ❌ No |

**Production values:**
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZWxtaWZ5LnN0b3JlJA
EXPO_PUBLIC_API_BASE_URL=https://elmify-backend-production.up.railway.app/api/v1
EXPO_PUBLIC_MEDIA_BASE_URL=https://elmify-backend-production.up.railway.app
EXPO_PUBLIC_STREAM_BASE_URL=https://elmify-backend-production.up.railway.app
EXPO_PUBLIC_MINIO_BASE_URL=https://elmify-backend-production.up.railway.app
EXPO_PUBLIC_DEBUG_API=false
EXPO_PUBLIC_ENVIRONMENT=production
```

---

## 🧪 Testing Locally

Before pushing to GitHub, test the CI scripts locally:

```bash
# Run the local test script
./scripts/test-ci-locally.sh
```

This will:
1. Load your local `.env` file
2. Simulate Xcode Cloud environment
3. Run `ci_post_clone.sh`
4. Verify everything installed correctly

**Expected output:**
```
✅ [SUCCESS] All required environment variables are present
✅ [SUCCESS] npm dependencies installed
✅ [SUCCESS] CocoaPods dependencies installed
✅ [SUCCESS] Workspace verified: Elmify.xcworkspace
✅ [SUCCESS] CI Setup Complete
```

---

## 🚀 Xcode Cloud Setup

### 1. Configure Environment Variables

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to: **Apps → Elmify → Xcode Cloud**
3. Click **Environment** (in the sidebar)
4. Click **Manage Environment Variables**
5. Add each variable from the table above
6. Mark sensitive values (keys, secrets) as **Secret**
7. Enable **Shared** so all workflows can use them

### 2. Connect GitHub Repository

1. In Xcode Cloud, click **Create Workflow**
2. Select your GitHub repository
3. Choose the branch to build (`main`)
4. Configure build settings:
   - **Platform:** iOS
   - **Xcode Version:** Latest
   - **Scheme:** Elmify
   - **Archive:** ✅ Enabled

### 3. Configure Build Triggers

Choose when to trigger builds:
- **Branch Changes:** Automatically build on push to `main`
- **Pull Requests:** Build on PR creation
- **Tag:** Build on git tag creation
- **Manual:** Trigger builds manually

**Recommended for production:**
```
✅ Branch Changes: main
✅ Manual
❌ Pull Requests (optional, for testing)
```

### 4. Configure Post-Build Actions

After successful build:
- ✅ **TestFlight:** Automatically upload to internal testing
- ❌ **App Store:** Require manual approval

### 5. Start First Build

1. Click **Start Build**
2. Select branch: `main`
3. Monitor build logs
4. Check for script execution:
   ```
   🔍 Validating Environment Variables
   📦 Installing Node.js v20
   📦 Installing npm Dependencies
   🍫 Installing CocoaPods Dependencies
   ✅ CI Setup Complete
   ```

---

## 📊 Monitoring Builds

### View Build Logs

1. Go to **App Store Connect → Xcode Cloud → Builds**
2. Click on a build
3. View logs:
   - **Clone** - Git clone operation
   - **Post-Clone** - `ci_post_clone.sh` execution ⭐
   - **Build** - Xcode build phase
   - **Archive** - Archive creation
   - **Upload** - TestFlight upload

### Common Issues

#### ❌ "Missing required environment variable"
**Cause:** Environment variable not configured in Xcode Cloud.

**Fix:**
1. Go to App Store Connect → Environment
2. Add the missing variable
3. Rebuild

---

#### ❌ "pod install failed"
**Cause:** CocoaPods dependency conflict or network issue.

**Fix:**
1. Check `Podfile.lock` is committed to git
2. Verify all pod dependencies are accessible
3. Check Xcode Cloud logs for specific error
4. May need to update pod versions

---

#### ❌ "npm ci failed"
**Cause:** `package-lock.json` out of sync or corrupted.

**Fix:**
1. Locally run: `rm -rf node_modules package-lock.json`
2. Run: `npm install`
3. Commit new `package-lock.json`
4. Rebuild

---

#### ❌ "Archive failed"
**Cause:** Xcode build error (Swift/Objective-C compilation).

**Fix:**
1. Check Xcode build logs
2. Look for red error messages
3. Fix code errors
4. Rebuild

---

## 🔄 Updating CI Scripts

When you modify `ci_post_clone.sh`:

1. **Test locally first:**
   ```bash
   ./scripts/test-ci-locally.sh
   ```

2. **Commit changes:**
   ```bash
   git add ios/ci_scripts/ci_post_clone.sh
   git commit -m "Update Xcode Cloud CI script"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin main
   ```

4. **Trigger build in Xcode Cloud**

5. **Monitor logs** to verify changes work

---

## 📚 Additional Resources

- [Xcode Cloud Documentation](https://developer.apple.com/documentation/xcode/xcode-cloud)
- [Writing Custom Build Scripts](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)
- [Environment Variables in Xcode Cloud](https://developer.apple.com/documentation/xcode/environment-variable-reference)

---

## 🛟 Support

If you encounter issues:

1. Check build logs in App Store Connect
2. Run local test script: `./scripts/test-ci-locally.sh`
3. Verify environment variables are set correctly
4. Check this README for common issues
5. Review Xcode Cloud documentation

---

**Last Updated:** December 2024
**Maintained By:** Elmify Development Team
