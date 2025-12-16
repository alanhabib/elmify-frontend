# GitHub Secrets Setup Checklist

Quick reference for setting up all required GitHub Secrets.

**Location:** GitHub Repo → Settings → Secrets and variables → Actions

---

## ☑️ Step 1: Environment Variables (7 secrets) - 5 mins

These are easy - just copy from your `.env` file.

- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_Y2xlcmsuZWxtaWZ5LnN0b3JlJA`
- [ ] `EXPO_PUBLIC_API_BASE_URL` = `https://elmify-backend-production.up.railway.app/api/v1`
- [ ] `EXPO_PUBLIC_MEDIA_BASE_URL` = `https://elmify-backend-production.up.railway.app`
- [ ] `EXPO_PUBLIC_STREAM_BASE_URL` = `https://elmify-backend-production.up.railway.app`
- [ ] `EXPO_PUBLIC_MINIO_BASE_URL` = `https://elmify-backend-production.up.railway.app`
- [ ] `EXPO_PUBLIC_DEBUG_API` = `false`
- [ ] `EXPO_PUBLIC_ENVIRONMENT` = `production`

---

## ☑️ Step 2: Code Signing (5 secrets) - 15 mins

### 2.1: Export Distribution Certificate

**On your Mac:**

1. Open **Keychain Access** app
2. Search for: `Apple Distribution`
3. Expand the certificate (click ▶) to show private key
4. **Select BOTH** certificate AND private key (Cmd+Click both)
5. Right-click → **Export 2 items...**
6. Save as: `Certificates.p12`
7. **Set a password** (remember it!)
8. Convert to base64:
   ```bash
   base64 -i ~/Desktop/Certificates.p12 | pbcopy
   ```

**Add to GitHub:**
- [ ] `IOS_DISTRIBUTION_CERTIFICATE_P12` = [paste from clipboard]
- [ ] `IOS_CERTIFICATE_PASSWORD` = [the password you set]

---

### 2.2: Export Provisioning Profile

**Find your profile:**
```bash
cd ~/Library/MobileDevice/Provisioning\ Profiles/
ls -la
```

**Look for the one for "Elmify" - you can check by opening in text editor**

**Convert to base64:**
```bash
# Replace <UUID> with your profile filename
base64 -i ~/Library/MobileDevice/Provisioning\ Profiles/<UUID>.mobileprovision | pbcopy
```

**Add to GitHub:**
- [ ] `IOS_PROVISIONING_PROFILE` = [paste from clipboard]

---

### 2.3: Create Keychain Password

**Just make up a secure password (8+ characters)**

**Add to GitHub:**
- [ ] `KEYCHAIN_PASSWORD` = [your new password - can be anything]

---

### 2.4: Find Team ID

**Go to:** [App Store Connect](https://appstoreconnect.apple.com) → **Membership**

**Look for:** Team ID (10 characters, like `RJ59PXFA29`)

**Add to GitHub:**
- [ ] `APPLE_TEAM_ID` = [your Team ID]

---

## ☑️ Step 3: App Store Connect API (3 secrets) - 10 mins

### 3.1: Create API Key

**Go to:** [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access**

1. Click **Keys** tab (under Integrations)
2. Click **+** (Generate API Key)
3. Name: `GitHub Actions`
4. Access: **App Manager**
5. Click **Generate**

**Save these values:**
- **Issuer ID** (at top of page)
- **Key ID** (in the key row)
- **Download** the `.p8` file (⚠️ one-time download!)

---

### 3.2: Add API Secrets

**Add to GitHub:**
- [ ] `APP_STORE_CONNECT_API_KEY_ID` = [Key ID from above]
- [ ] `APP_STORE_CONNECT_API_ISSUER_ID` = [Issuer ID from above]
- [ ] `APP_STORE_CONNECT_API_KEY` = [paste contents of .p8 file]

**To get .p8 contents:**
```bash
cat ~/Downloads/AuthKey_*.p8
```

---

## ✅ Verification

**Total secrets added: 15**

Verify all secrets are added:
```
GitHub Repo → Settings → Secrets and variables → Actions
```

You should see 15 repository secrets:

**Code Signing (5):**
1. IOS_DISTRIBUTION_CERTIFICATE_P12
2. IOS_CERTIFICATE_PASSWORD
3. IOS_PROVISIONING_PROFILE
4. KEYCHAIN_PASSWORD
5. APPLE_TEAM_ID

**App Store Connect (3):**
6. APP_STORE_CONNECT_API_KEY_ID
7. APP_STORE_CONNECT_API_ISSUER_ID
8. APP_STORE_CONNECT_API_KEY

**Environment (7):**
9. EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
10. EXPO_PUBLIC_API_BASE_URL
11. EXPO_PUBLIC_MEDIA_BASE_URL
12. EXPO_PUBLIC_STREAM_BASE_URL
13. EXPO_PUBLIC_MINIO_BASE_URL
14. EXPO_PUBLIC_DEBUG_API
15. EXPO_PUBLIC_ENVIRONMENT

---

## 🚀 Ready to Build!

Once all 15 secrets are added:

```bash
git push origin main
```

Then watch the build in: **GitHub → Actions tab**

---

## 🆘 Troubleshooting

**Certificate export fails:**
- Make sure you select BOTH certificate AND private key
- Check certificate hasn't expired
- Try exporting from "My Certificates" category

**Can't find provisioning profile:**
- Check Xcode: Preferences → Accounts → Manage Certificates
- Or download from developer.apple.com → Profiles

**API key download fails:**
- You can only download .p8 file ONCE
- If you already downloaded it, use the existing file
- Or delete the key and create a new one

---

## 📝 Alternative: Use Helper Script

Instead of manual steps, run:
```bash
./scripts/setup-github-secrets.sh
```

It will guide you through everything and copy values to clipboard.
