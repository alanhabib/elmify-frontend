# Elmify iOS Deployment Guide

Complete step-by-step guide to deploy Elmify to the Apple App Store.

---

## 📋 Prerequisites

### 1. Apple Developer Account
- [ ] Active Apple Developer Program membership ($99/year)
- [ ] Apple ID: `your-apple-id@example.com`
- [ ] Team ID: Get from https://developer.apple.com/account
- [ ] Two-Factor Authentication enabled

### 2. Development Environment
- [ ] macOS with Xcode 15+ installed
- [ ] Node.js 18+ installed
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into Expo: `eas login`

### 3. App Store Connect
- [ ] App created in App Store Connect
- [ ] App Store Connect App ID (10-digit number)
- [ ] Bundle ID registered: `com.vadinsavin.Elmify`

---

## 🚀 Deployment Steps

### Step 1: Configure Apple Developer Account

#### 1.1 Get Your Team ID
```bash
# Visit Apple Developer Account
open https://developer.apple.com/account

# Navigate to: Membership > Team ID
# Copy your Team ID (e.g., "AB12CD3456")
```

#### 1.2 Update eas.json
```bash
cd /Users/alanhabib/Desktop/hobby_projects/elmify-frontend
```

Edit `eas.json` - Replace placeholders in the `submit` section:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-actual-apple-id@example.com",
      "ascAppId": "your-10-digit-app-id",
      "appleTeamId": "YOUR_TEAM_ID"
    }
  }
}
```

---

### Step 2: Create App in App Store Connect

#### 2.1 Create New App
```bash
# Open App Store Connect
open https://appstoreconnect.apple.com

# Navigate to: My Apps > + > New App
```

**Fill in:**
- **Platform:** iOS
- **Name:** Elmify
- **Primary Language:** English (U.S.)
- **Bundle ID:** Select `com.vadinsavin.Elmify` (create if not exists)
- **SKU:** `elmify-ios` (unique identifier, never changes)
- **User Access:** Full Access

**Save the App ID** (10-digit number from the URL)

#### 2.2 Fill App Information
**Category:** Education
**Subcategory:** Educational Content

**App Privacy:**
- Privacy Policy URL: `https://www.elmify.store/privacy`
- User Privacy Choices URL: Leave blank (not collecting personal data for ads)

**App Information:**
- Copyright: `2025 Vaadin Savin`
- Age Rating: 4+ (no objectionable content)

---

### Step 3: Prepare App Assets

#### 3.1 App Icon
**Required:** 1024x1024px PNG (no transparency, no rounded corners)

```bash
# Location of your current icon
ls -lh assets/icon.png

# Verify dimensions (should be square)
file assets/icon.png
```

**If need to resize:**
- Use Figma, Photoshop, or online tool
- Ensure no alpha channel (fully opaque)
- Save as PNG, sRGB color space

#### 3.2 Screenshots (Required for all sizes)

**iPhone 6.7" Display (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max)**
- Size: 1290 x 2796 pixels
- Quantity: 3-10 images

**iPhone 6.5" Display (iPhone 11 Pro Max, XS Max)**
- Size: 1242 x 2688 pixels
- Quantity: 3-10 images

**iPhone 5.5" Display (iPhone 8 Plus, 7 Plus, 6s Plus)**
- Size: 1242 x 2208 pixels
- Quantity: 3-10 images

**iPad Pro 12.9" Display**
- Size: 2048 x 2732 pixels
- Quantity: 3-10 images

**How to take screenshots:**
```bash
# 1. Run app in simulator
npm run ios

# 2. Select device type in simulator
# Simulator > Device > iPhone 15 Pro Max

# 3. Navigate to key screens:
#    - Home/Browse screen
#    - Speaker detail
#    - Lecture player
#    - Profile/Stats
#    - Library/Downloads

# 4. Take screenshots: Cmd + S
# Screenshots save to ~/Desktop

# 5. Repeat for each device size
```

#### 3.3 App Preview Video (Optional but Recommended)
- 15-30 seconds
- Portrait orientation
- Same sizes as screenshots
- Show key features: browsing, playing, downloading

---

### Step 4: Build for Production

#### 4.1 Clean Build
```bash
cd /Users/alanhabib/Desktop/hobby_projects/elmify-frontend

# Clear caches
rm -rf node_modules
npm install

# Clear iOS build cache
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clear Expo cache
npx expo start --clear
```

#### 4.2 Configure EAS Credentials
```bash
# Login to EAS
eas login

# Select or create credentials
eas credentials

# Choose:
# > iOS > Production
# > Manage credentials

# Options:
# 1. Let EAS manage (recommended for first time)
# 2. Use existing certificates (if you have them)
```

#### 4.3 Build Production IPA
```bash
# Build for App Store
eas build --platform ios --profile production

# This will:
# ✓ Validate app.json configuration
# ✓ Generate/use Apple certificates
# ✓ Build IPA file
# ✓ Upload to EAS servers
#
# Duration: ~15-25 minutes
```

