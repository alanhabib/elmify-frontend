# 🚀 Elmify iOS - Quick Start Deployment

Fast-track guide to deploy Elmify to the Apple App Store.

---

## ⚡ Quick Commands

### 1. Build for Production
```bash
cd /Users/alanhabib/Desktop/hobby_projects/elmify-frontend

# Login to EAS
eas login

# Build production IPA
eas build --platform ios --profile production

# ⏱️ Wait ~15-25 minutes
```

### 2. Submit to TestFlight
```bash
# After build completes
eas submit --platform ios --profile production --latest

# ⏱️ Wait ~5-10 minutes
```

### 3. Test in TestFlight
```bash
# 1. Install TestFlight app on your iPhone
# 2. You'll receive email invitation
# 3. Install Elmify from TestFlight
# 4. Test thoroughly (see checklist below)
```

### 4. Submit to App Store
```bash
# 1. Open App Store Connect
open https://appstoreconnect.apple.com

# 2. Go to: My Apps > Elmify > App Store
# 3. Fill in all required info (see APP_STORE_DESCRIPTION.md)
# 4. Select build from TestFlight
# 5. Click "Submit for Review"
```

---

## ✅ Pre-Flight Checklist

### Before Building:
- [ ] **Apple Developer Account** active ($99/year)
- [ ] **EAS CLI** installed: `npm install -g eas-cli`
- [ ] **Logged into Expo**: `eas login`
- [ ] **Bundle ID** created in Apple Developer Portal: `com.vadinsavin.Elmify`

### Before Submitting to App Store:
- [ ] **App created** in App Store Connect
- [ ] **App icon** ready (1024x1024, no alpha)
- [ ] **Screenshots** taken (all device sizes)
- [ ] **Description** copied from `APP_STORE_DESCRIPTION.md`
- [ ] **Privacy Policy** live at https://www.elmify.store/privacy
- [ ] **Terms** live at https://www.elmify.store/terms
- [ ] **Demo account** created for reviewers

---

## 🧪 TestFlight Testing Checklist

Test these features before submitting to App Store:

- [ ] **Sign Up/Login** works (email + Apple Sign In)
- [ ] **Browse** lectures and speakers
- [ ] **Play audio** - streams correctly
- [ ] **Background audio** - works when app in background
- [ ] **Lock screen controls** - visible and functional
- [ ] **Download** lecture for offline
- [ ] **Offline playback** - works in airplane mode
- [ ] **Profile stats** - displays correctly
- [ ] **Daily streak** - tracks properly
- [ ] **No crashes** - app stable throughout

---

## 🔧 Update eas.json Before First Build

**REQUIRED:** Update submit credentials in `eas.json`:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "YOUR_APPLE_ID@example.com",     // ← Change this
      "ascAppId": "YOUR_10_DIGIT_APP_ID",         // ← Change this
      "appleTeamId": "YOUR_APPLE_TEAM_ID"         // ← Change this
    }
  }
}
```

**How to find these:**

1. **Apple ID**: Your Apple Developer account email
2. **App Store Connect App ID**:
   - Go to https://appstoreconnect.apple.com
   - Create app if not exists
   - Look at URL: `...apps/[THIS_IS_YOUR_APP_ID]/appstore`
3. **Team ID**:
   - Go to https://developer.apple.com/account
   - Click "Membership" → Copy "Team ID"

---

## 📱 App Store Connect Required Info

### Basic Info
| Field | Value |
|-------|-------|
| **App Name** | Elmify |
| **Subtitle** | Expert Lectures On Demand |
| **Category** | Education |
| **Age Rating** | 4+ |
| **Price** | Free |

### URLs
| Type | URL |
|------|-----|
| **Privacy Policy** | https://www.elmify.store/privacy |
| **Terms** | https://www.elmify.store/terms |
| **Support** | https://www.elmify.store/support |
| **Marketing** | https://www.elmify.store |

### Copy `APP_STORE_DESCRIPTION.md` for:
- Description (4000 chars)
- Keywords (100 chars)
- Promotional text (170 chars)
- What's New (version 1.0.0)

---

## 📸 Screenshots Required

You need screenshots for:
- **iPhone 6.7"** (iPhone 15 Pro Max) - 1290x2796
- **iPhone 6.5"** (iPhone 11 Pro Max) - 1242x2688
- **iPhone 5.5"** (iPhone 8 Plus) - 1242x2208
- **iPad Pro 12.9"** - 2048x2732

**Quick way:**
```bash
# 1. Start app
npm run ios

# 2. Change simulator device
# Simulator > Device > iPhone 15 Pro Max

# 3. Navigate and screenshot (Cmd+S)
# Take 5 screenshots:
#   - Home/Browse
#   - Speaker detail
#   - Audio player
#   - Downloads
#   - Profile stats

# 4. Repeat for each device size
```

---

## 🎯 Full Process (30 minutes)

```bash
# Step 1: Update eas.json credentials (2 min)
# Edit: eas.json

# Step 2: Build (20 min)
eas build --platform ios --profile production

# Step 3: Submit to TestFlight (5 min)
eas submit --platform ios --profile production --latest

# Step 4: Test (10 min)
# Install from TestFlight, test features

# Step 5: Submit to App Store (15 min)
# Fill App Store Connect, submit for review

# Step 6: Wait for Apple Review (2-5 days)
# Check status in App Store Connect

# Step 7: Release! 🎉
# Approve release when ready
```

---

## 🆘 Common Issues & Fixes

### Build Fails
```bash
# Clear caches and retry
rm -rf node_modules ios/Pods
npm install
cd ios && pod install && cd ..
eas build --platform ios --profile production --clear-cache
```

### Credentials Error
```bash
# Reset and recreate credentials
eas credentials
# > Select: Remove all credentials
# > Re-run build
```

### "Bundle Identifier Not Found"
```bash
# 1. Go to https://developer.apple.com/account
# 2. Certificates, IDs & Profiles > Identifiers
# 3. Click "+" to register: com.vadinsavin.Elmify
# 4. Enable capabilities: Background Modes (Audio)
```

### TestFlight Processing Stuck
- Wait 30 minutes, usually just slow
- Check email for any compliance issues from Apple
- Verify export compliance answers in app.json

---

## 📞 Need Help?

**Detailed Guide:** See `DEPLOYMENT.md` for complete step-by-step

**App Store Copy:** See `APP_STORE_DESCRIPTION.md` for ready-to-paste content

**Expo Documentation:**
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- Credentials: https://docs.expo.dev/app-signing/app-credentials/

**Apple Resources:**
- App Store Connect: https://appstoreconnect.apple.com
- Developer Portal: https://developer.apple.com/account
- Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

**Support:**
- Expo Discord: https://chat.expo.dev
- Apple Forums: https://developer.apple.com/forums/

---

## ✨ You're Ready!

All configuration is complete. Your app is production-ready for the App Store!

**Next step:** Update `eas.json` with your Apple credentials, then run:
```bash
eas build --platform ios --profile production
```

Good luck! 🍀🚀
