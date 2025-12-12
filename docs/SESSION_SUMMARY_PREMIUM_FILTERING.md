# Session Summary: Premium Content Filtering & Speaker Upload Pipeline

## 🎯 What We Accomplished

### 1. **Implemented Premium Content Cascading Feature**

**Problem:** When a speaker was marked as premium, the speaker would disappear from non-premium users, but their collections and lectures remained accessible - allowing unauthorized access to premium content.

**Solution Implemented:**

#### Backend Changes (elmify-backend):

**Collection.java** (`src/main/java/com/elmify/backend/entity/Collection.java:100-102`)
```java
public boolean isPremium() {
    return speaker != null && speaker.getIsPremium() != null && speaker.getIsPremium();
}
```

**Lecture.java** (`src/main/java/com/elmify/backend/entity/Lecture.java:181-183`)
```java
public boolean isPremium() {
    return speaker != null && speaker.getIsPremium() != null && speaker.getIsPremium();
}
```

**SpeakerService.java** (`src/main/java/com/elmify/backend/service/SpeakerService.java`)
- Added `UserRepository` dependency
- Added `isCurrentUserPremium()` helper method that checks authentication via `SecurityContextHolder`
- Updated `getAllSpeakers()` to filter premium speakers for non-premium users using Java Streams

**How it Works:**
- Collections and lectures inherit premium status from their parent speaker
- Non-premium users cannot see premium speakers in the speakers list
- Since speakers are hidden, collections and lectures become inaccessible through normal navigation
- Premium users see all content, including premium speakers

---

### 2. **Completed Full Speaker Upload Pipeline to Production**

**Goal:** Upload new speaker (Abdulrahman Hassan) from local files to production, making him visible in the live app.

#### The Complete Flow:

```
Local Files → Generate Manifest → Upload to R2 → Import to Database
    ↓              ↓                   ↓               ↓
  content/    manifest.json      Cloudflare R2    Railway PostgreSQL
```

#### Steps Executed:

1. **Content Organization:**
   - Located speaker folder: `test_upload/Abdulrahman Hassan/`
   - Structure: speaker images, bio.txt, collection folder with cover images, description.txt, and 5 lecture MP3s

2. **Generated Manifest:**
   ```bash
   ./scripts/generate_manifest.sh test_upload/
   ```
   - Created `manifest.json` with all metadata (speaker bio, collection descriptions, lecture durations, etc.)

3. **Uploaded to R2 Storage:**
   ```bash
   ./scripts/upload_to_r2.sh test_upload/
   ```
   - Uploaded speaker images, collection covers, and 5 lecture MP3s
   - Files stored at: `elmify-audio/speakers/abdulrahman-hassan/...`

4. **Imported to Local Database (Testing):**
   ```bash
   node scripts/import_manifest.js
   ```
   - Imported to local PostgreSQL (`localhost:5432/elmify_db`)
   - Verified locally with running backend

5. **Imported to Production Database:**
   ```bash
   DATABASE_URL="postgresql://postgres:***@switchback.proxy.rlwy.net:56230/railway" \
   node scripts/import_manifest.js
   ```
   - Successfully imported to Railway production database
   - Speaker ID: 21, Collection ID: 49, 5 lectures imported

---

## 🔧 Files Modified

### Backend (elmify-backend):

1. **`src/main/java/com/elmify/backend/entity/Collection.java`**
   - Added `isPremium()` helper method

2. **`src/main/java/com/elmify/backend/entity/Lecture.java`**
   - Added `isPremium()` helper method

3. **`src/main/java/com/elmify/backend/service/SpeakerService.java`**
   - Added imports: `User`, `UserRepository`, `PageImpl`, `Authentication`, `SecurityContextHolder`, `List`, `Collectors`
   - Added `UserRepository` dependency injection
   - Added `isCurrentUserPremium()` method
   - Updated `getAllSpeakers()` with premium filtering logic

### Frontend Scripts (elmify-frontend):

4. **`scripts/upload_to_r2.sh:288`**
   - Added `--remote` flag to `wrangler r2 object put` command
   - Fixed: Was uploading to local R2 instead of Cloudflare production

5. **`scripts/import_manifest.js:12-25`**
   - Updated database config to support both local and Railway
   - Added `DATABASE_URL` environment variable support with SSL configuration

### Database Changes:

6. **Abdulrahman Hassan marked as non-premium:**
   ```sql
   UPDATE speakers SET is_premium = false WHERE name = 'Abdulrahman Hassan';
   ```

---

## ⚠️ Pitfalls & Problems Encountered

### 1. **R2 Upload to Wrong Location**
- **Problem:** Upload script was missing `--remote` flag, uploaded to local R2 instance instead of Cloudflare
- **Symptom:** Files appeared to upload successfully, but `wrangler r2 object get --remote` couldn't find them
- **Fix:** Added `--remote` flag to line 288 of `upload_to_r2.sh`

### 2. **Uploaded Too Many Speakers**
- **Problem:** Script processed entire `content/` directory instead of just test speaker
- **User Feedback:** "you are uploading too much right now I only wanted the one folder to test"
- **Fix:** Created separate `test_upload/` directory with only Abdulrahman Hassan