**Monitor build:**
```bash
# View build status
eas build:list

# Or visit:
open https://expo.dev/accounts/[your-account]/projects/elmify/builds
```

---

### Step 5: Submit to TestFlight (Internal Testing)

#### 5.1 Download and Install
```bash
# After build completes, submit to App Store Connect
eas submit --platform ios --profile production --latest

# This uploads the IPA to TestFlight
# Duration: ~5-10 minutes
```

#### 5.2 Configure TestFlight
```bash
# Open TestFlight in App Store Connect
open https://appstoreconnect.apple.com

# Navigate to: TestFlight > iOS
```

**Internal Testing:**
- Add yourself as internal tester
- Wait for "Ready to Test" status (~10-30 min)
- Install TestFlight app on your iPhone
- Install Elmify from TestFlight
- Test thoroughly:
  - [ ] Login with Clerk works
  - [ ] Browse speakers and lectures
  - [ ] Play audio (background audio works)
  - [ ] Download lectures for offline
  - [ ] Profile stats display correctly
  - [ ] No crashes or major bugs

#### 5.3 External Testing (Optional)
- Add external testers (friends, family)
- Requires Apple review (~1 day)
- Get feedback before public release

---

### Step 6: App Store Submission

#### 6.1 Complete App Store Listing
```bash
# Open App Store Connect
open https://appstoreconnect.apple.com

# Navigate to: My Apps > Elmify > App Store
```

**Version Information:**
- **Version:** 1.0.0
- **Copyright:** 2025 Vaadin Savin
- **Primary Category:** Education
- **Secondary Category:** (Leave blank or choose Educational)

**App Description:**
```
Elmify - Your Premium Educational Lecture Platform

Discover and listen to expert lectures from world-class speakers. Whether you're commuting, exercising, or relaxing, Elmify brings quality educational content directly to your device.

KEY FEATURES:
• Stream thousands of lectures from renowned speakers
• Download lectures for offline listening
• Track your learning progress and streaks
• Beautiful, intuitive interface
• Background audio playback
• Dark mode support

CATEGORIES:
• Philosophy
• Psychology
• Science
• Technology
• Business
• Personal Development
• And many more...

PERFECT FOR:
• Lifelong learners
• Students
• Professionals
• Anyone curious about the world

Start your learning journey today with Elmify!
```

**Keywords (max 100 characters):**
```
lecture,education,learn,podcast,audio,knowledge,speaker,philosophy,science,psychology
```

**Promotional Text (170 characters, optional):**
```
Stream expert lectures anytime, anywhere. Download for offline listening. Track your learning progress. Your pocket university awaits!
```

**Support URL:**
```
https://www.elmify.store/support
```

**Marketing URL (optional):**
```
https://www.elmify.store
```

**Privacy Policy URL:**
```
https://www.elmify.store/privacy
```

#### 6.2 Upload Screenshots
- Upload screenshots for all required device sizes
- Add captions (optional, shown below screenshots)
- Arrange in order of importance

#### 6.3 App Review Information

**Contact Information:**
- First Name: Vaadin
- Last Name: Savin
- Phone Number: +XX XXX XXX XXXX
- Email: your-email@example.com

**Demo Account (if login required for review):**
- Username: reviewer@elmify.com
- Password: [Create a demo account]
- Notes: "This is a demo account for App Review. It has access to all features."

**Notes for Review:**
```
Elmify is an educational lecture platform powered by Clerk authentication and Railway backend services.

Key features to test:
1. Sign up/Login with email or Apple Sign In
2. Browse lectures by speaker or category
3. Play audio (background playback enabled)
4. Download lectures for offline playback
5. View learning statistics in Profile

Backend services:
- Authentication: Clerk (https://clerk.com)
- API: Railway (https://elmify-backend-production.up.railway.app)
- Storage: Cloudflare R2

All content is educational and appropriate for all ages (4+).
```

#### 6.4 Age Rating
```
# Answer questionnaire honestly:

Unrestricted Web Access: No
Contests: No
Gambling: No
Medical/Treatment Info: No
Alcohol/Tobacco/Drug Use: No
Mature/Suggestive Themes: No
Profanity/Crude Humor: No
Horror/Fear Themes: No
Violence: No

# Result: 4+ (suitable for all ages)
```

#### 6.5 App Privacy
```
# Answer privacy questionnaire:

Do you collect data from this app?
→ Yes

Data Types Collected:
✓ Contact Info
  - Email Address (linked to user, for app functionality)

✓ Identifiers
  - User ID (linked to user, for app functionality)

✓ Usage Data
  - Listening history (linked to user, for analytics)

Do you use data for tracking purposes?
→ No

Privacy Policy URL:
→ https://www.elmify.store/privacy
```

