# Quick Start: Import Your Existing R2 Content

## Your Situation

You have content already uploaded to R2 in this structure:

```
Abdul Rashid Sufi/
  Quran Hafs/
    01 - Al-Fatiha.mp3
    collection.jpg
  speaker.jpg

Abdulrahman Hassan/
  Seerah of Prophet Muhammad ﷺ/
    01 - Introduction.mp3
  speaker.jpg
```

But your **PostgreSQL database is empty**, so your app shows nothing.

---

## Solution: 2-Step Process

### Step 1: Scan R2 and Generate Metadata

```bash
cd scripts/

# Scan your R2 bucket
node scan_legacy_r2_structure.js

# Output: r2_legacy_manifest.json
```

This will:

- ✅ Read all files from your R2 bucket
- ✅ Extract speaker names (Abdul Rashid Sufi, Abdulrahman Hassan, etc.)
- ✅ Extract collection names (Quran Hafs, Seerah of Prophet Muhammad, etc.)
- ✅ Parse lecture info from filenames
- ✅ Create a JSON file with all metadata

### Step 2: Import to PostgreSQL

```bash
# Import to Railway database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@switchback.proxy.rlwy.net:56230/railway" \
  node import_manifest.js r2_legacy_manifest.json
```

**That's it!** Your app will now show all speakers, collections, and lectures.

---

## What Gets Created in PostgreSQL

After import, your database will have:

**Speakers Table:**

```sql
id | name                  | image_url
1  | Abdul Rashid Sufi     | Abdul Rashid Sufi/speaker.jpg
2  | Abdulrahman Hassan    | Abdulrahman Hassan/speaker.jpg
3  | Ahmad Jibril          | Ahmad Jibril/speaker.jpg
4  | Anwar Awlaki          | Anwar Awlaki/speaker.jpg
5  | Badr al-Turki         | Badr al-Turki/speaker.jpeg
6  | Bilal Assad           | Bilal Assad/speaker.jpg
7  | Feiz Muhammad         | Feiz Muhammad/speaker.jpg
8  | Maher al-Muaiqly      | Maher al-Muaiqly/speaker.png
```

**Collections Table:**

```sql
id | speaker_id | title                              | cover_image_url
1  | 1          | Quran Hafs                         | Abdul Rashid Sufi/Quran Hafs/collection.jpg
2  | 2          | Seerah of Prophet Muhammad ﷺ       | Abdulrahman Hassan/Seerah.../collection.jpg
3  | 3          | Legends Islam                      | Ahmad Jibril/Legends Islam/collection.jpg
...
```

**Lectures Table:**

```sql
id | collection_id | lecture_number | title                      | file_path
1  | 1             | 1              | Al-Fatiha (The opener)     | Abdul Rashid Sufi/Quran Hafs/01 - Al-Fatiha.mp3
2  | 1             | 2              | Al-Baqarah (The cow)       | Abdul Rashid Sufi/Quran Hafs/02 - Al-Baqarah.mp3
...
```

---

## Expected Output

When you run the scan, you should see:

```
🔍 Legacy R2 Structure Scanner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪣 Bucket: elmify-audio
📝 Output: r2_legacy_manifest.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Listing files from R2...
✅ Found 1247 files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
   Speakers:    8
   Collections: 20
   Lectures:    1200+
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Saved to: r2_legacy_manifest.json

📋 Speakers found:
   • Abdul Rashid Sufi (1 collections)
   • Abdulrahman Hassan (1 collections)
   • Ahmad Jibril (1 collections)
   • Anwar Awlaki (5 collections)
   • Badr al-Turki (1 collections)
   • Bilal Assad (1 collections)
   • Feiz Muhammad (1 collections)
   • Maher al-Muaiqly (1 collections)

⚠️  NEXT STEPS:
   1. Review the manifest file (add bios, descriptions, etc.)
   2. Import to database:
      DATABASE_URL="..." node import_manifest.js r2_legacy_manifest.json
```

---

## Troubleshooting

### "Wrangler not found"

```bash
npm install -g wrangler
wrangler login
```

### "DATABASE_URL not set"

Get your database URL from Railway:

1. Go to Railway dashboard
2. Click on your PostgreSQL service
3. Go to "Variables" tab
4. Copy `DATABASE_URL`

### "Connection refused"

Make sure your Railway PostgreSQL is running and accessible.

---

## After Import

Your app will immediately work! Test it:

1. Open your app
2. Navigate to speakers screen
3. You should see all 8 speakers
4. Click on any speaker → see their collections
5. Click on any collection → see lectures
6. Play any lecture → streams from R2

---

## Notes

- The scan script reads **file paths only** - it doesn't download files
- It infers metadata from **filenames and folder structure**
- Speaker bios and collection descriptions will be `null` (you can add them later)
- The import script uses `ON CONFLICT` - safe to run multiple times
- File paths in the database point to your **current R2 structure** (no migration needed!)

---

## One-Line Summary

**Your R2 has files → PostgreSQL needs metadata → This script bridges the gap**

```bash
# One command to rule them all:
node scripts/scan_legacy_r2_structure.js && \
DATABASE_URL="postgresql://..." node scripts/import_manifest.js r2_legacy_manifest.json
```

Done! 🎉