### 3. **R2 Propagation Delay**
- **Problem:** Files uploaded successfully but couldn't be downloaded immediately
- **Root Cause:** R2 has 2-3 second propagation delay after upload
- **Fix:** Added `sleep 3` delay before attempting download verification

### 4. **Speaker Not Visible in Application**
- **Problem:** After upload, speaker didn't appear in frontend
- **Root Cause:** Files were in R2, but metadata was NOT in database (backend reads from PostgreSQL, not R2)
- **Fix:** Created and ran `import_manifest.js` script

### 5. **Database Constraint Error During Import**
- **Error:** `there is no unique or exclusion constraint matching the ON CONFLICT specification`
- **Problem:** Tried to use `ON CONFLICT (collection_id, lecture_number)` but constraint doesn't exist
- **Fix:** Changed strategy to check for existing lectures first, then insert only if not found

### 6. **Local vs Production Database Confusion**
- **Major Pitfall:** Imported to local database first, thought it would appear in production
- **User Question:** "how is new speakers pushed to the database on railway? I can not see Abdulrahman Hassan"
- **Root Cause:** Didn't understand the separation between local and production databases
- **Fix:** Updated `import_manifest.js` to support `DATABASE_URL` environment variable, ran import against Railway

### 7. **Railway Database URL Confusion**
- **Problem:** Two DATABASE_URL options provided
- **Issue:** `postgres.railway.internal:5432` (internal) vs `switchback.proxy.rlwy.net:56230` (public)
- **Fix:** Clarified that public proxy URL is needed for local machine connections

### 8. **Backend Startup Issues**
- **Problem 1:** Java version mismatch (Maven using Java 17, project requires Java 21)
  - **Fix:** Set `JAVA_HOME` to Corretto 21 installation path
- **Problem 2:** Missing `CLERK_JWT_ISSUER` environment variable
  - **Fix:** Created `.env` file (but Spring Boot doesn't auto-load it), then passed env var directly in command
  - **Working Command:** `CLERK_JWT_ISSUER="https://clerk.elmify.store" ./mvnw spring-boot:run`

### 9. **Environment Variables Not Loading**
- **Problem:** Created `.env` file but Spring Boot didn't read it
- **Root Cause:** Spring Boot requires additional dependency (like `spring-boot-dotenv`) to auto-load `.env` files
- **Workaround:** Pass environment variables directly in command line

---

## 📋 Key Learnings

### Database Architecture:
- **Local Database:** `localhost:5432/elmify_db` (for development/testing)
- **Production Database:** Railway PostgreSQL (accessed via public proxy URL)
- **Important:** Changes to local database do NOT affect production

### R2 Storage:
- Always use `--remote` flag for production uploads
- R2 has a 2-3 second propagation delay
- Files and metadata are separate: R2 stores files, PostgreSQL stores metadata

### The Complete Upload Pipeline:
```bash
# Step 1: Generate manifest from content
./scripts/generate_manifest.sh content/

# Step 2: Upload files to R2
./scripts/upload_to_r2.sh content/

# Step 3: Import metadata to production database
DATABASE_URL="your_railway_url" node scripts/import_manifest.js
```

### Premium Content System:
- Speaker's `is_premium` flag cascades to all collections and lectures
- Filtering happens at API service layer based on authenticated user's premium status
- Non-premium users: premium speakers filtered out → collections/lectures inaccessible
- Premium users: see all content

---

## ✅ Final Status

**Production System:**
- ✅ Abdulrahman Hassan live with 1 collection and 5 lectures
- ✅ Premium filtering active (currently marked as non-premium for all users)
- ✅ Files stored in Cloudflare R2
- ✅ Metadata in Railway PostgreSQL
- ✅ Backend serving content via API

**Local Development:**
- ✅ Backend running on `localhost:8081`
- ✅ Same data in local database for testing
- ✅ Premium filtering can be tested locally

**To Make a User Premium:**
```sql
-- Via Railway Query interface or CLI:
UPDATE users SET is_premium = true WHERE email = 'user@example.com';
```

**To Make a Speaker Premium:**
```sql
UPDATE speakers SET is_premium = true WHERE name = 'Speaker Name';
```

---

## 🚀 Quick Reference Commands

### Upload New Speaker to Production:
```bash
# 1. Generate manifest
./scripts/generate_manifest.sh content/

# 2. Upload to R2 (Cloudflare)
./scripts/upload_to_r2.sh content/

# 3. Import to Railway database
DATABASE_URL="postgresql://postgres:***@switchback.proxy.rlwy.net:56230/railway" \
node scripts/import_manifest.js
```

### Start Backend Locally:
```bash
cd elmify-backend
JAVA_HOME="/Users/alanhabib/Library/Java/JavaVirtualMachines/corretto-21.0.3/Contents/Home" \
CLERK_JWT_ISSUER="https://clerk.elmify.store" \
./mvnw spring-boot:run
```

### Database Operations:
```bash
# Local database
psql -h localhost -U alanhabib -d elmify_db

# Railway database (via CLI)
railway run psql $DATABASE_URL
```
