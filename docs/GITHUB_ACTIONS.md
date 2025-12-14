# GitHub Actions CI/CD for Elmify iOS

Complete guide to understanding and using GitHub Actions for automated iOS builds and deployments.

---

## 📋 Table of Contents

1. [Why GitHub Actions?](#why-github-actions)
2. [How It Works](#how-it-works)
3. [Setup Guide](#setup-guide)
4. [Troubleshooting](#troubleshooting)
5. [Common Issues](#common-issues)
6. [Best Practices](#best-practices)
7. [FAQ](#faq)

---

## 🎯 Why GitHub Actions?

### **The Problem We're Solving**

**Before GitHub Actions:**
- ❌ Manual builds on local machine
- ❌ "Works on my machine" issues
- ❌ Forgot to run tests before deploy
- ❌ Inconsistent build environments
- ❌ Manual TestFlight uploads
- ❌ Environment variables scattered everywhere

**After GitHub Actions:**
- ✅ Automatic builds on every push
- ✅ Consistent macOS environment
- ✅ Tests run automatically
- ✅ Automatic TestFlight deployment
- ✅ All environment variables in GitHub Secrets (single source of truth)
- ✅ Build history and artifacts saved

---

### **Why Not Xcode Cloud or EAS Build?**

| Feature | GitHub Actions | Xcode Cloud | EAS Build |
|---------|---------------|-------------|-----------|
| **Environment Variables** | ✅ All in GitHub | ❌ Split (GitHub + App Store) | ❌ Split (GitHub + eas.json) |
| **Cost** | ✅ Free tier: 2,000 mins/month | ✅ Free tier: 25 hrs/month | ❌ $29/mo for 30 builds |
| **Flexibility** | ✅ Unlimited customization | ⚠️ Limited | ⚠️ Expo-specific |
| **Multi-platform** | ✅ iOS + Android + Web | ❌ iOS only | ✅ iOS + Android |
| **Version Control** | ✅ Workflow in git | ❌ UI-configured | ⚠️ eas.json in git |
| **Learning Curve** | ⚠️ Moderate | ⚠️ Moderate | ✅ Easy |

**Our Choice:** GitHub Actions
- **Single source of truth** for environment variables
- **Full control** over build process
- **Cost effective** for our usage
- **Future-proof** for Android/web deployments

---

## 🔧 How It Works

### **The Build Pipeline**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Developer pushes code to GitHub (main branch)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. GitHub Actions detects push, starts workflow                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Spins up macOS runner (fresh virtual machine)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Checks out your code from GitHub                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Installs Node.js + npm dependencies                         │
│     - React Native, Expo, etc.                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. Installs Ruby + CocoaPods                                   │
│     - iOS native dependencies                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. Configures code signing                                     │
│     - Apple certificates & provisioning profiles                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  8. Builds app with Xcode                                       │
│     - Compiles Swift/Objective-C code                           │
│     - Bundles JavaScript with Metro                             │
│     - Links native modules                                      │
│     - Creates .xcarchive                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  9. Exports .ipa file                                           │
│     - Signed, distributable app package                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  10. Uploads to TestFlight                                      │
│      - Uses App Store Connect API                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  11. Saves .ipa as GitHub artifact                              │
│      - Downloadable for 30 days                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  12. Cleans up (deletes certificates, keychain)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                        ✅ DONE!
```

**Total Time:** 15-30 minutes (depending on cache hits)

---

## 🚀 Setup Guide

### **Phase 1: Prepare Apple Certificates (One-Time Setup)**

#### **Step 1: Create App Store Connect API Key**

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access** → **Keys** (under Integrations)
3. Click **Generate API Key** or **+**
4. Name: `GitHub Actions`
5. Access: **App Manager** (minimum required)
6. Click **Generate**

**Save these values (you'll need them for GitHub Secrets):**
- **Issuer ID** (found at top of Keys page)
- **Key ID** (found in the key row)
- **Download** the `.p8` file (one-time download, can't re-download!)

#### **Step 2: Export Distribution Certificate**

**On your Mac:**

```bash
# Open Keychain Access app
open "/Applications/Utilities/Keychain Access.app"

# Find your distribution certificate:
# - Look for: "Apple Distribution: <Your Name> (<Team ID>)"
# - Expand it to show private key

# Export certificate + private key:
# 1. Select the certificate (not the key)
# 2. File → Export Items
# 3. Save as: Certificates.p12
# 4. Set a password (you'll need this for GitHub Secret)
# 5. Save the file
```

**Convert to base64 for GitHub:**

```bash
base64 -i Certificates.p12 | pbcopy
# Now the base64 string is in your clipboard
```

#### **Step 3: Export Provisioning Profile**

```bash
# Find your provisioning profile
cd ~/Library/MobileDevice/Provisioning\ Profiles

# List all profiles
ls -la

# Find the one for your app (open in text editor to check)
# Look for <key>Name</key> matching your app

# Convert to base64
base64 -i <YOUR_PROFILE_UUID>.mobileprovision | pbcopy
# Now the base64 string is in your clipboard
```

---

### **Phase 2: Configure GitHub Secrets**

#### **Step 1: Navigate to Repository Secrets**

1. Go to your GitHub repository
2. Click **Settings** (top tab)
3. Left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### **Step 2: Add All Required Secrets**

Add these secrets one by one:

| Secret Name | Value | How to Get It |
|-------------|-------|---------------|
| `IOS_DISTRIBUTION_CERTIFICATE_P12` | Base64 string of Certificates.p12 | From Phase 1, Step 2 |
| `IOS_CERTIFICATE_PASSWORD` | Password you set for .p12 file | From Phase 1, Step 2 |
| `IOS_PROVISIONING_PROFILE` | Base64 string of provisioning profile | From Phase 1, Step 3 |
| `KEYCHAIN_PASSWORD` | Any secure password (min 8 chars) | Create a random password |
| `APPLE_TEAM_ID` | Your Apple Team ID | App Store Connect → Membership |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from API key | From Phase 1, Step 1 |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID | From Phase 1, Step 1 |
| `APP_STORE_CONNECT_API_KEY` | Contents of .p8 file | From Phase 1, Step 1 |

**Environment Variables (from your .env):**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_Y2xlcmsuZWxtaWZ5LnN0b3JlJA` | Clerk auth key |
| `EXPO_PUBLIC_API_BASE_URL` | `https://elmify-backend-production.up.railway.app/api/v1` | Backend API |
| `EXPO_PUBLIC_MEDIA_BASE_URL` | `https://elmify-backend-production.up.railway.app` | Media server |
| `EXPO_PUBLIC_STREAM_BASE_URL` | `https://elmify-backend-production.up.railway.app` | Streaming |
| `EXPO_PUBLIC_MINIO_BASE_URL` | `https://elmify-backend-production.up.railway.app` | Storage |
| `EXPO_PUBLIC_DEBUG_API` | `false` | Debug mode |
| `EXPO_PUBLIC_ENVIRONMENT` | `production` | Environment |

---

### **Phase 3: Commit Workflow**

```bash
# Workflow is already in .github/workflows/ios-production.yml
git add .github/workflows/ios-production.yml
git commit -m "Add GitHub Actions workflow for iOS"
git push origin main
```

---

### **Phase 4: Monitor First Build**

1. Go to **GitHub Repository** → **Actions** tab
2. You'll see "iOS Production Build & Deploy" running
3. Click on it to see real-time logs
4. Each step shows green ✅ if successful, red ❌ if failed

**Expected duration:** 20-30 minutes (first build, no cache)

---

## 🔍 Troubleshooting

### **How to Read Build Logs**

**GitHub Actions UI:**
```
GitHub Repo → Actions Tab → Click on workflow run → Click on job
```

**Each step expands to show detailed logs:**
- ✅ Green check = Success
- ❌ Red X = Failed (expand to see error)
- 🟡 Yellow = In progress

**Tips:**
- Look for the FIRST error, not the last
- Errors are usually in RED text
- Search logs for "error:" or "failed"

---

### **Common Issues & Solutions**

#### ❌ **"Code signing failed"**

**Symptoms:**
```
Error: No signing certificate "Apple Distribution" found
```

**Causes:**
1. Certificate not properly base64 encoded
2. Wrong password for certificate
3. Expired certificate
4. Certificate doesn't match provisioning profile

**Solutions:**

```bash
# Re-export certificate (make sure to include private key!)
1. Keychain Access → Find "Apple Distribution"
2. Expand to show private key
3. Select BOTH certificate AND key
4. File → Export Items
5. Update GitHub Secret with new base64

# Verify certificate is valid
security find-identity -v -p codesigning
# Look for "Apple Distribution" in the list

# Check expiration date
openssl pkcs12 -in Certificates.p12 -nokeys -passin pass:YOUR_PASSWORD | openssl x509 -noout -enddate
```

---

#### ❌ **"Provisioning profile doesn't match"**

**Symptoms:**
```
Error: Provisioning profile "..." doesn't include signing certificate
```

**Causes:**
1. Profile created with different certificate
2. Profile expired
3. Profile for wrong app bundle ID

**Solutions:**

```bash
# Check profile details
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision

# Look for:
# - <key>Name</key> → Should match your app
# - <key>TeamIdentifier</key> → Should match your team
# - <key>ExpirationDate</key> → Should be in future
# - <key>AppIDName</key> → Should be your app bundle ID

# If wrong, create new profile in Apple Developer Portal:
# 1. developer.apple.com → Certificates, IDs & Profiles
# 2. Profiles → + (new profile)
# 3. Distribution → App Store
# 4. Select your app ID
# 5. Select your distribution certificate
# 6. Download and re-export to base64
```

---

#### ❌ **"pod install failed"**

**Symptoms:**
```
[!] Unable to find a specification for `<PodName>`
```

**Causes:**
1. CocoaPods repo out of date
2. Network issues
3. Pod not available for architecture
4. Version conflicts

**Solutions:**

```bash
# Locally test pod install
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update

# If it works locally, push Podfile.lock
git add ios/Podfile.lock
git commit -m "Update Podfile.lock"
git push

# If specific pod fails, check Podfile for:
# - Version compatibility
# - Platform version (platform :ios, '15.1')
# - Architecture support (use_frameworks!)
```

---

#### ❌ **"npm ci failed"**

**Symptoms:**
```
npm ERR! `npm ci` can only install packages when your package.json and package-lock.json are in sync
```

**Causes:**
1. package.json changed without updating package-lock.json
2. Different npm version used

**Solutions:**

```bash
# Regenerate package-lock.json
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

---

#### ❌ **"Missing environment variable"**

**Symptoms:**
```
ReferenceError: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is undefined
```

**Causes:**
1. Secret not added to GitHub
2. Typo in secret name
3. Secret not passed to build step

**Solutions:**

1. **Check secret exists:**
   - GitHub Repo → Settings → Secrets and variables → Actions
   - Verify secret name matches EXACTLY (case-sensitive!)

2. **Check workflow file:**
   ```yaml
   env:
     EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY }}
   ```
   - Variable name must match in both places

3. **Test locally:**
   ```bash
   export EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="your_key"
   npm start
   # If app works, GitHub Secret is wrong
   ```

---

#### ❌ **"Build timeout"**

**Symptoms:**
```
Error: The job running on runner has exceeded the maximum execution time of 60 minutes.
```

**Causes:**
1. Build is actually stuck (network issue, infinite loop)
2. Build is too complex (first build without cache)
3. macOS runner is slow

**Solutions:**

```yaml
# Increase timeout in workflow file
timeout-minutes: 90 # Increase from 60

# Or optimize build:
# 1. Use smaller dependencies
# 2. Enable more caching
# 3. Remove unused pods
```

---

## 💡 Best Practices

### **1. Keep Secrets Secure**

❌ **DON'T:**
```yaml
env:
  API_KEY: "pk_live_abc123" # Never hardcode secrets!
```

✅ **DO:**
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }} # Always use GitHub Secrets
```

---

### **2. Use Caching**

✅ **Already configured in workflow:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm' # Caches node_modules

- uses: actions/cache@v3
  with:
    path: ~/Library/Developer/Xcode/DerivedData # Caches compiled code
```

**Benefits:**
- 5-10x faster builds
- Reduces GitHub Actions minutes usage
- Less network bandwidth

---

### **3. Monitor Build Minutes**

**Free tier limits:**
- **GitHub Actions:** 2,000 minutes/month
- **macOS runners:** 10x multiplier (10 mins build = 100 mins quota)

**How to check usage:**
```
GitHub Profile → Settings → Billing and plans → Plans and usage
```

**Tips to reduce usage:**
- Only run on `main` branch (not PRs)
- Use caching effectively
- Optimize build steps

---

### **4. Test Locally First**

Before pushing to trigger GitHub Actions:

```bash
# 1. Clean build locally
rm -rf node_modules ios/Pods
npm install
cd ios && pod install && cd ..

# 2. Build with Xcode
open ios/Elmify.xcworkspace
# Product → Build (Cmd+B)

# 3. If local build succeeds, push
git push origin main
```

---

### **5. Version Your Workflow**

```bash
# Create separate workflows for different branches/environments
.github/workflows/
  ios-production.yml  # Runs on: push to main
  ios-staging.yml     # Runs on: push to staging
  ios-pr.yml          # Runs on: pull requests (build only, no deploy)
```

---

## ❓ FAQ

### **Q: How much does this cost?**

**A:** GitHub Actions is free for public repos. For private repos:
- Free tier: 2,000 minutes/month
- macOS runners: 10x multiplier
- Effective: ~200 minutes of macOS builds/month
- Average build: 20 mins = 200 mins quota used
- **You get ~10 builds/month free**, then $0.08/minute

### **Q: Can I run builds on pull requests?**

**A:** Yes! Create a new workflow:

```yaml
# .github/workflows/ios-pr.yml
on:
  pull_request:
    branches: [main]

# Don't deploy to TestFlight on PRs (just build + test)
```

### **Q: How do I test the workflow without deploying?**

**A:** Comment out the TestFlight upload step:

```yaml
# - name: Upload to TestFlight
#   env:
#     # ...
#   run: |
#     # ...
```

Or create a staging workflow that uses a different app bundle ID.

### **Q: Can I cancel a running build?**

**A:** Yes!
1. Go to Actions tab
2. Click on running workflow
3. Click "Cancel workflow" (top right)

### **Q: How do I download the .ipa file?**

**A:**
1. Go to Actions tab
2. Click on completed workflow
3. Scroll to "Artifacts" section
4. Click "Elmify-[commit-hash].ipa" to download

**Note:** Artifacts expire after 30 days.

### **Q: Can I trigger builds manually?**

**A:** Yes! The workflow includes `workflow_dispatch`:
1. Go to Actions tab
2. Select "iOS Production Build & Deploy"
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow"

### **Q: What if Apple certificates expire?**

**A:** Update GitHub Secrets with new certificates:
1. Create new certificate in Apple Developer Portal
2. Export to .p12 (with private key!)
3. Convert to base64
4. Update `IOS_DISTRIBUTION_CERTIFICATE_P12` secret
5. Update `IOS_CERTIFICATE_PASSWORD` if changed
6. Update `IOS_PROVISIONING_PROFILE` (create new profile with new cert)

Next build will use new certificates automatically.

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Apple Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Fastlane Documentation](https://docs.fastlane.tools/) (alternative deployment tool)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)

---

## 🆘 Getting Help

If you're stuck:

1. **Check build logs** in Actions tab (expand each step)
2. **Search error message** in this doc (Ctrl+F)
3. **Check GitHub Actions status** ([https://www.githubstatus.com/](https://www.githubstatus.com/))
4. **Test locally** to isolate if it's CI-specific
5. **Review recent changes** (did you change package.json? Podfile?)

---

**Last Updated:** December 2024
**Maintained By:** Elmify Development Team