#### 6.6 Content Rights
- [ ] You own all rights to the content
- [ ] You have necessary permissions
- [ ] Content complies with App Store Review Guidelines

#### 6.7 Export Compliance
**Does your app use encryption?**
→ Yes (HTTPS only, no custom encryption)

**Is your app exempt from US export regulations?**
→ Yes (uses standard HTTPS, qualifies for exemption)

No additional documentation needed.

---

### Step 7: Submit for Review

#### 7.1 Final Checklist
- [ ] App icon uploaded (1024x1024)
- [ ] Screenshots for all device sizes
- [ ] App description complete
- [ ] Keywords added
- [ ] Privacy policy URL working
- [ ] Terms of service URL working
- [ ] Support URL working
- [ ] Demo account created (if needed)
- [ ] Age rating completed
- [ ] App privacy completed
- [ ] Version 1.0.0 selected from TestFlight

#### 7.2 Submit
```bash
# In App Store Connect:
# 1. Select build from TestFlight
# 2. Click "Add for Review"
# 3. Review all information
# 4. Click "Submit for Review"
```

**Review Timeline:**
- First submission: 2-5 days (usually 3 days)
- Updates: 1-2 days
- Urgent updates: Use expedited review (2 per year)

#### 7.3 During Review
**Status tracking:**
- Waiting for Review
- In Review (usually 1-4 hours)
- Pending Developer Release (approved!)
- Ready for Sale (live on App Store)

**If Rejected:**
- Read rejection reason carefully
- Fix issues mentioned
- Reply in Resolution Center
- Resubmit

---

### Step 8: Launch! 🎉

#### 8.1 Release to App Store
Once approved:
```bash
# Option 1: Auto-release (set during submission)
# App goes live immediately after approval

# Option 2: Manual release
# 1. Go to App Store Connect
# 2. Click "Release This Version"
# 3. App goes live in ~2-24 hours
```

#### 8.2 Monitor Launch
- [ ] Check App Store listing looks correct
- [ ] Test app download from App Store
- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews
- [ ] Track analytics in App Store Connect

#### 8.3 Post-Launch Tasks
```bash
# Share on social media
# Example: "Elmify is now live on the App Store! 🎉"

# Monitor:
- Downloads/impressions (App Store Connect Analytics)
- Crash reports (App Store Connect > TestFlight > Crashes)
- User reviews (respond within 24-48 hours)
- Support emails

# Update strategy:
- Bug fixes: Submit ASAP
- New features: Monthly/quarterly
- Keep version numbers semantic: 1.0.0 → 1.0.1 (bug fix) → 1.1.0 (feature)
```

---

## 🔄 Future Updates

### Building New Version
```bash
# 1. Update version in app.json
# "version": "1.0.1"

# 2. Build new IPA
eas build --platform ios --profile production

# 3. Submit to TestFlight
eas submit --platform ios --profile production --latest

# 4. Test in TestFlight

# 5. Submit new version in App Store Connect
# Select new build, add "What's New" text, submit for review
```

### What's New Text Examples
```
Version 1.0.1:
• Fixed issue with audio playback in background
• Improved download reliability
• Performance improvements

Version 1.1.0:
• NEW: Sleep timer for bedtime listening
• NEW: Playback speed control (0.5x - 2x)
• Enhanced search functionality
• Bug fixes and improvements
```

---

## 📞 Support Resources

### EAS Documentation
- Build: https://docs.expo.dev/build/introduction/
- Submit: https://docs.expo.dev/submit/introduction/
- Credentials: https://docs.expo.dev/app-signing/app-credentials/

### Apple Resources
- App Store Connect: https://appstoreconnect.apple.com
- Developer Portal: https://developer.apple.com/account
- Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

### Common Issues
**Build fails:**
```bash
# Clear all caches
rm -rf node_modules ios/Pods
npm install
cd ios && pod install && cd ..
eas build --platform ios --profile production --clear-cache
```

**Credentials issues:**
```bash
# Reset credentials
eas credentials
# > Select: Remove all credentials
# > Re-run: eas build
```

**Submission rejected - Missing compliance:**
- Answer all privacy questions in App Store Connect
- Ensure privacy manifest is in Info.plist (already added)

**App Store review rejection:**
- Read rejection reason carefully
- Most common: Incomplete information, demo account issues
- Fix and resubmit with explanation in Resolution Center

---

## ✅ Deployment Complete!

**Your Elmify app is now ready for Apple App Store! 🚀**

Next steps:
1. Follow Step 1 to configure your Apple Developer account
2. Create app in App Store Connect (Step 2)
3. Build with `eas build --platform ios --profile production`
4. Submit for review
5. Launch! 🎉

**Questions?**
- Check EAS documentation: https://docs.expo.dev
- Expo Discord: https://chat.expo.dev
- Apple Developer Forums: https://developer.apple.com/forums/

Good luck with your launch! 🍀
