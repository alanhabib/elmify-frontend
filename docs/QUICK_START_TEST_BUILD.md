# Quick Start: Test GitHub Actions Build

Test your GitHub Actions setup with **only 7 environment variables** - no certificates, no provisioning profiles, no App Store Connect API needed!

---

## ✅ What This Tests

This simplified workflow verifies:
- ✅ GitHub Actions can build your iOS app
- ✅ Environment variables work correctly
- ✅ Dependencies install properly (npm, CocoaPods)
- ✅ Your code compiles successfully
- ✅ Metro bundler works in CI

**What it skips:**
- ❌ Code signing (no certificates needed)
- ❌ IPA export (no provisioning profile needed)
- ❌ TestFlight upload (no App Store Connect API needed)

---

## 🚀 Setup (5 Minutes)

### Step 1: Add Environment Variables to GitHub

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Click **"New repository secret"** and add these **7 secrets**:

| Secret Name | Value (from your .env) |
|-------------|------------------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_Y2xlcmsuZWxtaWZ5LnN0b3JlJA` |
| `EXPO_PUBLIC_API_BASE_URL` | `https://elmify-backend-production.up.railway.app/api/v1` |
| `EXPO_PUBLIC_MEDIA_BASE_URL` | `https://elmify-backend-production.up.railway.app` |
| `EXPO_PUBLIC_STREAM_BASE_URL` | `https://elmify-backend-production.up.railway.app` |
| `EXPO_PUBLIC_MINIO_BASE_URL` | `https://elmify-backend-production.up.railway.app` |
| `EXPO_PUBLIC_DEBUG_API` | `false` |
| `EXPO_PUBLIC_ENVIRONMENT` | `production` |

**That's it! No certificates needed for testing.**

---

### Step 2: Create Test Branch

```bash
# Create a test branch
git checkout -b test-build

# Push to GitHub to trigger the build
git push origin test-build
```

---

### Step 3: Watch the Build

1. Go to **GitHub Repository → Actions tab**
2. You'll see "iOS Test Build (No Deployment)" running
3. Click on it to see live logs
4. Build takes ~20-30 minutes

---

## ✅ Success Looks Like:

You'll see this at the end:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TEST BUILD SUCCESSFUL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your app builds successfully with GitHub Actions!

What was tested:
  ✓ Environment variables loaded correctly
  ✓ npm dependencies installed
  ✓ CocoaPods dependencies installed
  ✓ JavaScript bundled with Metro
  ✓ Swift/Objective-C code compiled
  ✓ Native modules linked
```

---

## 🎉 Next Steps (After Test Succeeds)

Once the test build works:

### Option A: Keep Testing (Stay on test-build branch)
- Make code changes
- Push to `test-build` branch
- Automatically builds (no deployment)

### Option B: Move to Full Production Pipeline
1. **Add remaining secrets** (code signing + App Store API)
   - See: `docs/GITHUB_SECRETS_CHECKLIST.md`
2. **Merge to main:**
   ```bash
   git checkout main
   git merge test-build
   git push origin main
   ```
3. **Production workflow runs** (`ios-production.yml`)
4. **Automatically uploads to TestFlight** ✅

---

## ❌ If Build Fails

### Common Issues:

#### **Missing Secret**
```
Error: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is undefined
```

**Fix:** Check that secret name matches EXACTLY (case-sensitive)

---

#### **npm ci failed**
```
npm ERR! `npm ci` can only install packages when package.json and package-lock.json are in sync
```

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push origin test-build
```

---

#### **pod install failed**
```
[!] Unable to find a specification for `<PodName>`
```

**Fix:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
git add Podfile.lock
git commit -m "Update Podfile.lock"
git push origin test-build
```

---

## 🔄 Trigger Build Manually

Don't want to push code? Trigger manually:

1. GitHub → Actions tab
2. Select "iOS Test Build (No Deployment)"
3. Click "Run workflow"
4. Choose branch: `test-build`
5. Click "Run workflow"

---

## 📊 Build Costs

**GitHub Actions Free Tier:**
- 2,000 minutes/month
- macOS runners: 10x multiplier
- Each build ~20 mins = 200 minutes used

**You get ~10 test builds/month free**

---

## 🎯 Summary

**Time:** 5 minutes to set up + 20 minutes to build
**Secrets needed:** 7 (just environment variables)
**Result:** Confirms GitHub Actions can build your app

Once this works, you know:
- ✅ Dependencies work in CI
- ✅ Environment variables configured correctly
- ✅ Build process is solid
- ✅ Ready to add deployment

**Then you can confidently spend time setting up certificates for full deployment!**

---

## 📝 Checklist

- [ ] Add 7 environment variable secrets to GitHub
- [ ] Create `test-build` branch
- [ ] Push to trigger build
- [ ] Watch build in Actions tab
- [ ] Build succeeds ✅
- [ ] (Optional) Add remaining secrets for full deployment

---

**Ready? Start with Step 1 above!**
